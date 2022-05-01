require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-etherscan");

async function main() {
    const deployers = await ethers.getSigners();
    const deployer = deployers[2] //BCOS-Owner
  
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
  
    const Contract = await ethers.getContractFactory("BoxedCatsNFT");

    const contract = await Contract.connect(deployer)
    .deploy(
        'Boxed Cats Of Society', 
        'BCOS', 
        process.env.NFT_BASE_URI,
        process.env.NFT_HIDDEN_META
    );
  
    console.log("Contract address:", contract.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });