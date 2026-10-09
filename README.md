# Posts Service

A small backend for posts, built to practice a clean DDD structure, a basic event flow with Kafka, and deploying with Docker on AWS.

Live: http://16.171.117.37 (health check: http://16.171.117.37/health)

Stack: Node.js, Express, MongoDB (Mongoose), Apache Kafka, Docker Compose, AWS EC2.

## How it works

```
POST /api/posts -> API -> MongoDB (save post)
                      \-> Kafka topic "post.created" -> Consumer (logs the event)
```

When a post is created, it is saved in MongoDB first. Then the API publishes a `post.created` event to Kafka. A separate consumer service reads that event and logs it.

If Kafka is down, the post is still saved and the request succeeds. The error is only logged.

## Project structure

```
src/
  domain/           Post entity, business rules, repository and publisher interfaces
  application/      Use cases: create, get, list posts, and the event handler
  infrastructure/   MongoDB model and repository, Kafka producer and consumer
  api/              Express routes, controllers, validation, error handling
  app.js            builds the Express app and injects dependencies
  server.js         API entrypoint
  consumer.js       consumer entrypoint
```

The rule I followed: dependencies only point inward. The domain layer does not import Express, Mongoose or KafkaJS. Use cases receive the repository and the event publisher in their constructor, so the real Mongo and Kafka code lives only in `infrastructure/`. This also lets the tests run the whole API with an in-memory repository.

## Run it

You need Docker and Docker Compose.

```bash
git clone https://github.com/MohamedMahmoud01110/units-task.git
cd units-task
cp .env.example .env
docker compose up -d --build
docker compose ps
curl http://localhost/health
```

By default the API is on port 3000 (set `HOST_PORT` in `.env` to change it; I use 80 on the server). If you keep 3000, use `http://localhost:3000`.

To see the Kafka flow, open the consumer logs in one terminal and create a post in another:

```bash
docker compose logs -f consumer
```

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","content":"First post","author":"Mohamed"}'
```

The consumer prints the received event.

Stop everything with `docker compose down` (add `-v` to remove the data).

### Running without Docker for the API

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d mongo kafka
cp .env.example .env
npm install
npm run dev
npm run dev:consumer
npm test
```

## API

| Method | Path | Description |
|---|---|---|
| POST | /api/posts | Create a post (title, content, author), returns 201 |
| GET | /api/posts/:id | Get one post, 404 if not found |
| GET | /api/posts?page=1&limit=10 | List posts, newest first, with pagination info |
| GET | /health | Server and MongoDB status |

Errors always look like `{ "error": { "code": "...", "message": "..." } }`.

A Postman collection is in `postman/`. Import it and set the `baseUrl` variable to `http://localhost:3000` or the live URL.

## Notes

- The consumer runs in its own container so it is clearly separate from the API.
- Kafka runs in KRaft mode, so no Zookeeper is needed. Its memory is limited so it fits on a small server.
- Events use the post id as the message key.
- The compose file has healthchecks, and the API waits for MongoDB and Kafka to be healthy before starting.
- Input is checked with Zod at the API edge, and the Post entity enforces its own rules.

## Deployment (AWS EC2)

I deployed it on a t3.small Ubuntu instance with an Elastic IP. The security group allows SSH (22) and HTTP (80). Steps:

1. Install Docker: `curl -fsSL https://get.docker.com | sudo sh`, then add the user to the `docker` group.
2. Add a 2 GB swap file, because Kafka uses a lot of memory.
3. Clone the repo, copy `.env.example` to `.env`, set `HOST_PORT=80`.
4. Run `docker compose up -d --build`.

To update: `git pull && docker compose up -d --build`.
