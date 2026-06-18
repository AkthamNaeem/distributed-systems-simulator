# Distributed Systems Practical Simulator Site Structure

## Project Name

Distributed Systems Practical Simulator

## Main Goal

Distributed Systems Practical Simulator is a frontend educational simulator that demonstrates Distributed Systems concepts through visual and interactive simulations.

The app should help students move from thinking about a single local program to understanding how distributed services communicate, balance requests, tolerate failures, and organize data across multiple machines.

## Required Pages and Routes

| Page | Route |
| --- | --- |
| Home | `/` |
| RMI Simulator | `/rmi-simulator` |
| Load Balancer Simulator | `/load-balancer` |
| RPC vs Message Passing | `/rpc-vs-message-passing` |
| Fault Tolerance Lab | `/fault-tolerance` |
| Sharding & Replication | `/sharding-replication` |
| Final Summary | `/final-summary` |

## Page Definitions

### Home

**Route:** `/`

**Page purpose:** Introduce the idea that a program can move from local-only execution to a system where services communicate across process or machine boundaries.

**Main user interaction:** The user reads a short explanation and uses navigation links to choose a simulator.

**Distributed Systems concept it proves:** Distributed systems are built from separate services that coordinate by sending requests, responses, or messages instead of relying on one local execution context.

**What should NOT be implemented yet:** No landing page redesign, route implementation, React components, animations, simulator logic, or interactive service diagrams.

### RMI Simulator

**Route:** `/rmi-simulator`

**Page purpose:** Explain how a client can call a method on a remote object as if it were local, while the request is actually sent across a network boundary.

**Main user interaction:** The user should eventually trigger a fake remote method call and watch a visual request travel from a client to a remote service and back.

**Distributed Systems concept it proves:** Remote Method Invocation hides network communication behind a method-call style interface, but the call still depends on serialization, transport, remote execution, and a response.

**What should NOT be implemented yet:** No real Java RMI, no network calls, no backend endpoint, no serialization engine, no generated stubs, and no simulator component.

### Load Balancer Simulator

**Route:** `/load-balancer`

**Page purpose:** Show how incoming requests can be distributed across multiple service instances instead of being handled by a single server.

**Main user interaction:** The user should eventually send fake requests and observe them being assigned to different visual servers.

**Distributed Systems concept it proves:** Load balancing improves distribution of work across service instances and helps avoid overloading one server.

**What should NOT be implemented yet:** No real proxy, no backend services, no health checks, no production load-balancing algorithm implementation, and no simulator component.

### RPC vs Message Passing

**Route:** `/rpc-vs-message-passing`

**Page purpose:** Compare direct request-response communication with asynchronous message-based communication.

**Main user interaction:** The user should eventually switch between an RPC-style flow and a message-passing flow to compare how requests move through fake services.

**Distributed Systems concept it proves:** RPC models communication as a direct call with a response, while message passing decouples sender and receiver through asynchronous communication.

**What should NOT be implemented yet:** No real RabbitMQ, Kafka, message broker, backend queue, WebSocket, persistent messaging, or simulator component.

### Fault Tolerance Lab

**Route:** `/fault-tolerance`

**Page purpose:** Demonstrate what happens when a service fails and how distributed systems can continue operating through redundancy or retry behavior.

**Main user interaction:** The user should eventually mark a fake server as failed and observe how requests are retried, redirected, or handled by another visual service.

**Distributed Systems concept it proves:** Fault tolerance depends on detecting failures and using strategies such as retries, replication, or alternate service instances to keep the system usable.

**What should NOT be implemented yet:** No real failure detection, no backend retries, no distributed consensus, no monitoring system, and no simulator component.

### Sharding & Replication

**Route:** `/sharding-replication`

**Page purpose:** Explain how data can be split across shards and copied through replicas in a distributed system.

**Main user interaction:** The user should eventually route fake records or requests to visual shards and compare that with replicated copies.

**Distributed Systems concept it proves:** Sharding partitions data across nodes, while replication keeps copies of data on multiple nodes for availability or fault tolerance.

**What should NOT be implemented yet:** No real database, no storage engine, no distributed transactions, no production replication protocol, and no simulator component.

### Final Summary

**Route:** `/final-summary`

**Page purpose:** Connect all simulator pages back to the lecture concepts they demonstrate.

**Main user interaction:** The user reviews a final concept map that summarizes how each simulation relates to the Distributed Systems lecture material.

**Distributed Systems concept it proves:** The individual simulations combine into a broader mental model of distributed services, communication, request distribution, failure handling, and data distribution.

**What should NOT be implemented yet:** No progress tracking, no quiz system, no stored results, no backend summary generation, and no React page implementation.

## Global User Flow

1. The user starts at Home.
2. The user sees a short explanation of moving from one local program to distributed services.
3. The user navigates to each simulator page.
4. Each simulator page explains one concept using visual fake services, servers, and requests.
5. The user ends at Final Summary, which maps each simulation to the lecture concept it proves.

## Navigation Structure

The app should use a simple top navigation with links to all planned pages:

- Home: `/`
- RMI Simulator: `/rmi-simulator`
- Load Balancer Simulator: `/load-balancer`
- RPC vs Message Passing: `/rpc-vs-message-passing`
- Fault Tolerance Lab: `/fault-tolerance`
- Sharding & Replication: `/sharding-replication`
- Final Summary: `/final-summary`

The navigation should be available globally once UI implementation begins in Phase 3. During Phase 2, this is only a planning definition and should not be implemented in `src/app/layout.tsx` or any React component.

## Scope Limits

The project must remain a frontend-only educational simulator. The following are out of scope:

- No real Java RMI
- No real RabbitMQ or Kafka
- No backend APIs
- No database
- No authentication
- No Docker
- No Kubernetes
- No production architecture
- No concepts outside the lecture scope

All simulator behavior should use mock or local in-browser state only when implementation begins.

## Phase Boundary

Phase 2 is documentation and planning only.

UI implementation starts in Phase 3. Phase 2 must not create app routes, modify existing app files, create React components, install packages, change `package.json`, add backend services, add database setup, add authentication, add deployment setup, or introduce concepts outside the approved Distributed Systems lecture scope.
