// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SentinelBond} from "../src/SentinelBond.sol";

/**
 * Deploy SentinelBond to X Layer.
 *   forge script script/Deploy.s.sol --rpc-url xlayer_testnet --broadcast
 * Env: PRIVATE_KEY, USDT_ADDRESS, OPERATOR_ADDRESS
 */
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address usdt = vm.envAddress("USDT_ADDRESS");
        address operator = vm.envAddress("OPERATOR_ADDRESS");

        vm.startBroadcast(pk);
        SentinelBond bond = new SentinelBond(usdt, operator);
        vm.stopBroadcast();

        console.log("SentinelBond deployed at:", address(bond));
        console.log("token:", usdt);
        console.log("operator:", operator);
    }
}
