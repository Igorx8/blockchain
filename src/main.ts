import { validateSepolia, processBlock } from "./helper.js";

await validateSepolia();

for (let blockNumber = 11823653n; blockNumber <= 11823655n; blockNumber += 1n) {
  await processBlock(blockNumber);
}
