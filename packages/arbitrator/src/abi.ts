export const SentinelBondABI = [
  "function deposit(uint256 amount) external",
  "function approveClaim(address claimant, uint256 amount, bytes32 verdictHash) external",
  "function queueWithdraw(address to, uint256 amount) external",
  "function executeWithdraw() external",
  "function cancelWithdraw() external",
  "function availableBalance() public view returns (uint256)",
  "function claimPaid(bytes32) public view returns (bool)"
];
