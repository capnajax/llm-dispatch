# Database schema

`001_initial.sql` defines the remote PostgreSQL shape documented in
`prompts/phase1/db-design.md`. It is intentionally not wired into the server in
Phase 1; browsers do not connect to PostgreSQL directly.

Apply migrations in numeric order with a migration runner that records each
filename once. The initial migration is transactional and expects PostgreSQL
with native `uuid`, `jsonb`, and `timestamptz` support.
