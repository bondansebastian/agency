#!/usr/bin/env node
// Prints what a client puts on the wire, so a failing request can be compared with a working one.
// Listens on 127.0.0.1 only. Point the client's base URL at the printed address (plain http).
//
// Usage: node capture-server.mjs [--port N] [--status 200] [--body '{"ok":true}'] [--show-values] [--once]
//
//   --port N        port to listen on (default: a free port)
//   --status N      HTTP status to answer with (default 200)
//   --body TEXT     response body (default {}), sent as application/json
//   --show-values   also print query values, body values and the values of sensitive headers
//                   (default: hidden, only lengths are printed)
//   --once          exit after the first request
//
// Output: first line "LISTENING http://127.0.0.1:PORT", then one JSON object per request.
import { createServer } from 'node:http';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 || index + 1 >= args.length ? fallback : args[index + 1];
};

const showValues = flag('show-values');
const once = flag('once');
const status = Number(option('status', '200'));
const replyBody = option('body', '{}');
const SENSITIVE = /key|token|auth|secret|cookie|signature|password|credential/i;

const describeValue = (name, value) => (showValues || !SENSITIVE.test(name) ? value : `<${value.length} chars>`);

function describeBody(raw, contentType = '') {
  if (raw.length === 0) return { bytes: 0 };
  const summary = { bytes: raw.length, contentType };
  try {
    if (contentType.includes('json')) {
      const parsed = JSON.parse(raw);
      summary.keys = Object.keys(parsed);
      if (showValues) summary.values = parsed;
    } else if (contentType.includes('x-www-form-urlencoded')) {
      const form = new URLSearchParams(raw);
      summary.keys = [...form.keys()];
      if (showValues) summary.values = Object.fromEntries(form);
    }
  } catch {
    summary.unparsable = true;
  }
  return summary;
}

const server = createServer((req, res) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const url = new URL(req.url ?? '/', 'http://capture.local');
    const headers = {};
    // rawHeaders keeps the names exactly as the client sent them (case and order).
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      const name = req.rawHeaders[i];
      headers[name] = describeValue(name, req.rawHeaders[i + 1]);
    }
    const query = showValues ? Object.fromEntries(url.searchParams) : [...url.searchParams.keys()];
    const body = describeBody(Buffer.concat(chunks).toString('utf8'), req.headers['content-type']);
    console.log(JSON.stringify({ method: req.method, path: url.pathname, query, headers, body }));
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(replyBody);
    if (once) server.close(() => process.exit(0));
  });
});

server.listen(Number(option('port', '0')), '127.0.0.1', () => {
  console.log(`LISTENING http://127.0.0.1:${server.address().port}`);
});
