#!/usr/bin/env bash
# PreToolUse hook on Bash. Blocks `git commit` when a changed file carries an
# `@mcp <tool>` tag and none of the files that define that tool changed too.
#
# Fail-open by design: a project without MCP tags (or any unexpected problem)
# gets exit 0 and no output. The only non-zero exit is the deliberate exit 2.

trap 'exit 0' ERR
set -o pipefail

# --- 1. Read the hook input; leave at once unless the command is `git commit` ---
command -v jq >/dev/null 2>&1 || exit 0
input="$(cat)"
[ -n "$input" ] || exit 0
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)" || exit 0
[ -n "$cmd" ] || exit 0
printf '%s' "$cmd" | grep -Eq '(^|[;&|(`[:space:]])git[[:space:]]+([^;&|]*[[:space:]])?commit([[:space:]]|$)' || exit 0

cwd="$(printf '%s' "$input" | jq -r '.cwd // empty' 2>/dev/null)" || cwd=""
if [ -n "$cwd" ]; then cd "$cwd" 2>/dev/null || exit 0; fi
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
cd "$(git rev-parse --show-toplevel)" || exit 0

# --- 2. Changed files (-a and staged new files included) ---
if git rev-parse --verify -q HEAD >/dev/null 2>&1; then
  changed_raw="$(git diff HEAD --name-only -z | tr '\0' '\n')"
else
  changed_raw="$(git diff --cached --name-only -z | tr '\0' '\n')"
fi
[ -n "$changed_raw" ] || exit 0

# --- 3. Collect @mcp tags: "file<TAB>tool" per tool name; `none` tags are ignored ---
leader='^[[:space:]]*(//|#|\*|/\*+|--|;|<!--|%)+[[:space:]]*@mcp[[:space:]]+'
tags=""
while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in *.md|*.mdx|*.txt) continue ;; esac
  lines="$(grep -I -E "${leader}[A-Za-z0-9_.-]" -- "$f" 2>/dev/null)" || continue
  while IFS= read -r line; do
    rest="$(printf '%s' "$line" | sed -E "s~${leader}~~")"
    case "$rest" in none:*|none\ *|none) continue ;; esac
    # take the comma-separated names at the start, stop at the first other character
    names="$(printf '%s' "$rest" | grep -oE '^[A-Za-z0-9_.-]+([[:space:]]*,[[:space:]]*[A-Za-z0-9_.-]+)*')" || continue
    for n in $(printf '%s' "$names" | tr ',' ' '); do
      tags="${tags}${f}"$'\t'"${n}"$'\n'
    done
  done <<<"$lines"
done <<<"$changed_raw"
[ -n "$tags" ] || exit 0   # no tags: not an MCP project (or nothing MCP changed)

# --- 4. Check every tagged tool ---
unchanged=0
printf '%s' "$cmd" | grep -Eq 'MCP: unchanged[[:space:]]*(—|–|-+)[[:space:]]*[^[:space:]]' && unchanged=1

problems=""
while IFS=$'\t' read -r file tool; do
  [ -n "$tool" ] || continue
  defs="$(git grep -l --untracked -F -e "\"$tool\"" -e "'$tool'" -e "\`$tool\`" -- . ':(exclude)*.md' ':(exclude)*.mdx' 2>/dev/null)" || defs=""
  if [ -z "$defs" ]; then
    problems="${problems}  - ${file}: tag names tool \"${tool}\", but no file defines it (mapping is broken)"$'\n'
    continue
  fi
  [ "$unchanged" = 1 ] && continue
  if ! printf '%s\n' "$defs" | grep -Fxq -f <(printf '%s\n' "$changed_raw"); then
    first="$(printf '%s\n' "$defs" | head -n1)"
    problems="${problems}  - ${file} changed; MCP tool \"${tool}\" (defined in ${first}) did not"$'\n'
  fi
done < <(printf '%s' "$tags" | sort -u)

[ -n "$problems" ] || exit 0

{
  echo "Blocked: code tagged with @mcp changed, but the MCP tool it maps to did not."
  printf '%s' "$problems"
  echo "Either update the MCP tool (path, method, input schema, permissions, description) in this commit,"
  echo "or add this line to the commit message if no tool change is needed:"
  echo "  MCP: unchanged — <reason>"
} >&2
exit 2
