import type { IncomingMessage, ServerResponse } from "node:http";
import type { AppState } from "../types.ts";

export interface RouteContext {
  request: IncomingMessage;
  response: ServerResponse;
  url: URL;
  state: AppState;
}

export type RouteHandler = (context: RouteContext) => Promise<boolean>;
