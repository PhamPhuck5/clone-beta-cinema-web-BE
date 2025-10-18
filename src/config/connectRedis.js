import { createClient } from "redis";

const host = process.env.REDIS_HOST;
const port = Number(process.env.REDIS_PORT);

console.log(`connect to redis at: ${host}:${port}`);

const client = createClient({
  socket: {
    host: host,
    port: port,
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
  },
});

client.on("error", (err) => console.error("Redis Client Error", err));

async function connectRedis() {
  try {
    await client.connect();
    console.log("connect to redis success!");
  } catch (err) {
    console.error("can't connect to redis:", err);
    process.exit(1);
  }
}

await connectRedis();
export default client;
