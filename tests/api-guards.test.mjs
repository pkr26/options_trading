import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise the real shared reader without importing the Workers-only DB/auth
// adapters into Node. Those two boundaries are irrelevant to byte accounting.
const source = readFileSync(new URL("../lib/api.ts", import.meta.url), "utf8").replace(/^import .*;\r?\n/gm, "");
const compiled = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
const exports = {};
vm.runInNewContext(compiled, {exports, Request, Response, URL, Uint8Array, TextDecoder, console}, {filename: "lib/api.ts"});
const {readJsonBody, MAX_JSON_BYTES} = exports;

function request(body, headers = {}) {
  return new Request("http://localhost/api/notes", {method: "PUT", headers: {"Content-Type": "application/json", ...headers}, body, ...(typeof body === "string" ? {} : {duplex: "half"})});
}

test("the measured JSON limit rejects headerless and underdeclared oversized bodies", async () => {
  const body = JSON.stringify({ignored: "x".repeat(MAX_JSON_BYTES)});
  for (const headers of [{}, {"Content-Length": "10"}, {"Content-Length": String(Buffer.byteLength(body))}]) {
    await assert.rejects(readJsonBody(request(body, headers)), error => error.status === 413);
  }
});

test("streamed JSON is cancelled at the byte bound instead of buffering the rest", async () => {
  let cancelled = false;
  let pulls = 0;
  const stream = new ReadableStream({
    pull(controller) { pulls++; controller.enqueue(new Uint8Array(16 * 1024)); },
    cancel() { cancelled = true; },
  });
  await assert.rejects(readJsonBody(request(stream)), error => error.status === 413);
  assert.equal(cancelled, true);
  assert.ok(pulls <= 6, `Reader pulled ${pulls} chunks after its budget`);
});

test("10,000-code-unit Unicode and fully escaped notes fit the byte policy", async () => {
  for (const content of ["学".repeat(10000), "\u0000".repeat(10000)]) {
    const body = JSON.stringify({lessonId: 1, content});
    assert.ok(Buffer.byteLength(body) < MAX_JSON_BYTES);
    const result = await readJsonBody(request(body, {"Content-Length": String(Buffer.byteLength(body))}));
    assert.equal(result.content, content);
  }
});

test("invalid UTF-8 and malformed JSON are rejected within the measured budget", async () => {
  await assert.rejects(readJsonBody(request(new Uint8Array([0xff]))), error => error.status === 400);
  await assert.rejects(readJsonBody(request("{")), error => error.name === "SyntaxError");
});
