import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string(),
  content: z.string(),
  author: z.string(),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const validate =
  (schema, source = "body") =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
    });
    next();
  };
