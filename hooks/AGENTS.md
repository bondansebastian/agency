# Hooks

Rules for the hook scripts in this folder.

- **Fail open.** A hook must exit 0, with no output, whenever it is not sure it should act: missing `jq`, empty or malformed input, not a git repository, no `HEAD`, no tags. A project without MCP servers must never see an error, warning or block. The only non-zero exit is the deliberate `exit 2`, with a message on stderr.
- Hooks run on every tool call: keep them bash-only, offline, and under a second; leave on the first cheap check that rules the command out.
- Every behaviour change to `mcp-sync-check.sh` gets a case in `test-mcp-sync-check.sh`, and the test must pass (`bash hooks/test-mcp-sync-check.sh`). Fixtures are written with `printf` so no `@mcp` tag sits at the start of a line in this repository.
- The tag syntax and the escape hatch are documented once, in the root `README.md` ("MCP sync"). Do not copy them here.
