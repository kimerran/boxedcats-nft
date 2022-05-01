const { expect } = require("chai");
const { ethers } = require("hardhat");

async function getSigners() {
  const [owner, addr1, addr2, addr3] = await ethers.getSigners();
  return {
    owner,
    addr1,
    addr2,
    addr3,
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
    "ipfs://xxx/",
    "ipfs://xxx/hidden.json"
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

    expect(initialcost).to.equal(ethers.utils.parseEther("0.69"));
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
    const mintAmount = 100
    await contract.mint(mintAmount)
    const tokenBalance = await contract.balanceOf(owner.address)
    expect(mintAmount).to.equal(tokenBalance)
    await balanceLog(owner.address)

    // unrevealed
    const tokenUri = await contract.tokenURI(100)
    console.log('tokenUri 100', tokenUri)

    // reveal
    await contract.reveal()
    const tokenUri2 = await contract.tokenURI(100)
    console.log('tokenUri revealed 100', tokenUri2)


  });

  it('Co-owner: Mint', async() => {
    const { owner, addr1 , addr2 } = await getSigners();
    await contract.pause(true)
    // start minting
    await contract.pause(false)
    await balanceLog(addr1.address)

    const mintAmount = 100
    await contract.connect(owner).setCoOwner(addr1.address)
    await balanceLog(addr1.address)

    await contract.connect(addr1).mint(mintAmount)

    const tokenBalance = await contract.balanceOf(addr1.address)
    console.log('Co-owner minted', tokenBalance)
    await balanceLog(addr1.address)

  })

  it('WL: Mint success', async () => {
    const { owner, addr1 , addr2 } = await getSigners();
    console.log(contract.address)

    // start minting
    await contract.pause(false)
    // await balanceLog(addr2.address)

    // whitelist addr2
    await contract.connect(owner).whitelistUsers([addr2.address])

    const mintAmount = 9;
    const mintCost = 0.69;
    const value = (mintAmount*mintCost).toFixed(2)
    await contract.connect(addr2).mint(mintAmount, {value: toWei(String(value))})

    const tokenBalance = await contract.balanceOf(addr2.address)
    expect(tokenBalance).to.equal(mintAmount);
    await balanceLog(addr2.address) 
    
    const value2 = (1*mintCost).toFixed(2)
    await contract.connect(addr2).mint(1, {value: toWei(value2)})
    // await balanceLog(addr2.address) 
  })

  it('Public Mint', async() => {
    const { owner, addr2, addr3  } = await getSigners();
    console.log(contract.address)

    await contract.connect(owner).pause(false)
    await contract.connect(owner).setPublicMinting()

    const isCoOwner2 = await contract.connect(owner).coOwnerAddress(addr2.address)
    console.log('isCoOwner2', isCoOwner2)

    const mintAmount = 100;
    const mintCost = 1;
    const value = (mintAmount*mintCost).toFixed(2)
    await balanceLog(addr3.address)
    console.log('value', value)
    await contract.connect(addr3).mint(mintAmount, {value: toWei(String(value))})

    const totalSupply = await contract.connect(owner).totalSupply()
    console.log('total suppy>>>>', totalSupply)

  })

});


