import { ValidationError } from "./errors.js";

const RULES = {
  title: { max: 120 },
  content: { max: 5000 },
  author: { max: 60 },
};

export class Post {
  constructor({ id = null, title, content, author, createdAt = new Date() }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.author = author;
    this.createdAt = createdAt;
  }

  static create({ title, content, author }) {
    const details = [];
    const clean = {};
    const input = { title, content, author };

    for (const [field, { max }] of Object.entries(RULES)) {
      const value = input[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        details.push({ field, message: `${field} is required` });
        continue;
      }
      if (value.trim().length > max) {
        details.push({
          field,
          message: `${field} must be at most ${max} characters`,
        });
        continue;
      }
      clean[field] = value.trim();
    }

    if (details.length) throw new ValidationError("Invalid post data", details);
    return new Post(clean);
  }
}
