import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

export function validate(schema: ZodSchema, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[part]);

    if (part === "body") {
      req.body = parsed;
    } else if (part === "params") {
      Object.assign(req.params, parsed);
    } else {
      // Express query can be read-only; replace via defineProperty
      Object.defineProperty(req, "query", {
        value: parsed,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    next();
  };
}
