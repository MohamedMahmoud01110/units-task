import { Kafka, logLevel } from "kafkajs";

export const createKafka = ({ brokers, clientId }) =>
  new Kafka({
    clientId,
    brokers,
    logLevel: logLevel.WARN,
    retry: { initialRetryTime: 300, retries: 10 },
  });

export const ensureTopic = async (kafka, topic) => {
  const admin = kafka.admin();
  await admin.connect();
  try {
    await admin.createTopics({
      topics: [{ topic, numPartitions: 3, replicationFactor: 1 }],
    });
  } finally {
    await admin.disconnect();
  }
};
