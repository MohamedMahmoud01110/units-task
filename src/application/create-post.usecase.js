import { Post } from "../domain/post.entity.js";
import {
  POST_CREATED_TOPIC,
  createPostCreatedEvent,
} from "../domain/events/post-created.event.js";

export class CreatePostUseCase {
  constructor({ postRepository, eventPublisher, logger }) {
    this.postRepository = postRepository;
    this.eventPublisher = eventPublisher;
    this.logger = logger;
  }

  async execute(input) {
    const post = Post.create(input);
    const saved = await this.postRepository.save(post);

    try {
      await this.eventPublisher.publish(
        POST_CREATED_TOPIC,
        createPostCreatedEvent(saved),
      );
    } catch (err) {
      this.logger.error("Failed to publish post.created", {
        postId: saved.id,
        error: err.message,
      });
    }

    return saved;
  }
}
