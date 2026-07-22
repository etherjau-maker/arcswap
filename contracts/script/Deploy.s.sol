// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CascadexFactory} from "../src/CascadexFactory.sol";
import {CascadexRouter} from "../src/CascadexRouter.sol";

contract DeployCascadex is Script {
    address constant USDC = 0x3600000000000000000000000000000000000000;
    address constant EURC = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        CascadexFactory factory = new CascadexFactory(deployer);
        CascadexRouter router = new CascadexRouter(address(factory));

        factory.createPair(USDC, EURC);

        vm.stopBroadcast();

        console.log("Factory: ", address(factory));
        console.log("Router:  ", address(router));
        console.log("USDC:    ", USDC);
        console.log("EURC:    ", EURC);
        console.log("Pair:    ", factory.getPair(USDC, EURC));
    }
}
