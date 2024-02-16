const { assert } = require("chai");
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

    flashLoan.on("LoanReceived", (amount) => {
      console.log("Loan:", amount.toString(), "WEI");
    });
    flashLoan.on("LoanFee", (amount) => {
      console.log("Loan Fee:", amount.toString(), "WEI");
    });

    dai_addr = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    dai_whale_addr = "0x60FaAe176336dAb62e284Fe19B885B095d29fB7F";

    dai = await ethers.getContractAt("IERC20", dai_addr);

    dai_whale = await ethers.getImpersonatedSigner(dai_whale_addr);
    await deployer.sendTransaction({
      to: dai_whale.address,
      value: ethers.parseEther("50.0"),
    });
  });

  it("FlashLoan contract request loan and pay back with 5% loan fee", async () => {
    const loanAmount = ethers.parseUnits("1", 4);

    await dai.connect(dai_whale).transfer(flashLoan, loanAmount * 5n / 10000n + 1n);
    await flashLoan.requestFlashLoan(dai_addr, loanAmount);

    const balanceOfFlashLoan = await flashLoan.getBalance(dai_addr);
    console.log("Balance of remaining DAI: ", balanceOfFlashLoan.toString(), "WEI");

    await flashLoan.withdraw(dai_addr, {from: deployer});
    const balanceOfDeployer = await dai.balanceOf(deployer);
    assert.equal(balanceOfDeployer, 1);
  });
});
