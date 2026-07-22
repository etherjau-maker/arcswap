// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CascadexFactory} from "../src/CascadexFactory.sol";
import {CascadexRouter} from "../src/CascadexRouter.sol";
import {TestToken} from "../src/TestToken.sol";

/// @notice Deploys Cascadex to Arc Testnet: Factory, Router, two demo TestTokens (ARCT, DEMO),
/// and seeds an ARCT/DEMO liquidity pool so the frontend has something to swap immediately.
///
/// Usage:
///   forge script script/Deploy.s.sol:DeployCascadex \
///     --rpc-url https://rpc.testnet.arc.network \
///     --private-key $PRIVATE_KEY \
///     --broadcast
contract DeployCascadex is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        CascadexFactory factory = new CascadexFactory(deployer);
        CascadexRouter router = new CascadexRouter(address(factory));

        // Demo tokens — mint 1,000,000 to the deployer to seed a pool.
        TestToken arct = new TestToken("Cascadex Token", "ARCT", 1_000_000 ether);
        TestToken demo = new TestToken("Demo Token", "DEMO", 1_000_000 ether);

        arct.approve(address(router), type(uint256).max);
        demo.approve(address(router), type(uint256).max);

        router.addLiquidity(
            address(arct),
            address(demo),
            100_000 ether,
            100_000 ether,
            0,
            0,
            deployer,
            block.timestamp + 3600
        );

        vm.stopBroadcast();

        console.log("Factory:  ", address(factory));
        console.log("Router:   ", address(router));
        console.log("ARCT:     ", address(arct));
        console.log("DEMO:     ", address(demo));
        console.log("Pair:     ", factory.getPair(address(arct), address(demo)));
    }
}
