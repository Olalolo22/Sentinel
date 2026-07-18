// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SentinelBond, IERC20} from "../src/SentinelBond.sol";

contract MockUSDT is IERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "balance");
        require(allowance[from][msg.sender] >= amount, "allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract SentinelBondTest is Test {
    MockUSDT token;
    SentinelBond bond;
    address operator = address(0xA11CE);
    address claimant = address(0xB0B);

    bytes32 constant VH1 = keccak256("verdict-1");
    bytes32 constant VH2 = keccak256("verdict-2");

    function setUp() public {
        token = new MockUSDT();
        bond = new SentinelBond(address(token), operator);
        token.mint(operator, 200e6);
        vm.startPrank(operator);
        token.approve(address(bond), type(uint256).max);
        bond.deposit(200e6);
        vm.stopPrank();
    }

    function test_deposit() public view {
        assertEq(bond.totalDeposited(), 200e6);
        assertEq(bond.availableBalance(), 200e6);
    }

    function test_approveClaim_paysWithinCaps() public {
        vm.prank(operator);
        bond.approveClaim(claimant, 5e6, VH1);
        assertEq(token.balanceOf(claimant), 5e6);
        assertEq(bond.totalPaid(), 5e6);
        assertTrue(bond.claimPaid(VH1));
    }

    function test_approveClaim_rejectsOverIncidentCap() public {
        vm.prank(operator);
        vm.expectRevert("amount over incident cap");
        bond.approveClaim(claimant, 6e6, VH1);
    }

    function test_approveClaim_rejectsDoublePay() public {
        vm.startPrank(operator);
        bond.approveClaim(claimant, 5e6, VH1);
        vm.expectRevert("verdict already paid");
        bond.approveClaim(claimant, 5e6, VH1);
        vm.stopPrank();
    }

    function test_approveClaim_enforcesWeeklyCap() public {
        vm.startPrank(operator);
        // 5 incidents of 5 USDT = 25 (the weekly cap), all distinct verdicts
        bond.approveClaim(claimant, 5e6, keccak256("v1"));
        bond.approveClaim(claimant, 5e6, keccak256("v2"));
        bond.approveClaim(claimant, 5e6, keccak256("v3"));
        bond.approveClaim(claimant, 5e6, keccak256("v4"));
        bond.approveClaim(claimant, 5e6, keccak256("v5"));
        assertEq(bond.claimantWindowPaid(claimant), 25e6);
        // 6th within the same week exceeds the 25 USDT cap
        vm.expectRevert("claimant weekly cap");
        bond.approveClaim(claimant, 5e6, keccak256("v6"));
        vm.stopPrank();
    }

    function test_weeklyCap_resetsAfterWindow() public {
        vm.startPrank(operator);
        bond.approveClaim(claimant, 5e6, keccak256("v1"));
        vm.warp(block.timestamp + 7 days + 1);
        bond.approveClaim(claimant, 5e6, keccak256("v2"));
        assertEq(bond.claimantWindowPaid(claimant), 5e6);
        vm.stopPrank();
    }

    function test_onlyOperator_canApprove() public {
        vm.prank(claimant);
        vm.expectRevert("not operator");
        bond.approveClaim(claimant, 5e6, VH1);
    }

    function test_withdraw_respectsTimelock() public {
        vm.startPrank(operator);
        bond.queueWithdraw(operator, 50e6);
        vm.expectRevert("timelock active");
        bond.executeWithdraw();
        vm.warp(block.timestamp + 7 days);
        bond.executeWithdraw();
        assertEq(token.balanceOf(operator), 50e6);
        vm.stopPrank();
    }

    function test_withdraw_canBeCancelled() public {
        vm.startPrank(operator);
        bond.queueWithdraw(operator, 50e6);
        bond.cancelWithdraw();
        vm.warp(block.timestamp + 8 days);
        vm.expectRevert("no pending withdraw");
        bond.executeWithdraw();
        vm.stopPrank();
    }

    function test_transferOperator() public {
        vm.prank(operator);
        bond.transferOperator(claimant);
        assertEq(bond.operator(), claimant);
    }
}
