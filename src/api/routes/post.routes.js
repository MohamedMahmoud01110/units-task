import { Router } from "express";
import {
  validate,
  createPostSchema,
  listQuerySchema,
} from "../middlewares/validate.js";

const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const createPostRoutes = (controller) => {
  const router = Router();
  router.post("/", validate(createPostSchema), wrap(controller.create));
  router.get("/", validate(listQuerySchema, "query"), wrap(controller.list));
  router.get("/:id", wrap(controller.get));
  return router;
};
