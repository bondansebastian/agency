# Compare a working request with a failing one on the wire

Detail for the rule of the same name in `SKILL.md`.

## Capture server

`node scripts/capture-server.mjs [--port N] [--status 200] [--body '{"ok":true}'] [--show-values] [--once]`

- Listens on `127.0.0.1` only, over plain `http`. Set the client's base URL to the address on the first line, `LISTENING http://127.0.0.1:<port>`.
- Prints one JSON object per request: `method`, `path`, `query`, `headers` (names exactly as sent, in order) and `body`.
- By default query values and body values are hidden, and the value of a header whose name contains `key`, `token`, `auth`, `secret`, `cookie`, `signature`, `password` or `credential` prints as its length: `"X-MBX-APIKEY":"<64 chars>"`. `--show-values` prints everything; use it only with fake credentials.
- `--once` exits after the first request. `--status` and `--body` set the reply.
- Use fake credentials of the real length (for example 64 repeated letters). IF the client refuses `http`, THEN look for a base-URL override or a test mode; DO NOT disable certificate checks.

Run the same request through the failing client and through a client that works, then compare the two JSON lines.

## What to compare

| Item | Question |
|---|---|
| Method and path | The same endpoint and verb? |
| Query names | Are all required names there (timestamp, signature)? Any extra? |
| Header names | Is the authentication header present? Its length matches the credential? |
| Content type and body | Same encoding (JSON or form)? Same keys? |
| User agent and accept headers | Only a lead when the vendor filters clients. |

## Running a check on the user's machine

- DO give one command or one small script; DO NOT ask the user to paste a secret into the conversation.
- Read secrets with a prompt that shows its label, for example `read -rsp "API key: " KEY`. A bare hidden prompt looks frozen.
- Print lengths and the server's reply only. Say which part of the output is safe to share.
- IF the user's shell may be WSL, macOS or Windows PowerShell, THEN name the shell the command needs. `date +%s%3N` is GNU only; `$(( $(date +%s) * 1000 ))` works everywhere.
- A pasted multi-line block that contains a `read` feeds the next pasted line to `read`. Write the script to a file with a heredoc, then run the file.

## Pitfalls

- **State confidence.** "Likely" is not "found". When a prediction fails (a test returned another code than expected), say so and say what the test cannot show.
- **Mocks hide the wire.** A unit test that mocks the library passes while the real request is wrong. Keep one test per integration that runs the real library against a local server.
- **A test that differs from the failing request proves little.** An unsigned request is not a valid check for a signed endpoint.
- **A finished deployment is not a fix.** Verify with the real retry and the new log line.
- **Network reach differs per tool.** The shell may reach a host the fetch tool cannot, and the reverse. Test reachability with the tool you will use. A sandbox allowlist change needs the user's approval.
- **A bot challenge is a block, not a bug.** An HTTP 202 with an empty body and a WAF header means the site wants a browser. DO NOT work around it; ask the user to paste the page.

## Report

Say what the working request sent, what the failing one sent, the difference, how the fix was proved (the capture before and after, the failing test), and what was not verified (for example the live service).
