//SPDX-License-Identifier:MIT
pragma solidity ^0.6.6;

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";
import "@uniswap/v2-core/contracts/interfaces/IERC20.sol";

contract UniswapFlashSwap is IUniswapV2Callee {

    address private immutable WETH;
    address private immutable FACTORY;

    event LogValue(string messger, uint val);
    event LogAddress(string messger, address addr);


    constructor(address weth, address factory) public {
        WETH = weth;
        FACTORY = factory;
    }

    function flashloan(address _token, uint256 _amount) external {
        address pair = IUniswapV2Factory(FACTORY).getPair(_token, WETH);
        require(pair != address (0), "pair = address(0) ");
        address token0 = IUniswapV2Pair(pair).token0();
        address token1 = IUniswapV2Pair(pair).token1();
        uint256 amount0Out = token0 == _token ? _amount : 0;
        uint256 amount1Out = token1 == _token ? _amount : 0;
        emit LogAddress("Address of pair in flash load", pair);
        emit LogAddress("MSG.SENDER", msg.sender);
        bytes memory data = abi.encode(_token, _amount);
        //Uniswap treat as flash swap since data is not empty
        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data);
    }

    function uniswapV2Call(address sender, uint amount0, uint amount1, bytes calldata data) external override{
        //msg.sender != address(this), it is the address of UniswapV2Pair
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();
        emit LogAddress("Address of pair in UniswapV2 call", msg.sender);
        address pair = IUniswapV2Factory(FACTORY).getPair(token0, token1);
        require(pair == msg.sender, "Not Pair");
        require(sender == address (this), "Not Sender");
        (address _token, uint256 _amount) = abi.decode(data, (address, uint256));
        uint fee = ((_amount * 3) / 997) + 1;
        uint amountToRepay = _amount + fee;

        LogValue("amount0", amount0);
        LogValue("amount1", amount1);
        LogValue("amount", _amount);
        LogValue("Fee", fee);
        LogValue("Repay Amount", amountToRepay);

        IERC20(_token).transfer(address (pair), amountToRepay);

    }



}

