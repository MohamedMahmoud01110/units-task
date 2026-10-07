const toDto = (post) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  author: post.author,
  createdAt: post.createdAt,
});

export const createPostController = ({ createPost, getPost, listPosts }) => ({
  create: async (req, res) => {
    const post = await createPost.execute(req.body);
    res.status(201).json(toDto(post));
  },
  get: async (req, res) => {
    const post = await getPost.execute(req.params.id);
    res.json(toDto(post));
  },
  list: async (req, res) => {
    const { items, meta } = await listPosts.execute(req.query);
    res.json({ data: items.map(toDto), meta });
  },
});
