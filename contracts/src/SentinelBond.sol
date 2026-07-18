// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * SentinelBond — the staked bond behind high-confidence `allow` decisions.
 *
 * Deliberately minimal (see the SENTINEL brief §5.8). The contract is CUSTODY
 * and PAYOUT only, never judgment:
 *   - deposit()      operator seeds the USDT pool
 *   - approveClaim() operator-gated payout for an upheld dispute
 *   - withdraw()     operator pulls funds, behind a 7-day timelock so the pool
 *                    cannot vanish mid-dispute
 *
 * Claims intake and adjudication are OFF-CHAIN (the API's `disputes` table;
 * escalation goes to OKX's own arbitration). This contract does not decide who
 * is right — it only holds the stake and pays approved claims.
 *
 * Bond economics are enforced here as caps, matching the brief:
 *   - 5 USDT max per incident
 *   - 25 USDT max per claimant per rolling 7 days
 * (The 10x-fee coverage figure is computed off-chain; on-chain we enforce the
 *  hard caps so a bug or bad actor cannot drain more than the ceiling.)
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract SentinelBond {
    // --- config ---
    IERC20 public immutable token; // USDT on X Layer
    address public operator;

    uint256 public constant MAX_PER_INCIDENT = 5e6; // 5 USDT (6 decimals)
    uint256 public constant MAX_PER_CLAIMANT_PER_WEEK = 25e6; // 25 USDT
    uint256 public constant WITHDRAW_TIMELOCK = 7 days;
    uint256 public constant CLAIM_WINDOW = 7 days;

    // --- state ---
    uint256 public totalDeposited;
    uint256 public totalPaid;

    // verdictHash => already paid, prevents double-claim on one verdict
    mapping(bytes32 => bool) public claimPaid;
    // claimant => rolling window accounting
    mapping(address => uint256) public claimantWindowStart;
    mapping(address => uint256) public claimantWindowPaid;

    // pending withdrawal (timelocked)
    uint256 public withdrawUnlockAt;
    uint256 public withdrawAmount;
    address public withdrawTo;

    // --- reentrancy guard ---
    uint256 private _locked = 1;
    modifier nonReentrant() {
        require(_locked == 1, "reentrant");
        _locked = 2;
        _;
        _locked = 1;
    }

    modifier onlyOperator() {
        require(msg.sender == operator, "not operator");
        _;
    }

    // --- events ---
    event Deposited(address indexed from, uint256 amount, uint256 totalDeposited);
    event ClaimApproved(bytes32 indexed verdictHash, address indexed claimant, uint256 amount);
    event WithdrawQueued(address indexed to, uint256 amount, uint256 unlockAt);
    event WithdrawExecuted(address indexed to, uint256 amount);
    event WithdrawCancelled();
    event OperatorTransferred(address indexed from, address indexed to);

    constructor(address _token, address _operator) {
        require(_token != address(0) && _operator != address(0), "zero addr");
        token = IERC20(_token);
        operator = _operator;
    }

    /// Operator seeds the pool. Caller must have approved this contract for `amount`.
    function deposit(uint256 amount) external onlyOperator nonReentrant {
        require(amount > 0, "zero amount");
        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom failed");
        totalDeposited += amount;
        emit Deposited(msg.sender, amount, totalDeposited);
    }

    /**
     * Pay an upheld claim. Operator-gated: the operator has already adjudicated
     * (or OKX arbitration has) off-chain. Enforces per-incident and per-claimant
     * rolling caps, and prevents paying the same verdict twice.
     */
    function approveClaim(address claimant, uint256 amount, bytes32 verdictHash)
        external
        onlyOperator
        nonReentrant
    {
        require(claimant != address(0), "zero claimant");
        require(amount > 0 && amount <= MAX_PER_INCIDENT, "amount over incident cap");
        require(!claimPaid[verdictHash], "verdict already paid");
        require(amount <= availableBalance(), "insufficient pool");

        // rolling weekly window per claimant
        if (block.timestamp - claimantWindowStart[claimant] >= CLAIM_WINDOW) {
            claimantWindowStart[claimant] = block.timestamp;
            claimantWindowPaid[claimant] = 0;
        }
        require(claimantWindowPaid[claimant] + amount <= MAX_PER_CLAIMANT_PER_WEEK, "claimant weekly cap");

        claimPaid[verdictHash] = true;
        claimantWindowPaid[claimant] += amount;
        totalPaid += amount;

        require(token.transfer(claimant, amount), "payout failed");
        emit ClaimApproved(verdictHash, claimant, amount);
    }

    /// Funds not yet paid out. (Queued withdrawals are still claimable until executed.)
    function availableBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    // --- timelocked withdrawal ---

    /// Queue a withdrawal. Executable only after WITHDRAW_TIMELOCK, so the pool
    /// cannot be pulled out from under an open dispute.
    function queueWithdraw(address to, uint256 amount) external onlyOperator {
        require(to != address(0), "zero addr");
        require(amount > 0, "zero amount");
        withdrawTo = to;
        withdrawAmount = amount;
        withdrawUnlockAt = block.timestamp + WITHDRAW_TIMELOCK;
        emit WithdrawQueued(to, amount, withdrawUnlockAt);
    }

    function executeWithdraw() external onlyOperator nonReentrant {
        require(withdrawUnlockAt != 0, "no pending withdraw");
        require(block.timestamp >= withdrawUnlockAt, "timelock active");
        uint256 amount = withdrawAmount;
        address to = withdrawTo;
        require(amount <= availableBalance(), "insufficient pool");

        withdrawUnlockAt = 0;
        withdrawAmount = 0;
        withdrawTo = address(0);

        require(token.transfer(to, amount), "withdraw failed");
        emit WithdrawExecuted(to, amount);
    }

    function cancelWithdraw() external onlyOperator {
        withdrawUnlockAt = 0;
        withdrawAmount = 0;
        withdrawTo = address(0);
        emit WithdrawCancelled();
    }

    function transferOperator(address newOperator) external onlyOperator {
        require(newOperator != address(0), "zero addr");
        emit OperatorTransferred(operator, newOperator);
        operator = newOperator;
    }
}
