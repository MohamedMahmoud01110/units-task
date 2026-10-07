export class ListPostsUseCase {
  constructor({ postRepository }) {
    this.postRepository = postRepository;
  }

  async execute({ page, limit }) {
    const { items, total } = await this.postRepository.findAll({ page, limit });
    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
