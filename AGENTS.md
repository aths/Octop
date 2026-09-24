<!-- bmad:context -->
<!-- Verified 2026-09-20 against ae65fe4. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

# Octop — agent guide

## Orientation

Octop is a self-hosted, multi-user, multi-agent AI assistant shipped as one Python wheel (`octop`, Python 3.12+): a FastAPI backend, a React SPA, and a Click CLI served by a single `octop run` process; all state lives under `~/.octop` (SQLite/WAL by default, PostgreSQL optional). The agent runtime comes from external PyPI packages — `orcakit-harness-agent`, `harness-gateway`, `harness-memory`, `harness-browser` — not from local checkouts. Contributor docs live in `docs/` (`architecture.md`, `docs/contributing/`).

## Policy

- Branch from `develop` and open PRs against `develop`; never merge `develop` into `main` directly. Releases go `release/x.y.z` → merge commit into `main` → tag `v*` on the main tip only; Actions syncs `main` back to `develop`. Full rules: `CONTRIBUTING.md`.
- Never edit `src/octop/dashboard/` — built SPA artifact. Edit `dashboard/` and rebuild with `make build-frontend`; the pre-commit hook builds it but does **not** stage the rebuilt output, so stage `src/octop/dashboard/` yourself when shipping UI changes.
- Never modify harness behavior in this repo — harness-* are external PyPI packages; adapt from Octop code or bump the dependency version.
- Surgical edits: touch only task-related code; mention unrelated dead code rather than deleting it; no unrequested features.
- Update `CHANGELOG.md` for user-facing changes (the PR template requires it).
- Communicate with the user in Chinese by default; cite code as `path:line`; report verification commands and results when marking work done; do not commit or push unless asked.

## Where things are

- Composition root: `src/octop/launch.py` — the only module importing both `infra/server` and `api/app`. Server wiring: `infra/server.py`; FastAPI factory: `api/app.py`.
- Layer tables, per-package ownership, CLI commands/transport modes, workspace I/O semantics, and the legacy import map: `docs/contributing/module-boundaries.md` — read before adding a cross-layer import or placing new code.
- i18n workflow (bundles, domain helpers, locale resolution, parity tests): `docs/contributing/i18n.md` — read when adding any user-visible string.
- Test conventions (markers, xdist/testmon, POSIX guards, shared fakes): `docs/contributing/testing.md` — read when adding tests.
- Workspace content I/O entries: `api/common/workspace.py` (`require_running_workspace()`) for HTTP; `infra/gateway/process/agent_resolve.py` (`harness_workspace_for_agent()`) for gateway/IM.
- Schema: `infra/db/migrations/` + `infra/db/migrate.py`; service/repo wiring: `infra/db/services.py` (`SharedServices` / `RepoBundle`).
- References: `docs/api.md`, `docs/agent-backend-file-io.md`, `docs/adr/`; agent-assisted release: `.cursor/skills/publish/SKILL.md`.

## Running and verifying

- Always wrap pytest: `uv run pytest …` — bare `pytest` resolves to the wrong environment. Backend ship bar is `make all` (format-all + Ruff + import contracts + mypy + backend tests); `make all` does not cover the dashboard — for frontend changes run `make typecheck-frontend` / `make lint-frontend` and `cd dashboard && npm test`.
- The pre-commit hook (enable once per clone: `make install-hooks`) runs `make precommit` — full lint/typecheck plus **testmon-affected tests only** — and a dashboard build. CI runs the full backend suite on Linux **and** Windows (Python 3.12) plus a `frontend` job (tsc, ESLint, Prettier, vitest, committed-artifact freshness); treat Windows as part of the bar.
- Iterate on single files: `uv run pytest tests/unit -x -q`; `make test-fast` excludes `slow`; `make test-live` runs real-LLM/external tests under `tests/live/` (auto-skip without credentials); PostgreSQL-marked tests need `OCTOP_TEST_DATABASE_URL`.
- After i18n JSON changes: `uv run pytest tests/unit/i18n -q`. After API route changes: spot-check Scalar at `/api/docs` (opt-in via `enable_api_docs`).
- Current schema version is **14**; after adding a migration, bump every `assert v == 14` in `tests/unit/db/test_db_pool.py`.

## Conventions that differ from defaults

- Dependency layers flow inward; do not violate it: `infra/` never imports `api/`, `cli/`, or `launch.py`; `api/` never imports `cli/`; routers stay thin (validate HTTP → call `infra/` → map `OctopError`); `infra/db/repos/` and `infra/utils/` stay leaf packages. Obtain repo instances from `server.services`; the only router-level `infra.db.repos` imports allowed are constants, pure/static helpers, and the `_base.UNSET` sentinel. An import-linter contract now enforces the layer bans in CI.
- Legacy top-level modules were physically removed (`octop.agents`, `octop.db`, `octop.channels`, `octop.users`, `octop.utils`, …) — such imports fail; use the `octop.infra.*` map in `docs/contributing/module-boundaries.md`.
- No blocking I/O inside async functions — use `run_in_executor`. Lazy-import `METRICS` inside functions to avoid import cycles.
- All agent workspace **content** I/O goes through `HarnessAgent.workspace` (`BackendWorkspace`): never `agent.backend`, direct `Path` I/O under `~/.octop/agents/<id>/`, or backend-type branching. Pass workspace-relative paths — `"."` (workspace root) ≠ `"/"` (backend root); chat uploads land in `{workspace}/inbound/`.
- Schema changes ship as a numbered pair `00N_*.sql` + `00N_*.pg.sql`; unreleased work on `develop` folds into the current unreleased number instead of adding a new file; rebuilds SQLite cannot express as `ALTER` go in idempotent `migrate.py` helpers.
- Resource tables use integer surrogate `id` PK plus a public ULID `{entity}_id` UNIQUE; child rows FK the **string** id. Exceptions: `users`, name-keyed config tables, append-only logs, KV tables.
- Server-facing user text comes from `src/octop/i18n/{en,zh}.json` via `tr()` / `i18n/domains/` helpers (`en` fallback): no hard-coded English in `infra/`, no gettext; language is **not** a `config.json` key. Dashboard chrome uses i18next, with server-owned namespaces mirrored (parity tests enforce).
- User-facing datetimes use the server timezone from `config.json` (`default_timezone`, env `OCTOP_DEFAULT_TIMEZONE`), never the browser tz — dashboard: `useServerTimezone()` / `formatServerDateTime()` in `dashboard/src/utils/formatMessageTime.ts`.

## Known pitfalls

- CI runs on Windows too: tests use `tmp_path` + `pathlib` (never hard-coded POSIX paths), set `OCTOP_HOME` to a tmp dir when materializing files, and guard Unix-only cases with the repo's `posix_only` marker. Full rules: `docs/contributing/testing.md`.
- There is no `octop user login` — the CLI trusts local filesystem access; pin the acting user with `octop config set-user` / global `--user`, the agent with `octop agent use` / `--agent`. CLI config changes while `octop run` is live apply only after restart.
- The dashboard sends leading-`/` workspace paths; normalize via `workspace_api_path()` in `api/common/workspace.py` before they reach `BackendWorkspace`.
- Backups must restore across schema versions — workspace-archive shadowing and old-archive restores regressed repeatedly; when touching `infra/backup/` or migrations, exercise old-archive restore, not only fresh backups.

<!-- /bmad:context -->
