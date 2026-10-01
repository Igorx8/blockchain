# Stage 1 — Blockchain fundamentals

The engineering problem: how do we turn a network's transaction history into useful database records when its newest history can still change?

Think of our future indexer as a consumer building a materialized view. The blockchain supplies the history; PostgreSQL supplies the query model.

## Block and transaction

A **transaction** is a signed instruction to the network: transfer native currency, deploy a contract, or invoke one. It exists so participants can authorize changes to shared state.

The closest backend analogy is a command submitted for execution. The analogy breaks because submitting it doesn't mean it has executed, and inclusion in a block doesn't mean execution succeeded. A failed transaction can still appear in the history. A **receipt** records its execution outcome, including status and logs. See [Ethereum transactions](https://ethereum.org/developers/docs/transactions/).

A **block** contains an ordered batch of transactions, along with metadata. Three fields matter immediately:

- **Number/height:** its position in the chain.
- **Hash:** a cryptographic identifier for that particular block.
- **Parent hash:** the identifier of the preceding block.

Blocks let the network agree on transaction ordering and resulting state. Think of a batch in a replicated log. The analogy breaks near the newest blocks: competing versions can exist at the same height before the network settles on one history. **A block number describes a position, not a permanent identity.** See [Ethereum blocks](https://ethereum.org/developers/docs/blocks/).

## Wallet and address

An **address** is a public account identifier. On Ethereum, it is 20 bytes, usually displayed as hexadecimal starting with `0x`. Both user-controlled accounts and contracts have addresses.

A **wallet** is software or hardware that manages access to accounts and signs requests. It doesn't contain the currency; balances exist in blockchain state.

The backend analogy is an account ID plus a credential manager. The difference is that authorization uses cryptographic signatures rather than a password checked by your server. An address also doesn't establish someone's real-world identity.

Our indexer can read public data without a wallet or private key. See [Ethereum accounts](https://ethereum.org/developers/docs/accounts/).

## Blockchain node and RPC

A **blockchain node** runs software that participates in the network, validates data, and maintains its view of blockchain history and state. This allows participants to verify the system's rules independently.

Think of a database replica that also verifies incoming operations. The analogy breaks because there is no single database operator deciding the authoritative history. Running a node doesn't automatically mean producing blocks or acting as a validator. See [Nodes and clients](https://ethereum.org/developers/docs/nodes-and-clients/).

**RPC** is the interface through which our application asks a node questions. Ethereum commonly uses JSON-RPC methods such as:

- `eth_blockNumber`
- `eth_getBlockByNumber`
- `eth_getTransactionReceipt`
- `eth_getLogs`

It exists so applications can access blockchain data without implementing the network protocol themselves. This is familiar remote API territory, but responses reflect that node's view. A successful response doesn't make a recent block permanent, and requests using `latest` can observe different heads over time. See [Ethereum JSON-RPC](https://ethereum.org/developers/docs/apis/json-rpc/).

## Smart contract

A **smart contract** is deployed code and persistent state at an address. It allows shared rules—such as token ownership and transfers—to execute under the blockchain's validation rules.

Think of a stored procedure replicated across machines. The analogy breaks because execution must obey the blockchain's deterministic rules and resource limits. A contract doesn't run as a background service or directly fetch arbitrary HTTP data.

For our indexer, contracts are sources of application-specific activity. See [Smart contract anatomy](https://ethereum.org/developers/docs/smart-contracts/anatomy/).

## ABI and event/log

An **ABI**, or Application Binary Interface, specifies how contract function calls, return values, and events are encoded. It lets software interpret bytes as typed values.

Think of a Protobuf schema or an API description. The difference is that raw contract data generally doesn't carry enough information to explain itself; we need the correct interface definition.

An **event** is a contract-defined declaration, such as `Transfer(address,address,uint256)`. A **log** is an encoded record emitted during execution, containing an emitting address, topics, and data. Logs make contract activity discoverable without reconstructing every internal state change.

Think of structured domain events. The analogy breaks because logs aren't independently delivered queue messages: they belong to transaction execution in a particular block. They also aren't a complete record of all state changes.

The ABI lets our indexer transform a raw log into something like:

```text
contract: token address
event: Transfer
from: Alice's address
to: Bob's address
amount: 25
```

The event's meaning depends on the contract; a familiar event name alone doesn't prove its behavior. See [Solidity ABI specification](https://docs.soliditylang.org/en/latest/abi-spec.html).

## Confirmations, finality, and reorganizations

These concepts explain why “we read it successfully” is insufficient.

**Confirmations** measure how deeply a transaction's block sits in the current chain. They exist as a practical way to express increasing confidence in inclusion as subsequent blocks build on it. Some conventions count the inclusion block as confirmation one.

The analogy is waiting for additional replication evidence. It breaks because a confirmation count is not itself Ethereum's protocol finality decision.

**Finality** is a stronger consensus guarantee. Ethereum's proof-of-stake protocol uses validator votes and checkpoints to finalize history; reversing finalized history would require a severe consensus failure with substantial economic consequences.

The analogy is a committed entry in a consensus log. The difference is Ethereum's stake-based security model. **Waiting an arbitrary number of blocks and observing protocol finality are different policies.** Ethereum-compatible chains can use different consensus and finality rules. See [Ethereum proof-of-stake and finality](https://ethereum.org/developers/docs/consensus-mechanisms/pos/).

A **chain reorganization**, or **reorg**, happens when the node changes which branch it considers canonical—the history currently selected by the consensus rules.

For example:

```text
Previously observed: 100 → 101 → 102A → 103A
Canonical later:     100 → 101 → 102B → 103B
```

This happens because nodes can temporarily observe competing branches, and the network needs rules to converge on one.

The analogy is replacing an uncommitted suffix of a replicated log. The difference from an ordinary database consumer is that our indexer may already have exposed records derived from that suffix. Transactions from displaced blocks might appear again later or might remain absent. We'll design how to handle this in Stage 8. See [Ethereum fork choice](https://ethereum.org/developers/docs/consensus-mechanisms/pos/).

## How these concepts connect to our indexer

Imagine Alice submits a transaction to a token contract, asking it to transfer tokens to Bob.

The transaction is included in a block. Successful contract execution emits a `Transfer` log. Our application asks a node for the block and execution data through RPC, decodes the log using the ABI, and stores queryable records in PostgreSQL.

```text
Blockchain node
    │ RPC: blocks, transactions, receipts, logs
    ▼
Our indexer
    │ Decode and project relevant data
    ▼
PostgreSQL
    │ Queries
    ▼
API → Client
```

That database is our application's derived view of blockchain history. Its correctness depends on both processing the data correctly and knowing which history the records came from.

## Your first challenge

This task is conceptual; no implementation yet. Answer these in your own words:

1. Alice's transaction appears in a block. What would you inspect to distinguish successful execution from failed execution?
2. Why might the transaction's destination be the token contract rather than Bob's address?
3. We fetched block `102` twice and received different hashes. What might that mean, and why doesn't the number alone identify the block?
4. Explain the flow from Alice's transaction to a queryable PostgreSQL record, including where RPC, the receipt/log, and the ABI fit.

Share your answers for review before moving to Stage 2.
