export const POST_CREATED_TOPIC = 'post.created';

export const createPostCreatedEvent = (post) => ({
  type: POST_CREATED_TOPIC,
  version: 1,
  occurredAt: new Date().toISOString(),
  data: {
    id: post.id,
    title: post.title,
    author: post.author,
    createdAt: post.createdAt,
  },
});
