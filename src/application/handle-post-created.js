export const createPostCreatedHandler =
  ({ logger }) =>
  async (event) => {
    logger.info("post.created event processed", {
      postId: event.data.id,
      title: event.data.title,
      author: event.data.author,
      occurredAt: event.occurredAt,
    });
  };
