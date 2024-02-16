// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

import {IPoolAddressesProvider} from "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import {FlashLoanSimpleReceiverBase} from "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import {IERC20} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol";


contract FlashLoan is FlashLoanSimpleReceiverBase {

    address public owner;

    constructor (address _addressProvider) FlashLoanSimpleReceiverBase (IPoolAddressesProvider(_addressProvider)) {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "not owner");
        _;
    }

    event LoanReceived(uint256 amount);
    event LoanFee(uint256 amount);

    receive() external payable {}

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        emit LoanReceived(amount);
        emit LoanFee(premium);
        uint256 totalAmount = amount + premium;
        IERC20(asset).approve(address(POOL),totalAmount);
        return true;
    }

    function requestFlashLoan(address token, uint256 amount) external{
        POOL.flashLoanSimple(address(this), token, amount, "", 0);
    }

    function getBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function withdraw(address token) external onlyOwner {
        IERC20 asset = IERC20(token);
        asset.transfer(msg.sender, asset.balanceOf(address (this)));
    }


}