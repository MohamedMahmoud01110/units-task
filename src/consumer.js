import { env } from "./config/env.js";
import { logger } from "./infrastructure/logger.js";
import { createKafka } from "./infrastructure/kafka/kafka.client.js";
import { startConsumer } from "./infrastructure/kafka/consumer.js";
import { POST_CREATED_TOPIC } from "./domain/events/post-created.event.js";
import { createPostCreatedHandler } from "./application/handle-post-created.js";

const kafka = createKafka({
  brokers: env.kafkaBrokers,
  clientId: `${env.kafkaClientId}-consumer`,
});

const consumer = await startConsumer({
  kafka,
  groupId: env.kafkaGroupId,
  topic: POST_CREATED_TOPIC,
  handler: createPostCreatedHandler({ logger }),
  logger,
});

const shutdown = async () => {
  await consumer.disconnect();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
