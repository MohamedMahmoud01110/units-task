import { env } from "./config/env.js";
import { logger } from "./infrastructure/logger.js";
import {
  connectMongo,
  disconnectMongo,
  isMongoUp,
} from "./infrastructure/db/mongo.connection.js";
import { MongoPostRepository } from "./infrastructure/repositories/mongo-post.repository.js";
import { createKafka } from "./infrastructure/kafka/kafka.client.js";
import { KafkaEventPublisher } from "./infrastructure/kafka/producer.js";
import { createApp } from "./app.js";

await connectMongo(env.mongoUri);
logger.info("MongoDB connected");



const app = createApp({
  postRepository: new MongoPostRepository(),
  eventPublisher,
  logger,
  healthCheck: async () => ({ mongo: isMongoUp() }),
});

const server = app.listen(env.port, () =>
  logger.info(`API listening on :${env.port}`),
);

const shutdown = async (signal) => {
  logger.info(`${signal} received, shutting down`);
  server.close();
  await eventPublisher.disconnect();
  await disconnectMongo();
  process.exit(0);
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
