import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from 'dotenv'
dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 42161,
      forking: {
        url: "https://endpoints.omniatech.io/v1/arbitrum/one/public",
      }

    }
  }
};

export default config;
