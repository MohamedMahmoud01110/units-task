import { ZodError } from "zod";
import { NotFoundError, ValidationError } from "../../domain/errors.js";

export const createErrorHandler = (logger) => (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details,
      },
    });
  }
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: err.message,
        details: err.details,
      },
    });
  }
  if (err instanceof NotFoundError) {
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: err.message } });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "Malformed JSON body" },
    });
  }
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  });
};

export const notFoundHandler = (_req, res) =>
  res
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "Route not found" } });
