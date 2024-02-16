const { ethers } = require("hardhat");

describe("FlashLoan", async () => {
  let flashLoan;
  let poolAddressProvider;
  let deployer;

  let dai;
  let dai_addr;
  let dai_whale_addr;
  let dai_whale;

  beforeEach(async () => {
    poolAddressProvider = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";

    const FlashLoan = await ethers.getContractFactory("FlashLoan");
    flashLoan = await FlashLoan.deploy(poolAddressProvider);
    [deployer] = await ethers.getSigners();

    dai_addr = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    dai_whale_addr = "0x60FaAe176336dAb62e284Fe19B885B095d29fB7F";

    dai = await ethers.getContractAt("IERC20", dai_addr);

    dai_whale = await ethers.getImpersonatedSigner(dai_whale_addr);
    await deployer.sendTransaction({
      to: dai_whale.address,
      value: ethers.parseEther("50.0"),
    });
  });

  it("should deploy the FlashLoan contract", async () => {
    const loanAmount = ethers.parseUnits("1", 4);
    await dai
      .connect(dai_whale)
      .transfer(flashLoan, loanAmount);
    await flashLoan.requestFlashLoan(dai_addr, loanAmount);

    const balance = await flashLoan.getBalance(dai_addr);
    console.log("Balance of DAI remaining", balance.toString());
  });
});
