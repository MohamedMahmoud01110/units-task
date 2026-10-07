import { NotFoundError } from "../domain/errors.js";

export class GetPostUseCase {
  constructor({ postRepository }) {
    this.postRepository = postRepository;
  }

  async execute(id) {
    const post = await this.postRepository.findById(id);
    if (!post) throw new NotFoundError(`Post ${id} not found`);
    return post;
  }
}
