import mongoose from "mongoose";
import { PostRepository } from "../../domain/post.repository.js";
import { Post } from "../../domain/post.entity.js";
import { PostModel } from "../db/post.model.js";

const toEntity = (doc) =>
  new Post({
    id: doc._id.toString(),
    title: doc.title,
    content: doc.content,
    author: doc.author,
    createdAt: doc.createdAt,
  });

export class MongoPostRepository extends PostRepository {
  async save(post) {
    const doc = await PostModel.create({
      title: post.title,
      content: post.content,
      author: post.author,
    });
    return toEntity(doc);
  }

  async findById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await PostModel.findById(id).lean();
    return doc ? toEntity(doc) : null;
  }

  async findAll({ page, limit }) {
    const [docs, total] = await Promise.all([
      PostModel.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PostModel.countDocuments(),
    ]);
    return { items: docs.map(toEntity), total };
  }
}
