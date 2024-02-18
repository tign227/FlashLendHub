const { ethers } = require("hardhat");

describe("UniswapFlashSwap", function () {
  let weth_addr;
  let factory_addr;

  let dai_addr;
  let dai;
  let dai_whale_addr;
  let dai_whale;

  let deployer;
  let uniswapFlashSwap;

  beforeEach(async () => {
    dai_addr = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    dai_whale_addr = "0x60FaAe176336dAb62e284Fe19B885B095d29fB7F";

    weth_addr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    factory_addr = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

    [deployer] = await ethers.getSigners();
    console.log("DEPLOYER: ", deployer.address);
    dai = await ethers.getContractAt("@uniswap/v2-core/contracts/interfaces/IERC20.sol:IERC20", dai_addr);
    dai_whale = await ethers.getImpersonatedSigner(dai_whale_addr);
    await deployer.sendTransaction({
      to: dai_whale.address,
      value: ethers.parseEther("50.0"),
    });

    const UniswapFlashSwap = await ethers.getContractFactory(
      "UniswapFlashSwap"
    );
    uniswapFlashSwap = await UniswapFlashSwap.deploy(weth_addr, factory_addr);
    //Log event
    uniswapFlashSwap.on("LogValue", (messger, val) => {
      console.log(messger, "======", val);
    });
    uniswapFlashSwap.on("LogAddress", (messger, addr) => {
      console.log(messger, "======", addr);
    });
  });

  it("should perform a flash loan successfully", async function () {
    const loanAmount = ethers.parseUnits("1", 6);
    await dai.connect(dai_whale).transfer(deployer, loanAmount);
    await dai.transfer(uniswapFlashSwap, loanAmount);
    await uniswapFlashSwap.flashloan(dai, loanAmount);
  });
});
