// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;


interface IWETH10 {

    function flashLoan(address receiver, address token, uint256 value, bytes calldata data) external returns(bool);

}