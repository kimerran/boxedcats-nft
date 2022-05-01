require('dotenv').config();

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      accounts: {
        accountsBalance: '105000000000000000000'
      }
    },
    matic: {
      url: process.env.POLYGON_MAINNET_RPC_PROVIDER,
      accounts: {mnemonic: process.env.MATIC_MNEMONIC},
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: {mnemonic: process.env.MUMBAI_MNEMONIC},
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
 }
};
