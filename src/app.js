import express from "express";
import { CreatePostUseCase } from "./application/create-post.usecase.js";
import { GetPostUseCase } from "./application/get-post.usecase.js";
import { ListPostsUseCase } from "./application/list-posts.usecase.js";
import { createPostController } from "./api/controllers/post.controller.js";
import { createPostRoutes } from "./api/routes/post.routes.js";
import {
  createErrorHandler,
  notFoundHandler,
} from "./api/middlewares/error-handler.js";

export const createApp = ({
  postRepository,
  eventPublisher,
  logger,
  healthCheck = async () => ({}),
}) => {
  const createPost = new CreatePostUseCase({
    postRepository,
    eventPublisher,
    logger,
  });
  const getPost = new GetPostUseCase({ postRepository });
  const listPosts = new ListPostsUseCase({ postRepository });
  const controller = createPostController({ createPost, getPost, listPosts });

  const app = express();
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", async (_req, res) => {
    const checks = await healthCheck();
    const ok = Object.values(checks).every(Boolean);
    res.status(ok ? 200 : 503).json({
      status: ok ? "ok" : "degraded",
      uptime: process.uptime(),
      checks,
    });
  });

  app.use("/api/posts", createPostRoutes(controller));
  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));
  return app;
};
