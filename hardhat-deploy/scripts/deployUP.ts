import hre from "hardhat";
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as LSP0ABI from "@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json";

// load env vars
dotenv.config();

async function main() {
  // setup provider
  const provider = new ethers.JsonRpcProvider(
    "https://rpc.testnet.lukso.network"
  );
  // setup signer (the browser extension controller)
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
  console.log("Deploying contracts with EOA: ", signer.address);

  // load the associated UP
  const UP = new ethers.Contract(
    process.env.UP_ADDR as string,
    LSP0ABI.abi,
    signer
  );

  /**
   * Custom LSP7 Token
   */
  const CustomTokenBytecode =
    hre.artifacts.readArtifactSync("CustomToken").bytecode;

  // get the address of the contract that will be created
  const CustomTokenAddress = await UP.connect(signer)
    .getFunction("execute")
    .staticCall(1, ethers.ZeroAddress, 0, CustomTokenBytecode);

  // deploy CustomLSP7 as the UP (signed by the browser extension controller)
  const tx1 = await UP.connect(signer).getFunction("execute")(
    1,
    ethers.ZeroAddress,
    0,
    CustomTokenBytecode
  );

  await tx1.wait();

  console.log("Custom token address: ", CustomTokenAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
