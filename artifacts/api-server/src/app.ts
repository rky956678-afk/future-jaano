import express, { type Express, type RequestHandler } from "express";
import cors from "cors";
const pinoHttp = require("pino-http");

import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";

import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },

      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// cors() types (CorsRequest) are incompatible with Express 5 strict RequestHandler - cast needed
app.use(cors({ credentials: true, origin: true }) as unknown as RequestHandler);

// express.json/urlencoded return connect NextHandleFunction, not Express 5 RequestHandler
app.use(express.json({ limit: "10mb" }) as unknown as RequestHandler);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }) as unknown as RequestHandler,
);

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      // Express 5 generic Request doesn't statically satisfy { headers: IncomingHttpHeaders }
      // under TS 5.9 strict overload checking - cast to satisfy the structural type
      getClerkProxyHost(req as { headers: Record<string, string | string[] | undefined> }) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

export default app;