const RPC_URL = process.env.RPC_URL;

if (!RPC_URL) throw new Error("RPC_URL must be defined");

export { RPC_URL };
