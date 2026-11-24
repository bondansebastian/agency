#!/usr/bin/env bash
# Signed, read-only check of a Binance HMAC API key. Run it on the key owner's own machine.
#
# Reads the key and the secret at prompts (typing is hidden, the prompt text is shown), prints their
# lengths and Binance's reply. The reply holds permission flags only: no key, no secret.
# Calls GET /sapi/v1/account/apiRestrictions, signed, with the key in the X-MBX-APIKEY header.
#
# Usage:  bash check-signed-request.sh
# Test:   BINANCE_BASE_URL=http://127.0.0.1:PORT bash check-signed-request.sh   (a local capture server)
# Needs:  bash, curl, openssl. The timestamp is whole seconds times 1000, which works on GNU and BSD date.
set -u

BASE_URL="${BINANCE_BASE_URL:-https://api.binance.com}"

read -rsp "API key: " KEY; echo
read -rsp "API secret: " SECRET; echo
echo "key length: ${#KEY}, secret length: ${#SECRET}"

QUERY="recvWindow=5000&timestamp=$(( $(date +%s) * 1000 ))"
SIGNATURE=$(printf %s "$QUERY" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $NF}')

curl -sS -m 15 -H "X-MBX-APIKEY: $KEY" "$BASE_URL/sapi/v1/account/apiRestrictions?$QUERY&signature=$SIGNATURE"
echo
unset KEY SECRET
