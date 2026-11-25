# AGENTS.md

A Quarto RevealJS plugin that reads the current slide's speaker notes aloud
with browser speech synthesis. Start with the [README](README.md).

## Layout

- `_extensions/read-aloud/` is the whole shipped extension: `quarto add`
  copies only this folder. It is plain browser JavaScript and CSS with no
  build step and no runtime dependencies; keep it that way.
- `types/` holds type-check-only declarations; it never ships.
- `example.qmd` is the test deck; `tests/` drives it with Playwright in
  Chromium and WebKit.

## Setup and checks

Install Quarto (the version in `.github/workflows/test.yaml`), then run
`pnpm install` and `prek install`.

| Command | Run it |
| --- | --- |
| `pnpm check` | Biome lint and format check, then strict `tsc` over the extension |
| `pnpm fix` | To apply Biome formatting and safe lint fixes |
| `quarto render example.qmd && pnpm test` | After any change to the extension or tests |
| `prek run --all-files` | Before committing |

Never lower a check to get green. Switch a lint rule off only with a
`biome-ignore` comment saying why.

## Conventions

- Type the extension with JSDoc so `tsc` checks it strictly; add shared
  shapes to `types/read-aloud.d.ts`.
- Keep the README's configuration table in step with the options the
  extension reads.
- The extension version lives in `_extensions/read-aloud/_extension.yml`.

## Learn from mistakes

When a check fails, a reviewer raises a finding, or you notice a mistake in
your own work, fix it, then ask what led you to it. If `AGENTS.md` or a doc
gave missing, ambiguous, or wrong guidance, correct that guidance in the same
pull request, stating the general rule rather than the incident. Never weaken
a quality gate instead.

## Pull requests

Follow these rules without relying on any instructions outside this
repository:

- Write every commit message and PR title as a Conventional Commit,
  `type(scope): description`, lowercase and imperative, with an allowed type
  (`build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`,
  `revert`, `style`, `test`). Keep the PR title and body in sync with the
  net diff.

- Open every PR ready for review with `gh pr create`, never as a draft.

- Never add agent or tool attribution to commits, PRs, or comments.

- After opening or pushing, wait for hosted CI to finish. Inspect failed jobs,
  fix the cause, run the local checks above, push, and repeat. Skipped,
  queued, or failing required checks are not success.

- If an automatic AI review (Codex, for the owner) runs on the PR, wait for
  its result instead of requesting one. Fix merited findings, reply to and
  resolve addressed threads, and continue until the review approves the
  current head with no unresolved findings. Never write `@codex` anywhere in
  a PR, even in backticks: it cancels the automatic review. Say "a Codex
  review request" instead.

- If Codex reports exhausted usage, leave the PR open and report it; no other
  reviewer or silence counts as approval. Once usage refreshes, comment
  `@codex review` once; only this case needs the comment.

- Once CI is green and the review gate is met, squash-merge, then verify the
  merged state. Recheck the head, threads, and checks immediately before
  merging, and never bypass branch protections.

- Update a PR branch from `main` only to resolve conflicts or pick up a change
  the PR depends on, never just to bring it up to date.

- Report local validation, hosted CI, review, and merge state separately. If
  an external blocker stops completion, leave the PR open and say so.
