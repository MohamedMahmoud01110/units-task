import { EventPublisher } from "../../domain/event-publisher.js";
import { ensureTopic } from "./kafka.client.js";

export class KafkaEventPublisher extends EventPublisher {
  constructor({ kafka, logger }) {
    super();
    this.kafka = kafka;
    this.logger = logger;
    this.producer = kafka.producer({ allowAutoTopicCreation: false });
    this.connected = false;
    this.knownTopics = new Set();
  }

  async #ensureReady(topic) {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
      this.logger.info("Kafka producer connected");
    }
    if (!this.knownTopics.has(topic)) {
      await ensureTopic(this.kafka, topic);
      this.knownTopics.add(topic);
    }
  }

  async publish(topic, event) {
    try {
      await this.#ensureReady(topic);
      await this.producer.send({
        topic,
        messages: [
          { key: String(event.data.id), value: JSON.stringify(event) },
        ],
      });
      this.logger.info("Event published", { topic, postId: event.data.id });
    } catch (err) {
      this.connected = false; // reconnect on the next publish
      throw err;
    }
  }

  async disconnect() {
    if (this.connected) await this.producer.disconnect();
  }
}
