const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined) throw new Error(`Missing env var: ${name}`);
  return value;
};

export const env = {
  port: Number(required('PORT', 3000)),
  mongoUri: required('MONGO_URI', 'mongodb://localhost:27017/posts'),
  kafkaBrokers: required('KAFKA_BROKERS', 'localhost:9092').split(','),
  kafkaClientId: required('KAFKA_CLIENT_ID', 'posts-service'),
  kafkaGroupId: required('KAFKA_GROUP_ID', 'posts-consumer-group'),
};
