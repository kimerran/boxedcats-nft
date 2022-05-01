const { ethers } = require("hardhat");
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");

const WL_ADDRESS = [
  "REDACTED"
]

const bcosAbi = [
    "function whitelistUsers(address[] calldata _users) public onlyOwner"
  ];

async function main() {
    const deployers = await ethers.getSigners();
    const deployer = deployers[2] //BCOS-Owner

    const Contract = new ethers.Contract('0x0b64f40e8ed601e712c2f67d46e4b979a8168453', bcosAbi, deployer)
    const contract = await Contract.connect(deployer)

    const tx = await contract.whitelistUsers(WL_ADDRESS)
    console.log(tx)
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});