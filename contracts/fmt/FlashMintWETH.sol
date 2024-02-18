// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import "./Interface/IWETH10.sol";
import "./Interface/IERC3156FlashBorrower.sol";
import "@uniswap/v2-core/contracts/interfaces/IERC20.sol";
contract FlashMintWETH is IERC3156FlashBorrower {

    address private immutable WETH10 = 0xf4BB2e28688e89fCcE3c0580D37d36A7672E8A9F;
    bytes32 public immutable CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");

    event Log(string message, uint256 value);
    function flashMint() external {
        IERC20 weth10 = IERC20(WETH10);
        emit Log("Total Supply before mint", weth10.totalSupply());
        uint amount = 1 ether;
        weth10.approve(WETH10, amount);
        IWETH10(WETH10).flashLoan(address(this), WETH10, amount, "");
    }

    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external returns (bytes32){
        emit Log("Borrow Amount:", amount);
        emit Log("Borrow Fee:", fee);
        emit Log("Total Supply after minting:", IERC20(WETH10).totalSupply());
        return CALLBACK_SUCCESS;
    }

}