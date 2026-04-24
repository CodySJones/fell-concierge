import { createReadStream } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { extname } from "node:path";

const staticContentTypes: Record<string, string> = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon"
};

export const send = (
  response: ServerResponse,
  statusCode: number,
  body: string,
  contentType = "text/html; charset=utf-8",
  headers: Record<string, string> = {}
) => {
  response.writeHead(statusCode, { "Content-Type": contentType, ...headers });
  response.end(body);
};

export const sendJson = (
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
  headers: Record<string, string> = {}
) => send(response, statusCode, JSON.stringify(payload), "application/json; charset=utf-8", headers);

export const sendStaticFile = (response: ServerResponse, filePath: string) => {
  const extension = extname(filePath).toLowerCase();
  const contentType = staticContentTypes[extension] ?? "application/octet-stream";
  response.writeHead(200, { "Content-Type": contentType });
  createReadStream(filePath).pipe(response);
};

const readBodyBuffer = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

export const parseBody = async <T>(request: IncomingMessage) => {
  const body = await readBodyBuffer(request);
  if (body.length === 0) {
    return {} as T;
  }
  return JSON.parse(body.toString("utf8")) as T;
};

export const parseFormBody = async (request: IncomingMessage) =>
  Object.fromEntries(new URLSearchParams((await readBodyBuffer(request)).toString("utf8")).entries());

export const parseRawBody = async (request: IncomingMessage) => (await readBodyBuffer(request)).toString("utf8");
