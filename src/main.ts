import { validateSepolia, processBlock } from "./helper.js";

await validateSepolia();

for (let i = 11823653n; i < 11823656; i += 1n) {
  await processBlock(i);
}
