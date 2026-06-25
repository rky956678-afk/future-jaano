// Augment Express Request to include req.log added by pino-http middleware
declare module "express-serve-static-core" {
  interface Request {
    log: import("pino").Logger;
  }
}
