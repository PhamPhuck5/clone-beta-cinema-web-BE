import { createClient } from "redis";

const host = process.env.REDIS_HOST || "redis";
const port = Number(process.env.REDIS_PORT) || 6379;

const client = createClient({
  socket: {
    host,
    port,
    reconnectStrategy: (retries) => Math.min(retries * 100, 2000),
  },
  maxRetriesPerRequest: null,
});

client.on("error", (err) => {
  console.error("Redis Client Error:", err.message);
});

async function connectRedis(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await client.connect();
      console.log("Connected to Redis success.");
      return client;
    } catch (err) {
      console.error(
        `Failed to connect to Redis (attempt: ${i + 1}/${retries}):`,
        err.message
      );
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error("can't connect to Redis.");
        process.exit(1);
      }
    }
  }
}

await connectRedis();
export default client;
