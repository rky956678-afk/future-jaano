// Augment Node http.IncomingMessage which Express.Request extends.
// Declares req.log (added at runtime by pino-http middleware).
// We use "http" module augmentation because tsconfig has types:["node"],
// guaranteeing the "http" module is always in scope.
declare module "http" {
  interface IncomingMessage {
    log: import("pino").Logger;
  }
}
