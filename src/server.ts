import { createServer } from "node:http";
import { ensureDefaultAdmin } from "./services/auth.ts";
import { loadState, resetState, saveState } from "./data/runtimeStore.ts";
import { initialState } from "./data/seed.ts";
import { sendJson, send } from "./lib/http.ts";
import { handleAdminRoutes } from "./routes/adminRoutes.ts";
import { handleIntakeRoutes } from "./routes/intakeRoutes.ts";
import { handleOperationsRoutes } from "./routes/operationsRoutes.ts";
import { handlePaymentRoutes } from "./routes/paymentRoutes.ts";
import { handlePublicRoutes } from "./routes/publicRoutes.ts";
import { registerTypeformWebhook } from "./services/typeform.ts";
import { getEmailProviderLabel } from "./services/emailDelivery.ts";
import { getPaymentProviderLabel } from "./services/payments.ts";
import type { RouteHandler } from "./routes/routeContext.ts";

const port = Number(process.env.PORT ?? 3000);

const routeHandlers: RouteHandler[] = [
  handlePublicRoutes,
  handleAdminRoutes,
  handleIntakeRoutes,
  handlePaymentRoutes,
  handleOperationsRoutes
];

if (process.env.DEMO_RESET === "true") {
  resetState();
} else {
  const state = loadState();
  if (state.clients.length === 0) {
    saveState(initialState());
  }
}

ensureDefaultAdmin();

void registerTypeformWebhook().catch((error) => {
  console.error("Typeform webhook registration skipped:", error instanceof Error ? error.message : error);
});

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const state = loadState();

  try {
    for (const handler of routeHandlers) {
      if (await handler({ request, response, url, state })) {
        return;
      }
    }

    send(response, 404, "<h1>Not found</h1>");
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

server.listen(port, () => {
  console.log(`Fell Concierge running at http://localhost:${port} with ${getPaymentProviderLabel()} and email via ${getEmailProviderLabel()}`);
});
