# Security Specification — GigCred Firestore Zero-Trust Model

## 1. Data Invariants
1. **Worker Identity Isolation**: A worker can only create, read, and update their own document located at `/workers/{workerId}`, where `workerId == request.auth.uid`.
2. **Subcollection Relational Ownership**: All statements, simulations, and loan applications must exist as subcollections under `/workers/{workerId}/...`, strictly enforcing that `request.auth.uid == workerId`.
3. **Immutability of Historical Assessments**: Once a Statement is marked `VERIFIED`, its core financial parameters (`txCount`, `uploadedAt`, `fileName`) cannot be tampered with.
4. **Loan Application Terminal State Guard**: Once a `LoanApplication` enters `DISBURSED` or `REJECTED`, only trusted processes can modify it; normal users cannot revert state.
5. **PII and Sensitive Info Protection**: Unauthenticated or cross-account access to UPI VPAs, Aadhaar tokens, and loan records is strictly blocked (default deny).

## 2. The "Dirty Dozen" Threat Payloads
1. **Payload 1 (Cross-Worker Document Hijack)**: Attacker `uid_bob` attempts `setDoc` on `/workers/uid_alice`. (Expect: PERMISSION_DENIED)
2. **Payload 2 (Unauthenticated Public Snooping)**: Anonymous client without auth attempting to `list` `/workers`. (Expect: PERMISSION_DENIED)
3. **Payload 3 (Oversized Document Denial of Wallet)**: Submitting a worker name string > 256 characters or statement file payload > 2MB into Firestore document. (Expect: PERMISSION_DENIED)
4. **Payload 4 (Fake Admin Role Escalation)**: User includes `{ "isAdmin": true }` or `{ "role": "admin" }` inside `/workers/{workerId}`. (Expect: PERMISSION_DENIED)
5. **Payload 5 (Cross-Worker Statement Insertion)**: User `uid_bob` writes to `/workers/uid_alice/statements/stmt_123`. (Expect: PERMISSION_DENIED)
6. **Payload 6 (Invalid Document ID Injection)**: Writing to `/workers/{workerId}/statements/../../../system_config`. (Expect: PERMISSION_DENIED via `isValidId()`)
7. **Payload 7 (Unchecked Status Mutation)**: Mutating a `LoanApplication` from `REJECTED` back to `PRE_APPROVED` directly from the client. (Expect: PERMISSION_DENIED)
8. **Payload 8 (Negative Loan Amount or Negative Cashflow Score)**: Creating a simulation with `principal: -50000` or `cashflowScore: 9999`. (Expect: PERMISSION_DENIED)
9. **Payload 9 (Missing Mandatory Fields / Shadow Fields)**: Inserting a statement without `status` or `uploadedAt`. (Expect: PERMISSION_DENIED)
10. **Payload 10 (Direct Read of Another Worker's Monte Carlo Path)**: Reading `/workers/uid_alice/simulations/sim_999` while authenticated as `uid_bob`. (Expect: PERMISSION_DENIED)
11. **Payload 11 (Blanket Collection List Query Without Owner Clause)**: Executing a root query on all loan applications across all workers. (Expect: PERMISSION_DENIED)
12. **Payload 12 (Client Deletion of Disbursed Loans)**: Attempting `deleteDoc` on an active or disbursed loan application. (Expect: PERMISSION_DENIED)

## 3. Test Runner Specifications
All operations verify that requests lacking `request.auth` or matching `workerId != request.auth.uid` are rejected by the Firestore security evaluator.
