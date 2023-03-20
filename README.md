# Clone git repository

`git clone https://github.com/0xpeche/arb-presign-claim.git`\
Or click on the green code button, download zip and unzip

# Fill the config.json file with:

privateKey: your_compromised_private_key \
recipient: your_recipient_address 

If you want to customize the tip I receive: \
tipPercent: 10 \
**(number in percent, whole, under 50)**\

You can put however many addresses you want, just copy paste like so:
```
[
    {
        "privateKey": "your_first_compromised_private_key",
        "recipient": "your_recipient_address",
        "tipPercent": "10"
    },
    {
        "privateKey": "your_second_compromised_private_key",
        "recipient": "your_recipient_address",
        "tipPercent": "10"
    }
]
```

If you make a mistake I will fix it but please try to be acurate.


# Install dependencies
**If you already have node installed:**\
open your terminal at the root of the folder where you downloaded the content of the repository then run:\
(if you do not have yarn installed) \
`npm install --global yarn`\
then\
`yarn`

If you do not have node installed:
https://nodejs.org/en/download \

# Run the script
open your terminal at the root of the folder where you downloaded the content of the repository\
`yarn hardhat run scripts/signWithConfig.ts`\
It will sign the transaction using the private key you provided and save those signatures and some info I will use (like your recipient address, your compromised address, the tip...) to a json file.

# Send

Send me the content of output.json on Twitter


# Disclaimer

## CHECK THE CODE. YOU ARE SIGNING TRANSACTIONS

The first transaction is the claim transaction \
The second transfers the tipped amount back the address I use to fund your compromised wallet \
The third transfers the remaining amount to your recipient address\
\
On my end I will pre-sign the transactions that Funds your wallet\
\
In the end it will look kinda like that:\
- **Transaction 1**: Transfer ETH from Funding Wallet to Compromised Wallet (I handle that) 
- **Transaction 2**: Claim the airdrop
- **Transaction 3**: Transfer the tip to the funding wallet
- **Transaction 4**: Transfer the remainder to your recipient address

## IF YOU SENT NEW TRANSACTIONS AFTER YOU SENT ME THE FILE THIS WILL NOT WORK

Transactions will be sent via my node at L1 Block 16890399 to be included at block 16890400 (the claim period start)