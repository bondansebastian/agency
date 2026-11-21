#!/usr/bin/env bash
# Script test for hooks/mcp-sync-check.sh. Builds throwaway git repos, feeds the
# hook the JSON Claude Code would send, and checks the exit code and output.
# Fixtures are written with printf so no tag sits at the start of a line here.
# Usage: bash hooks/test-mcp-sync-check.sh

HOOK="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/mcp-sync-check.sh"
ROOT="$(mktemp -d)"
trap 'rm -rf "$ROOT"' EXIT
pass=0; fail=0; n=0

# new_repo <name>: git repo with one commit holding src/routes.ts (tagged) and src/tools.ts
new_repo() {
  local d="$ROOT/$1"; mkdir -p "$d/src"; cd "$d" || exit 1
  git init -q . && git config user.email t@t && git config user.name t
  printf '// @mcp create_invoice\nexport function route() { return 1 }\n' > src/routes.ts
  printf 'export const tools = ["create_invoice"]\n' > src/tools.ts
  git add -A && git commit -qm base
}

# run <dir> <command> [stdin-override]: sets $code, $out
run() {
  local json; json="$(jq -nc --arg c "$2" --arg d "$1" '{tool_name:"Bash",tool_input:{command:$c},cwd:$d}')"
  out="$(printf '%s' "${3-$json}" | bash "$HOOK" 2>&1)"; code=$?
}

check() { # check <name> <expected-exit> [grep-pattern-in-output | EMPTY]
  n=$((n+1))
  local ok=1
  [ "$code" = "$2" ] || ok=0
  if [ "${3:-}" = EMPTY ]; then [ -z "$out" ] || ok=0
  elif [ -n "${3:-}" ]; then printf '%s' "$out" | grep -Fq -- "$3" || ok=0; fi
  if [ $ok = 1 ]; then pass=$((pass+1)); echo "ok   $n $1"
  else fail=$((fail+1)); echo "FAIL $n $1 (exit $code, want $2)"; printf '%s\n' "$out" | sed 's/^/     | /'; fi
}

COMMIT='git commit -am "x"'

# --- ticket cases ---
new_repo blocked; printf '// @mcp create_invoice\nexport function route() { return 2 }\n' > src/routes.ts
run "$PWD" "$COMMIT";                      check "tagged file changed, tool file not: blocked" 2 'src/routes.ts'
printf '%s' "$out" | grep -Fq 'create_invoice' && printf '%s' "$out" | grep -Fq 'MCP: unchanged' \
  && { n=$((n+1)); pass=$((pass+1)); echo "ok   $n message names file, tool and both ways out"; } \
  || { n=$((n+1)); fail=$((fail+1)); echo "FAIL $n message names file, tool and both ways out"; }
run "$PWD" "git commit -am \"x

MCP: unchanged — pure refactor\"";         check "MCP: unchanged — reason in the command: passes" 0 EMPTY
run "$PWD" 'git commit -am "x" -m "MCP: unchanged - rename only"'; check "MCP: unchanged with a hyphen: passes" 0 EMPTY
run "$PWD" 'git commit -am "MCP: unchanged"'; check "MCP: unchanged without a reason: still blocked" 2

printf 'export const tools = ["create_invoice", "x"]\n' > src/tools.ts
run "$PWD" "$COMMIT";                      check "tagged and tool file both changed: passes" 0 EMPTY

new_repo none; printf '// @mcp none: binary upload\nexport function route() { return 2 }\n' > src/routes.ts
run "$PWD" "$COMMIT";                      check "@mcp none: reason: passes" 0 EMPTY

new_repo notags; printf 'export const a = 1\n' > src/plain.ts; git add -A; git commit -qm p; printf 'export const a = 2\n' > src/plain.ts
run "$PWD" "$COMMIT";                      check "no tags in changed files: passes silently" 0 EMPTY

new_repo unknown; printf '// @mcp does_not_exist\nexport function other() {}\n' > src/other.ts; git add src/other.ts
run "$PWD" "$COMMIT";                      check "unknown tool name: blocked (broken mapping)" 2 'does_not_exist'
run "$PWD" 'git commit -m "MCP: unchanged — x"'; check "unknown tool name: not skipped by MCP: unchanged" 2 'does_not_exist'

new_repo notcommit; printf '// @mcp create_invoice\nexport function route() { return 3 }\n' > src/routes.ts
run "$PWD" 'git status && ls';             check "command is not git commit: passes untouched" 0 EMPTY
run "$PWD" 'git add -A';                   check "git add is not git commit: passes untouched" 0 EMPTY

# --- more blocking forms ---
new_repo staged; printf '// @mcp create_invoice\nexport function route() { return 4 }\n' > src/routes.ts; git add src/routes.ts
run "$PWD" 'git commit -m "x"';            check "staged tagged file, no tool: blocked" 2
new_repo multi; printf '# @mcp create_invoice, update_invoice\nx = 1\n' > src/job.py; git add src/job.py
run "$PWD" 'cd . && git commit -m "x"';    check "two tool names, one tool missing, in a compound command: blocked" 2 'update_invoice'

# --- projects without MCP, and odd environments: always exit 0, no output ---
new_repo plain1; rm -rf src; mkdir src; printf 'export const a = 1\n' > src/a.ts; git add -A; git commit -qm a; printf 'export const a = 2\n' > src/a.ts
run "$PWD" "$COMMIT";                      check "project without MCP: passes silently" 0 EMPTY

mkdir -p "$ROOT/nogit"; run "$ROOT/nogit" "$COMMIT"; check "not a git repository: passes silently" 0 EMPTY

mkdir -p "$ROOT/nohead"; cd "$ROOT/nohead" && git init -q . && git config user.email t@t && git config user.name t
printf 'export const a = 1\n' > a.ts; git add a.ts
run "$PWD" 'git commit -m first';          check "repository with no commits yet: passes silently" 0 EMPTY
printf '// @mcp create_invoice\nexport function r() {}\n' > b.ts; git add b.ts
run "$PWD" 'git commit -m first';          check "first commit with a tag naming a missing tool: blocked" 2

cd "$ROOT/plain1"
run "$PWD" "$COMMIT" "";                   check "empty stdin: passes silently" 0 EMPTY
run "$PWD" "$COMMIT" "not json {";         check "malformed JSON: passes silently" 0 EMPTY
run "$PWD" "$COMMIT" '{"tool_input":{}}';  check "JSON without a command: passes silently" 0 EMPTY
run "/no/such/dir" "$COMMIT";              check "cwd that does not exist: passes silently" 0 EMPTY

new_repo odd; printf '\x00\x01\x02' > "src/bin.dat"; printf 'x\n' > "src/with space.ts"; git add -A; git commit -qm o
printf '\x00\x03' > src/bin.dat; printf 'y\n' > "src/with space.ts"; rm src/tools.ts
printf '// @mcp create_invoice\nexport function route() { return 1 }\n' > src/routes.ts   # unchanged content
run "$PWD" "$COMMIT";                      check "binary file, file name with a space, deleted file: passes silently" 0 EMPTY

new_repo docs; printf 'Example:\n\n    // @mcp create_invoice\n' > README.md; printf 'see @mcp tool_x in the docs\n' > src/note.ts; printf 'a // @mcp ghost_tool\n' > src/mid.ts
git add -A
run "$PWD" 'git commit -m docs';           check "markdown example and mid-line @mcp mention: passes silently" 0 EMPTY

# jq missing from PATH: fail open
new_repo nojq; printf '// @mcp create_invoice\nexport function route() { return 9 }\n' > src/routes.ts
mkdir -p "$ROOT/bin"; for t in bash git grep sed tr sort head cat dirname mktemp; do ln -sf "$(command -v $t)" "$ROOT/bin/$t"; done
json="$(printf '{"tool_input":{"command":"git commit -am x"},"cwd":"%s"}' "$PWD")"
out="$(printf '%s' "$json" | PATH="$ROOT/bin" bash "$HOOK" 2>&1)"; code=$?
check "jq missing: passes silently" 0 EMPTY

echo; echo "$pass passed, $fail failed"
[ "$fail" = 0 ]
