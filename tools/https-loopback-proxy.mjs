import { spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { createServer } from "node:https";
import { request as httpRequest } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";

const listenPort = Number(process.env.PAT_HTTPS_PROXY_PORT ?? "3443");
const targetPort = Number(process.env.PAT_HTTP_TARGET_PORT ?? "3000");
const suffix = `${process.pid}-${Date.now()}`;
const keyPath = join(tmpdir(), `predent-pat-${suffix}.key.pem`);
const certPath = join(tmpdir(), `predent-pat-${suffix}.cert.pem`);

const generated = spawnSync(
  "openssl",
  [
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-sha256",
    "-nodes",
    "-keyout",
    keyPath,
    "-out",
    certPath,
    "-days",
    "1",
    "-subj",
    "/CN=localhost",
    "-addext",
    "subjectAltName=DNS:localhost,IP:127.0.0.1",
  ],
  { stdio: "ignore" }
);

if (generated.status !== 0) {
  throw new Error(
    "Unable to generate the localhost TLS certificate. OpenSSL is required for the compiled PAT browser gate."
  );
}

const cleanup = () => {
  rmSync(keyPath, { force: true });
  rmSync(certPath, { force: true });
};

const server = createServer(
  {
    key: readFileSync(keyPath),
    cert: readFileSync(certPath),
  },
  (request, response) => {
    const upstream = httpRequest(
      {
        hostname: "127.0.0.1",
        port: targetPort,
        method: request.method,
        path: request.url,
        headers: request.headers,
      },
      upstreamResponse => {
        response.writeHead(
          upstreamResponse.statusCode ?? 502,
          upstreamResponse.statusMessage,
          upstreamResponse.headers
        );
        upstreamResponse.pipe(response);
      }
    );

    upstream.on("error", error => {
      if (!response.headersSent) {
        response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      }
      response.end(`Loopback proxy upstream error: ${error.message}`);
    });

    request.pipe(upstream);
  }
);

server.listen(listenPort, "0.0.0.0", () => {
  console.log(
    `[pat-e2e] HTTPS loopback proxy listening on https://localhost:${listenPort} -> http://127.0.0.1:${targetPort}`
  );
});

const shutdown = () => {
  server.close(() => {
    cleanup();
    process.exit(0);
  });
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
process.once("exit", cleanup);
