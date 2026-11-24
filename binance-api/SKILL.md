---
name: binance-api
description: "Use when writing, debugging or reviewing code that calls Binance's REST API (Spot, Wallet, Simple Earn, `/sapi/` endpoints) or its official JavaScript SDK (`@binance/spot`, `@binance/wallet`), or when a Binance call fails with an error such as -2014, -2015, -1022 or -1002. Covers key types, request signing, the read-only key check, what each error code meant in practice, the SDK construction pitfall that drops the X-MBX-APIKEY header, a signed check the key owner runs on their own machine, and how to read Binance's documentation when the site blocks automated fetching. Every fact is labeled official, observed or unverified."
version: 1.0.0
---

# Binance API

## Extension counterpart

Before doing anything else, check the available skills for one named `binance-api` in a plugin called `agency-<ext_name>` (for example `agency-extension:binance-api`). If one exists, load it now and follow it together with this skill; where the two differ, the counterpart wins. With several, the last one wins; the `context-management` skill gives the order. If none exists, carry on with this skill's defaults.

## Confidence labels

- **[official]**: stated on a Binance documentation page.
- **[observed]**: seen in a real request, response, log or library source.
- **[unverified]**: from memory or a search snippet. Confirm it before relying on it.

Captured on 2026-11-24 with `@binance/common` 2.5.4, `@binance/wallet` 22.2.9 and `@binance/spot` 34.1.1. Re-check when the versions change.

How to diagnose a rejected call, in general: the "Compare a working request with a failing one on the wire" rule in `dev-guidelines`. This skill holds the Binance facts; `dev-guidelines` decides the method.

## Keys

- Key types: Ed25519 (recommended), RSA and HMAC (deprecated) [official]. HMAC: Binance issues a key and a secret. Ed25519 and RSA: you share the public key and sign with the private key [official].
- The sample HMAC key in the documentation is 64 letters and digits. No length rule is stated [official sample; the rule is unverified].
- IF an application handles only an HMAC key and secret, THEN say so: Ed25519 and RSA need different signing.
- Read-only check: the signed `GET /sapi/v1/account/apiRestrictions` returns the permission flags [observed]: `ipRestrict`, `createTime` (milliseconds), `enableReading`, `enableFutures`, `enableSpotAndMarginTrading`, `enableWithdrawals`, `enableInternalTransfer`, `permitsUniversalTransfer`, `enableVanillaOptions`, `enablePortfolioMarginTrading`, `enableFixApiTrade`, `enableFixReadOnly`, `enableMargin`.
- DO accept a key as read-only with an allowlist: `enableReading` (and `enableFixReadOnly`) may be on, and any other flag that starts with `enable` or `permits` and is on rejects the key, including flags Binance adds later. DO NOT use a denylist of known flags.
- A read-only key may have an unrestricted IP [observed]. The console warns that an unrestricted key with any permission beyond reading is deleted [observed].
- Copy keys with the console's Copy button. Capital `I` and lowercase `l` look the same in many fonts [observed].

## Requests

- Base URL `https://api.binance.com` for Spot and `/sapi/` endpoints [official].
- A signed endpoint needs the header `X-MBX-APIKEY: <key>`, the query parameters `timestamp` (milliseconds) and optionally `recvWindow` (default 5000), and `signature`: the hex HMAC-SHA256 of the query string, keyed with the secret [official].
- From about 2026-01-15 values must be percent-encoded before signing, or Binance answers -1022 [unverified: a search snippet of the changelog].
- Public endpoints, such as the price list, need no key [observed].
- A signed example that is safe to run: `scripts/check-signed-request.sh`.

## Error codes

| Code | Official name and text | What it meant in practice |
|---|---|---|
| -1002 | UNAUTHORIZED: "You are not authorized to execute this request." [official] | An unsigned request with a valid key to a signed `/sapi/` endpoint returned this [observed]. It is not a verdict on the key's format, and the documentation says no more. |
| -1003 | TOO_MANY_REQUESTS (request weight, IP ban) [official] | Rate limit. HTTP 429 and 418 belong to the same family [unverified]. |
| -1021 | INVALID_TIMESTAMP: "Timestamp for this request is outside of the recvWindow." [official] | Clock drift or a stale timestamp. |
| -1022 | INVALID_SIGNATURE: "Signature for this request is not valid." [official] | Wrong secret or wrong signing input. |
| -1102 | MANDATORY_PARAM_EMPTY_OR_MALFORMED [official] | An unsigned request did not return this [observed]. |
| -2014 | BAD_API_KEY_FMT: "API-key format invalid." [official] | Also returned for a valid key when the signed request carried no `X-MBX-APIKEY` header at all [observed, see the SDK section]. Check that the header is present before blaming the key. |
| -2015 | REJECTED_MBX_KEY: "Invalid API-key, IP, or permissions for action." [official] | Key, IP or permission problem. |

- -2008 is not on the Spot errors page [observed].
- That Binance checks the key's format before the signature is unverified; do not state it as fact.
- Suggested mapping in an application: invalid-key family `-2014`, `-2015`, `-1022` and HTTP 401; rate-limit family `-1003`; everything else "service unavailable". Keep the vendor code in a diagnostic log, because a mapper that drops it hides the cause.

## Official SDK (JavaScript)

- Packages: `@binance/spot`, `@binance/wallet` and `@binance/common`. SDK errors carry a numeric `code` and a class per HTTP status: BadRequestError 400, UnauthorizedError 401, ForbiddenError 403, NotFoundError 404, RateLimitBanError 418, TooManyRequestsError 429. They have no `status` field [observed].
- DO create the clients through the SDK's own classes: `new Wallet({ configurationRestAPI: { apiKey, apiSecret, basePath, timeout } }).restAPI`, and the same with `Spot` [observed].
- DO NOT pass a plain object to the low-level class (`new WalletRestAPI.RestAPI({ apiKey, apiSecret, ... })`). That skips `ConfigurationRestAPI`, which sets the `X-MBX-APIKEY` header, the `Content-Type` header, the timeout, keep-alive and compression. The signed request then goes out with `timestamp` and `signature` but no key header, and Binance answers -2014 [observed in a local capture against a fake server; the unit tests that mocked the SDK, and the tests that used a fake client, did not see it].
- Defaults when the configuration goes through the SDK [observed in `@binance/common` 2.5.4]: `timeout` 1000 ms unless set, `retries` 3, `backoff` 1000 ms, keep-alive and compression on. DO set `timeout` explicitly.
- A plain `http://` `basePath` works for a local test server [observed]. A test that runs the real SDK against it and asserts `X-MBX-APIKEY`, `timestamp` and `signature` is the only test that sees this class of bug.

## Testing a key without the application

IF a Binance call fails and the credentials might be the cause, THEN have the key owner run `scripts/check-signed-request.sh` on their own machine. Typing is hidden, but the prompt text shows; the output holds the two lengths and Binance's permission flags, which are safe to share.

| Reply | Meaning |
|---|---|
| JSON with `enableReading` and the other flags | The key and secret are valid from that machine. Look at what the application sends (see `dev-guidelines`, the wire rule). |
| -2014 | Binance rejects the key even with the header present. Create a new key and copy it again. |
| -1022 | Wrong secret or wrong signing input. |
| -2015 | Key, IP or permissions. |

An unsigned request is not a valid test of a signed endpoint (see -1002 above). To give the user the script in one paste, write it to a file with a heredoc and run the file; a pasted block that contains `read` hands its next line to `read`.

## Reading the documentation

- developers.binance.com answers a non-browser client with HTTP 202, an empty body and the header `x-amzn-waf-action: challenge` [observed 2026-11-24]. `binance-docs.github.io` redirects to it [observed].
- DO NOT work around the challenge. Ask the user to open the page and paste its text or HTML.
- Pages: `https://developers.binance.com/en/docs/products/spot/errors`, `.../spot/faqs/api_key_types`, `.../spot/rest-api#signed-endpoint-security` and `.../spot/CHANGELOG`. The site footer links `llms.txt` and `llms-full.txt` (not tested).
- IF the sandbox blocks the host (a proxy 403 or a DNS failure), THEN say so; an allowlist change needs the user's approval, and a fetch tool can fail where the shell succeeds.

## Secrets

DO NOT log or print the key, the secret, the signature, a URL with its query string or Binance's message text. Log the endpoint path, the error class, the HTTP status, the Binance code and the credential lengths. DO NOT ask the user to paste a key or a secret into the conversation.
