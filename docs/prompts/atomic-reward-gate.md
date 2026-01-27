# Role: Antigravity Backend/DB Engineer (Atomic Rewards Under Concurrency)

**MISSION:** Implement a daily reward claim system that is atomic (all-or-nothing), idempotent (safe on retries), and concurrency-safe (1000 users pressing at once).

## NON-NEGOTIABLE RULES:
- **Single Atomic Transaction:** Claim insertion, Ledger entry, and Balance update must happen in ONE transaction.
- **Idempotency:** Retrying the same claim cannot double-award. Use `UNIQUE(user_id, reward_date)`.
- **Concurrency:** Multiple simultaneous requests result in exactly one award.
- **Ledger-First:** Never do blind `points = points + X`. Use a `points_ledger` table.

## DELIVERABLE (STRICT):

### 1) Data Model
   - **`daily_reward_claims`**:
     * `user_id`, `reward_date` (UTC), `claimed_at`.
     * **Constraint:** `UNIQUE(user_id, reward_date)`.
   - **`points_ledger`**:
     * `user_id`, `amount`, `source` ("daily_reward"), `source_id`.
     * **Constraint:** `UNIQUE(source, source_id)` (Prevents double credit).

### 2) Atomic Algorithm (Inside Transaction)
   1.  **Insert Claim:**
       ```sql
       INSERT INTO daily_reward_claims (user_id, reward_date) VALUES (...) ON CONFLICT DO NOTHING RETURNING id;
       ```
       *If no row returned:* Return `ALREADY_CLAIMED`.
   2.  **Insert Ledger:**
       ```sql
       INSERT INTO points_ledger (user_id, amount, source, source_id) VALUES (..., 'daily_reward', claim_id);
       ```
   3.  **Update Balance:**
       ```sql
       UPDATE users SET points = points + :amount, version = version + 1 WHERE id = :userId;
       ```
   4.  **Commit.**

### 3) API & Retry Handling
   - **Idempotency Key:** Derived stable key (`userId + YYYY-MM-DD`).
   - **Response:**
     * Success: `200 OK` (Points added).
     * Duplicate: `200 OK` (Already claimed - return current balance).
     * Failure: `500` (Retry safely thanks to idempotency).

### 4) Deadlock Safety
   - Use a **Single Connection/Transaction** per request.
   - **Lock Order:** Always `Claims` -> `Ledger` -> `Users`.
   - **No `Promise.all`** for writes; strictly sequential inside transaction.

### 5) Tests (must include)
   - **Concurrency:** 20 parallel requests -> Exactly 1 success, 19 "Already Claimed".
   - **Idempotency:** Repeat request 5 times -> Balance increases only once.
   - **Atomicity:** Force error after Ledger insert -> Transaction rolls back (Claim & Ledger gone).

## HARD RULES:
- "Mark claimed" and "add points" cannot live in separate transactions.
- If any partial state is possible (Claimed but no points), the solution is incomplete.
