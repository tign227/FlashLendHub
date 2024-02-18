const { ethers } = require("hardhat");

describe("FlashMintWETH", async () => {
  let flashMintWETH;

  beforeEach(async () => {
    const FlashMintWETH = await ethers.getContractFactory("FlashMintWETH");
    flashMintWETH = await FlashMintWETH.deploy();

    flashMintWETH.on("Log", (message, value) => {
      console.log("Message:",message, "Value", value);
    });
  });

  it("FlashMintWETH contract mint WETh10 and pay zero fee", async () => {
        await flashMintWETH.flashMint();
  });
});
