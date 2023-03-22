import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import * as dotenv from 'dotenv'
dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "arbitrum",
  networks: {
    arbitrum: {
      chainId: 42161,
      url: "https://endpoints.omniatech.io/v1/arbitrum/one/public"
    },
    hardhat: {
      chainId: 42161,
      forking: {
        url: "https://endpoints.omniatech.io/v1/arbitrum/one/public",
      }
    }
  }
};

export default config;
