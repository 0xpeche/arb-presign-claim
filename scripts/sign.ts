import { ethers } from "hardhat";
const eligible = require('../eligible.json');

export default async function sign(_pk: string, _rec: string, _tip: string) {
  // The ARB Token: https://arbiscan.io/address/0x912ce59144191c1204e64559fe8253a0e49e6548
  const tokenAddress = "0x912CE59144191C1204E64559FE8253a0e49E6548"

  // ARB Token Distributor: https://arbiscan.io/address/0x67a24ce4321ab3af51c2d0a4801c3e111d88c9d9
  const tokenDistributor = "0x67a24CE4321aB3aF51c2D0a4801c3E111D88C9d9"

  // Interfaces

  const tokenABI = [
    "function transfer(address to, uint amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
  ];

  const claimABI = [
    "function claim()"
  ];

  const IToken = new ethers.utils.Interface(tokenABI)

  const IClaim = new ethers.utils.Interface(claimABI)

  // Wallet

  let privateKey = _pk

  if (privateKey == "your_first_compromised_private_key") throw new Error("Please set your PRIVATE KEY in config.json")

  const signerTarget = new ethers.Wallet(privateKey)

  // Get current nonce

  const targetStartingNonce = await ethers.provider.getTransactionCount(signerTarget.address)

  // Claim Tx

  let claimCalldata = IClaim.encodeFunctionData("claim", [])

  let claimTransaction = {
    to: tokenDistributor,
    value: 0,
    gasLimit: '2000000',
    maxPriorityFeePerGas: '0',
    maxFeePerGas: '451337000',
    nonce: targetStartingNonce,
    type: 2,
    chainId: 42161,
    data: claimCalldata
  }

  let signedClaimTx = await signerTarget.signTransaction(claimTransaction);

  // Calculate amounts

  let amount = getAmount(signerTarget.address);

  amount = ethers.utils.parseEther(amount)

  if (amount.isZero()) throw new Error("This address is not elligible for the airdrop");

  const tipPercent: number = _tip ? parseInt(_tip) : 10

  if (tipPercent > 50 || isNaN(tipPercent)) throw new Error("Invalid tip - Not a number or over 50%");

  let tip = amount.mul(tipPercent.toString()).div("100")

  let remain = amount.sub(tip)

  // Send Tip Transaction

  let transferTipCalldata = IToken.encodeFunctionData("transfer", ["0x8503666A6D1D7b8703a9E7727Dc17aC03867907E", tip])

  let transferTipTransaction = {
    to: tokenAddress,
    value: 0,
    gasLimit: '700000',
    maxPriorityFeePerGas: '0',
    maxFeePerGas: '451337000',
    nonce: targetStartingNonce + 1,
    type: 2,
    chainId: 42161,
    data: transferTipCalldata
  }

  let signedTipTransferTx = await signerTarget.signTransaction(transferTipTransaction);

  // Check Recipient

  let recipient = _rec

  if (recipient == "your_recipient_address") throw new Error("Please set your RECIPIENT ADDRESS in config.json")

  // Send Remaining to Recipient

  let transferRemainingCalldata = IToken.encodeFunctionData("transfer", [recipient, remain])

  let transferRemainingTransaction = {
    to: tokenAddress,
    value: 0,
    gasLimit: '700000',
    maxPriorityFeePerGas: '0',
    maxFeePerGas: '451337000',
    nonce: targetStartingNonce + 2,
    type: 2,
    chainId: 42161,
    data: transferRemainingCalldata
  }

  let signedRemainingTransferTx = await signerTarget.signTransaction(transferRemainingTransaction);

  // Export data

  const result = [{
    "addressTarget": signerTarget.address,
    "addressRecipient": recipient,
    "signedClaimTx": signedClaimTx,
    "signedTipTransferTx": signedTipTransferTx,
    "signedRemainingTransferTx": signedRemainingTransferTx,
    "targetStartingNonce": targetStartingNonce,
    "tipAmount": ethers.utils.formatEther(tip)
  }]

  const fs = require('fs');

  fs.readFile('output.json', function (err: any, data: any) {
    var json = JSON.parse(data)
    json.push(...result)

    fs.writeFile("output.json", JSON.stringify(json), function (err: any) {
      if (err) throw err;
      console.log(`${signerTarget.address}: Done`);
    });
  })

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

function getAmount(address: string) {
  for (let i = 0; i < eligible.length; i++) {
    if (eligible[i]["_recipients"] === address.toLocaleLowerCase()) {
      return eligible[i]["_claimableAmount"]
    }
  }
}
