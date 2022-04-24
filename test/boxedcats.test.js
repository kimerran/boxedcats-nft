const { expect } = require("chai");
const { ethers } = require("hardhat");

async function getSigners() {
  const [owner, addr1, addr2] = await ethers.getSigners();
  return {
    owner,
    addr1,
    addr2
  }
}
function toEth(weiValue) { return ethers.utils.formatEther(weiValue); }
function toWei(ethValue) { return ethers.utils.parseEther(ethValue)}
async function balanceLog(address) {
  const balance = await provider.getBalance(address);
  console.log(`[LOG] BALANCE: ${toEth(balance)}`)
  return;
}

let BoxedCatsNFT;
let contract;
// let owner, addr1, addr2;
provider = ethers.provider;

beforeEach(async () => {
  BoxedCatsNFT = await ethers.getContractFactory("BoxedCatsNFT");
  contract = await BoxedCatsNFT.deploy(
    "Boxed Cats of Society", 
    "BCOS",
    "ipfs://pinata_URI_HERE/",
    "ipfs://not_revealed_uri/1.json"
    );
  await contract.deployed();
})

describe("BCOS:Deployment + Owner management", async function () {
  it("Should deploy with correct init", async () => {
    const { owner, addr1 , addr2 }= await getSigners();

    const initialcost = await contract.cost();
    const maxSupply = await contract.maxSupply();
    const maxMintAmount = await contract.maxMintAmount();
    const revealed = await contract.revealed();
    const paused = await contract.paused();
    const isLimitedMintingOnly = await contract.isLimitedMintingOnly();

    expect(initialcost).to.equal(ethers.utils.parseEther("0.5"));
    expect(maxSupply).to.equal(9999);
    expect(maxMintAmount).to.equal(100);
    expect(revealed).to.equal(false);
    expect(paused).to.equal(true);
    expect(isLimitedMintingOnly).to.equal(true);
  });

  it('Owner: Mint', async() => {
    const { owner, addr1 , addr2 } = await getSigners();
    await balanceLog(owner.address)

    // start minting
    await contract.pause(false)

    // owner mint should be free
    const mintAmount = 5
    await contract.mint(mintAmount)
    const tokenBalance = await contract.balanceOf(owner.address)
    expect(mintAmount).to.equal(tokenBalance)
    await balanceLog(owner.address)
  });

  it('Co-owner: Mint', async() => {

  })

  it('WL: Mint success', async () => {
    const { owner, addr1 , addr2 } = await getSigners();
    // start minting
    await contract.pause(false)
    await balanceLog(addr2.address)

    await contract.connect(owner)
      .whitelistUsers([addr2.address])

    const mintAmount = 5;
    const mintCost = 0.5;
    await contract.connect(addr2)
    .mint(mintAmount, {value: toWei(String(mintAmount*mintCost))})

    const tokenBalance = await contract.balanceOf(addr2.address)
    console.log(tokenBalance)
    expect(tokenBalance).to.equal(mintAmount);

    await balanceLog(addr1.address)    
  })

  // it('WL:')


});


