# Step-by-step learning guide

## How to use this guide

This is a roadmap, not a request to implement every stage now. The current task is Stage 1's conceptual challenge.

For each stage:

1. Ask your mentor to explain the engineering problem and relevant blockchain concepts.
2. Agree on one small task from the stage.
3. Implement that task yourself.
4. Share your code, how you ran it, its output, and any uncertainties.
5. Review the feedback and reason through issues before changing the code.
6. Explain what you built in your own words.
7. Move forward only after review.

For each new blockchain concept, cover what it is, why it exists, what problem it solves, its closest backend analogy, and where that analogy breaks down.

Keep short notes about decisions, unexpected behavior, and verification results. These will become evidence for your interview explanations.

## Stage 1 — Blockchain fundamentals

- [ ] Read [the fundamentals lesson](stage-01-fundamentals.md).
- [ ] Answer its four questions in your own words.
- [ ] Discuss any misunderstandings with your mentor.
- [ ] Explain what an indexer consumes, produces, and why recent history can change.

**Review checkpoint:** Understand the difference between transaction submission, execution success, inclusion, and finality.

## Stage 2 — Talking to a blockchain node

Complete each task separately, with review between tasks:

- [ ] Choose a safe Ethereum-compatible testnet or local development chain with your mentor.
- [ ] Create a minimal TypeScript/Node.js project using ethers.js or viem.
- [ ] Configure an RPC endpoint and fetch the current block number.
- [ ] Retrieve one specific block and inspect its number, hash, parent hash, and transactions.
- [ ] Retrieve one transaction and inspect its fields.
- [ ] Retrieve its receipt and inspect execution status and logs.
- [ ] Explain which fields describe the submitted instruction and which describe execution results.

**Review checkpoint:** Demonstrate the RPC exploration script and explain its output. Do not build an ingestion loop yet.

## Stage 3 — First indexer

- [ ] Explain how you would choose the initial block and stop at a bounded height.
- [ ] Implement fetching and processing one block.
- [ ] Persist a minimal set of useful block and transaction fields in PostgreSQL.
- [ ] Extend the code into a sequential loop over a small block range.
- [ ] Extend the reviewed loop to poll for new blocks.
- [ ] Explain the ingestion loop from fetching through persistence to advancing.

Use only enough temporary storage design to exercise ingestion. Stage 4 is where you propose the fuller schema. Avoid concurrency and optimization here.

**Review checkpoint:** Inspect persisted records from several consecutive blocks and explain what happens when there is no new block.

## Stage 4 — PostgreSQL data model

- [ ] Describe the queries you want to support.
- [ ] Propose tables for blocks, transactions, addresses, contract events, and indexer state.
- [ ] Propose primary keys, unique constraints, relationships, and indexes yourself.
- [ ] Review the design with your mentor before implementing it.
- [ ] Implement the reviewed schema and adapt ingestion in small changes.
- [ ] Explain how the model serves your query patterns.

**Review checkpoint:** Defend your identifiers, numeric types, relationships, and indexes. Your mentor should ask questions before supplying a schema.

## Stage 5 — Crash recovery

Scenario: the indexer processes blocks 100–200 and crashes after processing block 200.

- [ ] Propose how restart should determine where to continue.
- [ ] Discuss failures between data writes and progress updates.
- [ ] Design checkpointing and idempotency before implementing them.
- [ ] Implement the reviewed approach.
- [ ] Interrupt processing at meaningful points and restart it.
- [ ] Verify that recovery neither skips required data nor creates duplicates.
- [ ] Explain database transactions, unique constraints, and at-least-once processing in this system.

**Review checkpoint:** Show recovery evidence and explain what “processed” means for a block.

## Stage 6 — Smart contract events

- [ ] Select a simple testnet contract with a verified ABI and observable event history, or use a local fixture.
- [ ] Inspect one raw log with your mentor and learn what topics and data encode.
- [ ] Decode one event manually through your chosen library.
- [ ] Detect and persist that event for one block.
- [ ] Extend the reviewed implementation across a small range.
- [ ] Explain the path from raw bytes to typed application data.

**Review checkpoint:** Compare a stored event with its raw log, including emitter, transaction, block, topics, and data.

## Stage 7 — Query API

- [ ] Choose one query and implement it over PostgreSQL.
- [ ] Review its correctness and query plan before adding more endpoints.
- [ ] Incrementally add address transactions, address transfers, and block lookup.
- [ ] Define ordering and pagination behavior.
- [ ] Compare an indexed query with the RPC work needed to answer the same question.
- [ ] Measure the difference where practical and explain the database's freshness tradeoff.

Example endpoints:

```text
GET /address/:address/transactions
GET /address/:address/transfers
GET /blocks/:number
```

**Review checkpoint:** Explain why this API queries an indexed database and how clients interpret incomplete or lagging data.

## Stage 8 — Reorganizations

Scenario:

```text
Indexed:    100 → 101 → 102A → 103A
Canonical:  100 → 101 → 102B → 103B
```

- [ ] Propose how to detect the inconsistency before receiving a solution.
- [ ] Discuss what block hashes and parent hashes tell you.
- [ ] Propose how stored data and progress should change.
- [ ] Implement detection, then rollback, then reprocessing, with review between tasks.
- [ ] Reproduce a controlled reorg in a safe local environment.
- [ ] Verify that queries reflect the replacement history.
- [ ] Explain how confirmation/finality policies affect ingestion and production handling.

**Review checkpoint:** Demonstrate a reorg and recovery without leaving stale derived records.

## Stage 9 — Performance

- [ ] Establish a reproducible query API baseline, using k6 where appropriate.
- [ ] Measure throughput, latency, and errors.
- [ ] Identify one bottleneck using evidence.
- [ ] Investigate query plans and indexes before changing them.
- [ ] Review pooling and caching as needed.
- [ ] Separately investigate RPC batching, concurrency, rate limits, and backpressure.
- [ ] Change one thing at a time and repeat the relevant measurement.
- [ ] Explain what would be required to move from 10 requests/sec toward 1,000+.

**Review checkpoint:** Support performance claims with workload, environment, measurements, and correctness checks. Treat 1,000+ requests/sec as a reasoning target, not an assumed result.

## Stage 10 — Observability

- [ ] Add structured logs for one ingestion path.
- [ ] Define and implement metrics incrementally.
- [ ] Add traces through RPC, processing, and persistence using OpenTelemetry.
- [ ] Observe normal operation, catch-up, and an induced dependency failure.
- [ ] Explain what indexer lag means and what can cause it.

Metrics to cover:

```text
indexed_block_height
blockchain_head_height
indexer_lag
blocks_processed_total
rpc_request_duration
rpc_errors_total
processing_duration
```

**Review checkpoint:** Use telemetry to explain whether the indexer is progressing and where time or failures occur.

## Stage 11 — Architecture review

Have your mentor ask one question at a time. Answer before receiving an explanation:

- [ ] What happens if PostgreSQL goes down?
- [ ] What happens if the RPC provider is unavailable or returns errors?
- [ ] What changes when you are one million blocks behind?
- [ ] Can multiple workers process blocks concurrently, and how does ordering work?
- [ ] Where is idempotency necessary?
- [ ] How would you support multiple chains?
- [ ] How would you scale horizontally?
- [ ] How would you support developer-defined indexes?

**Review checkpoint:** Describe failure behavior and scaling tradeoffs using evidence from your implementation.

## Stage 12 — Connect the project to production infrastructure

- [ ] Explain the responsibilities of RPC providers versus indexers.
- [ ] Compare your materialized data model with subgraphs and GraphQL blockchain APIs.
- [ ] Discuss developer-facing blockchain data platforms.
- [ ] Identify additional production challenges and which ones your project demonstrated.
- [ ] Give an interview-style explanation of how a blockchain indexer works.

**Review checkpoint:** Explain ingestion, RPC, events, storage, recovery, reorgs, query performance, scaling, and observability using the system you actually built.

## Review handoff template

Use this when submitting a completed task:

```text
Stage and task:
What I implemented:
Files to review:
How to run it:
Observed output or verification:
My explanation of how it works:
Questions or uncertainties:
```

Your mentor should first help you reason about mistakes. Full solutions are appropriate only when you explicitly ask for them.
