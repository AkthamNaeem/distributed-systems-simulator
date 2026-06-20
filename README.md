# Distributed Systems Practical Simulator

Distributed Systems Practical Simulator is an interactive educational web application that turns core Distributed Systems topics into observable, repeatable simulations. It connects course theory to visual behavior: users send requests, change system conditions, compare communication models, trigger failures, and inspect how routing and data-distribution decisions affect the system.

## Technical Stack

- Next.js
- TypeScript
- React
- Tailwind CSS

## Main Pages and Learning Evidence

| Route | Page | What the page demonstrates | Concept proven |
| --- | --- | --- | --- |
| `/` | Home | Compares a direct local call with a request that crosses multiple services, with optional congestion and partial failure. | Distribution enables separation and scale while introducing network latency, coordination, and partial failure. |
| `/rmi-simulator` | RMI Simulator | Traces local and remote calls through a Stub, RMI Registry lookup, serialization, transport, remote execution, and response. | RMI presents a local-style interface while the operation still depends on discovery, serialization, the network, and a remote service. |
| `/load-balancer` | Load Balancer Simulator | Sends traffic to multiple backend servers, switches routing algorithms, and changes server health and workload. | Load Balancing distributes work, uses health information, and supports scalability and High Availability. |
| `/rpc-vs-message-passing` | RPC vs Message Passing | Compares a synchronous direct request with a Producer–Queue–Consumer flow, including a paused Consumer. | RPC couples caller and receiver in time, while a Queue decouples message production from consumption. |
| `/fault-tolerance` | Fault Tolerance Lab | Exercises Retry + Backoff, Circuit Breaker, Fallback, Health Check, and Heartbeat behavior under service failure and recovery. | Fault-tolerance patterns contain failures and preserve useful system behavior when a dependency is unavailable. |
| `/sharding-replication` | Sharding & Replication | Routes records using a Shard Key, compares Active and Passive Replication, and observes node failure and recovery. | Sharding distributes data placement; replication provides redundant copies for availability and fault tolerance. |
| `/final-summary` | Final Summary | Maps every interaction to its course concept and presents the complete learning path as one argument. | Distributed Systems combine communication, routing, failure handling, and distributed data management. |

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in a browser.

## Project Outcome

The project provides a connected practical explanation of Distributed Systems. Each simulator produces visible evidence for a specific course concept, allowing the student to explain both the benefit of distribution and the technical challenges introduced by communication across services and machines.
