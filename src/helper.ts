import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { RPC_URL } from "./constants.js";

const client = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

async function processBlock(blockNumber: bigint) {
  const block = await client.getBlock({
    blockNumber,
  });

  let success = 0;
  let failed = 0;
  let rpcErrors = 0;
  const batchSize = 5;

  for (
    let offset = 0;
    offset < block.transactions.length;
    offset += batchSize
  ) {
    const hashes = block.transactions.slice(offset, offset + batchSize);
    const results = await Promise.allSettled(
      hashes.map((hash) => client.getTransactionReceipt({ hash })),
    );

    for (const [index, result] of results.entries()) {
      if (result.status === "rejected") {
        rpcErrors++;
        console.error("Receipt query failed:", hashes[index], result.reason);
        continue;
      }

      const receipt = result.value;

      if (receipt.status === "success") {
        success++;
      } else {
        failed++;
      }
    }
  }

  console.log(
    "Block number: " + blockNumber,
    "Total: " + block.transactions.length,
    "Success: " + success,
    "Failed: " + failed,
    "RPC errors: " + rpcErrors,
  );

  if (rpcErrors > 0) {
    throw new Error(
      `Block ${blockNumber}: ${rpcErrors} receipts could not be retrieved`,
    );
  }
}

async function validateSepolia() {
  const chainId = await client.getChainId();
  const isSepoliaUrl = chainId === sepolia.id;
  if (!isSepoliaUrl) {
    throw new Error("You must provide a valid sepolia url");
  }
}

export { validateSepolia, processBlock };
