import { Wallet, BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Interface, parseEther } from "ethers/lib/utils";

const eligible = require("../eligible.json");

export default async function sign(
  _pk: string,
  _rec: string,
  _tip: string,
  _nonceOffset = 0
) {
  // Wallet
  let privateKey = _pk;

  if (privateKey == "your_first_compromised_private_key")
    throw new Error("Please set your PRIVATE KEY in config.json");

  const signerTarget = new ethers.Wallet(privateKey);

  // Check Recipient

  let recipient = _rec;

  if (recipient == "your_recipient_address")
    throw new Error("Please set your RECIPIENT ADDRESS in config.json");

  // Calculate amounts
  const amount = getAmount(signerTarget.address);
  if (!amount || amount?.isZero())
    throw new Error("This address is not eligible for the airdrop");

  const tipPercent: number = _tip ? parseInt(_tip) : 10;
  if (tipPercent > 50 || isNaN(tipPercent))
    throw new Error("Invalid tip - Not a number or over 50%");
  let tip = amount.mul(tipPercent.toString()).div("100");
  let remain = amount.sub(tip);

  // Get nonces
  const targetStartingNonce = await ethers.provider.getTransactionCount(signerTarget.address) + _nonceOffset
  let claimNonce = targetStartingNonce;
  let tipNonce = targetStartingNonce + 1;
  let remainingNonce = targetStartingNonce + 2;

  // 1. Claim
  let signedClaimTx = await createSignedClaim(signerTarget, claimNonce);

  // 2. Transfer tip
  let signedTipTransferTx = await createSignedTip(signerTarget, tipNonce, tip);

  // 3. Transfer remaining
  let signedRemainingTransferTx = await createSignedRemaining(
    signerTarget,
    remainingNonce,
    recipient,
    remain
  );

  // Export data
  const result =
  {
    addressTarget: signerTarget.address,
    addressRecipient: recipient,
    signedClaimTx: signedClaimTx,
    signedTipTransferTx: signedTipTransferTx,
    signedRemainingTransferTx: signedRemainingTransferTx,
    targetStartingNonce: targetStartingNonce,
    tipAmount: ethers.utils.formatEther(tip),
  }

  return result;
}

function getAmount(address: string) {
  for (let i = 0; i < eligible.length; i++) {
    if (eligible[i]["_recipients"] === address.toLocaleLowerCase()) {
      return parseEther(eligible[i]["_claimableAmount"]);
    }
  }
}

async function createSignedClaim(
  _signerTarget: Wallet,
  _nonce: number,
) {
  // ARB Token Distributor: https://arbiscan.io/address/0x67a24ce4321ab3af51c2d0a4801c3e111d88c9d9
  const tokenDistributor = "0x67a24CE4321aB3aF51c2D0a4801c3E111D88C9d9";

  const claimABI = ["function claim()"];

  const IClaim = new Interface(claimABI);

  // Claim Tx
  let claimCalldata = IClaim.encodeFunctionData("claim", []);

  let claimTransaction = {
    value: 0,
    type: 2,
    chainId: 42161,
    to: tokenDistributor,
    gasLimit: "1500000",
    maxPriorityFeePerGas: "0",
    maxFeePerGas: "451337000",
    nonce: _nonce,
    data: claimCalldata,
  };

  return await _signerTarget.signTransaction(claimTransaction);
}

async function createSignedTip(
  _signerTarget: Wallet,
  _nonce: number,
  _tip: BigNumber,
) {
  // The ARB Token: https://arbiscan.io/address/0x912ce59144191c1204e64559fe8253a0e49e6548
  const tokenAddress = "0x912CE59144191C1204E64559FE8253a0e49E6548";

  // Interfaces
  const tokenABI = [
    "function transfer(address to, uint amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
  ];

  const IToken = new Interface(tokenABI);

  // Send Tip Transaction

  let transferTipCalldata = IToken.encodeFunctionData("transfer", [
    "0x8503666A6D1D7b8703a9E7727Dc17aC03867907E",
    _tip,
  ]);

  let transferTipTransaction = {
    to: tokenAddress,
    value: 0,
    gasLimit: "600000",
    maxPriorityFeePerGas: "0",
    maxFeePerGas: "451337000",
    nonce: _nonce,
    type: 2,
    chainId: 42161,
    data: transferTipCalldata,
  };
  return await _signerTarget.signTransaction(transferTipTransaction);
}

async function createSignedRemaining(
  _signerTarget: Wallet,
  _nonce: number,
  _recipient: string,
  _remain: BigNumber,
) {
  // The ARB Token: https://arbiscan.io/address/0x912ce59144191c1204e64559fe8253a0e49e6548
  const tokenAddress = "0x912CE59144191C1204E64559FE8253a0e49E6548";

  // Interfaces
  const tokenABI = [
    "function transfer(address to, uint amount) returns (bool)",
    "function balanceOf(address owner) view returns (uint256)",
  ];

  const IToken = new Interface(tokenABI);

  // Send Remaining to Recipient
  let transferRemainingCalldata = IToken.encodeFunctionData("transfer", [
    _recipient,
    _remain,
  ]);

  let transferRemainingTransaction = {
    to: tokenAddress,
    value: 0,
    gasLimit: "600000",
    maxPriorityFeePerGas: "0",
    maxFeePerGas: "451337000",
    nonce: _nonce,
    type: 2,
    chainId: 42161,
    data: transferRemainingCalldata,
  };
  return await _signerTarget.signTransaction(transferRemainingTransaction);
}
