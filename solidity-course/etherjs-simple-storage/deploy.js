const ethers = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  // connect to a blockchain
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  // initiliazed wallet the secure way, but not the best one
  // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // initiliazed wallet the most secure way
  const encryptedJsonKey = fs.readFileSync("./.encryptedJsonKey.json", "utf8");
  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    encryptedJsonKey,
    process.env.PRIVATE_KEY_PASSWORD
  );

  // connect wallet to provider
  wallet = await wallet.connect(provider);

  // get contract informations for deployment
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );
  // creates an object that allows contracts deployments
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

  // deploy the contract
  console.log("Deploying, please wait...");
  const simpleStorage = await contractFactory.deploy();
  console.log(`Contract Address: ${simpleStorage.address}`);
  // console.log("Here's the deployment transaction:");
  // console.log(simpleStorage.deployTransaction);
  // // get transaction receipt (transaction response)
  // const txReceipt = await simpleStorage.deployTransaction.wait(1);
  // console.log("Here's the transaction receipt:");
  // console.log(txReceipt);

  // Get number
  const favNumber = await simpleStorage.retrieve();
  console.log(`Current favorite number: ${favNumber.toString()}`);

  // Update Favorite number
  const txResponse = await simpleStorage.store("22");
  const txReceipt = await txResponse.wait(1);
  const updatedFavNumber = await simpleStorage.retrieve();
  console.log(`Updated Favorite Number is: ${updatedFavNumber.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
