# Blockchain indexer learning project

Build a small, realistic blockchain indexer incrementally using TypeScript, Node.js, PostgreSQL, Docker Compose, and ethers.js or viem.

You implement the project. Your mentor explains blockchain concepts, defines a small task, reviews your work, and helps you reason about problems before moving forward.

Start here:

1. Read [Stage 1: Blockchain fundamentals](docs/stage-01-fundamentals.md).
2. Answer its four questions in your own words.
3. Share your answers for review before writing code.
4. Follow the [step-by-step learning guide](docs/learning-guide.md), completing one task at a time.

Use an Ethereum-compatible public testnet or a local development chain. No real cryptocurrency or real financial transactions are required.

## Local setup

Use Node.js 24 LTS and npm. The starter uses TypeScript in strict mode, ESM, tsx for development, and viem for future Ethereum RPC exercises.

```bash
npm ci
cp .env.example .env
npm run dev
npm run typecheck
npm run build
npm start
```

The entry point is `src/main.ts`. It currently prints a readiness message; RPC requests are your Stage 2 exercise. Configure `RPC_URL` in `.env` when you reach that stage. Never commit endpoint credentials.

PostgreSQL and Docker Compose will be added when persistence is introduced in Stage 3. We will start with explicit SQL through `pg` so constraints, transactions, and query plans remain visible. Add an HTTP framework when Stage 7 needs an API; start without NestJS.
