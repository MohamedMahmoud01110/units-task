import { ensureTopic } from "./kafka.client.js";

export const startConsumer = async ({
  kafka,
  groupId,
  topic,
  handler,
  logger,
}) => {
  await ensureTopic(kafka, topic);
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      try {
        const event = JSON.parse(message.value.toString());
        logger.info("Message received", {
          topic,
          partition,
          offset: message.offset,
        });
        await handler(event);
      } catch (err) {
        // A bad message must not crash the consumer loop.
        logger.error("Failed to process message", {
          topic,
          offset: message.offset,
          error: err.message,
        });
      }
    },
  });

  logger.info("Kafka consumer running", { topic, groupId });
  return consumer;
};
