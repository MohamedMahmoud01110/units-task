import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { PostRepository } from "../src/domain/post.repository.js";
import { EventPublisher } from "../src/domain/event-publisher.js";

class InMemoryPostRepository extends PostRepository {
  items = [];
  async save(post) {
    const saved = { ...post, id: String(this.items.length + 1) };
    this.items.unshift(saved);
    return saved;
  }
  async findById(id) {
    return this.items.find((p) => p.id === id) ?? null;
  }
  async findAll({ page, limit }) {
    return {
      items: this.items.slice((page - 1) * limit, page * limit),
      total: this.items.length,
    };
  }
}

class FakePublisher extends EventPublisher {
  events = [];
  fail = false;
  async publish(topic, event) {
    if (this.fail) throw new Error("kafka down");
    this.events.push({ topic, event });
  }
}

const silentLogger = { info() {}, warn() {}, error() {} };
const repo = new InMemoryPostRepository();
const publisher = new FakePublisher();
let server, base;

before(async () => {
  const app = createApp({
    postRepository: repo,
    eventPublisher: publisher,
    logger: silentLogger,
  });
  server = app.listen(0);
  base = `http://localhost:${server.address().port}`;
});
after(() => server.close());

const post = (body) =>
  fetch(`${base}/api/posts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const valid = { title: "Hello", content: "World", author: "Mohamed" };

test("POST /api/posts creates a post and publishes post.created", async () => {
  const res = await post(valid);
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.title, "Hello");
  assert.equal(publisher.events.length, 1);
  assert.equal(publisher.events[0].topic, "post.created");
  assert.equal(publisher.events[0].event.data.id, body.id);
});

test("POST /api/posts returns 400 on invalid input", async () => {
  const res = await post({ title: "   ", content: "x", author: "y" });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, "VALIDATION_ERROR");
});

test("POST still succeeds when Kafka is down", async () => {
  publisher.fail = true;
  const res = await post(valid);
  publisher.fail = false;
  assert.equal(res.status, 201);
});

test("GET /api/posts/:id returns the post, 404 otherwise", async () => {
  assert.equal((await fetch(`${base}/api/posts/1`)).status, 200);
  assert.equal((await fetch(`${base}/api/posts/999`)).status, 404);
});

test("GET /api/posts paginates", async () => {
  const res = await fetch(`${base}/api/posts?page=1&limit=1`);
  const body = await res.json();
  assert.equal(body.data.length, 1);
  assert.equal(body.meta.total, 2);
  assert.equal(body.meta.totalPages, 2);
  assert.equal((await fetch(`${base}/api/posts?limit=0`)).status, 400);
});

test("GET /health responds ok", async () => {
  assert.equal((await fetch(`${base}/health`)).status, 200);
});
