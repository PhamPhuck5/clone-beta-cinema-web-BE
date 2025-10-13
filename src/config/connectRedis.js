import { createClient } from "redis";

const client = createClient({
  url: "redis://127.0.0.1:6379", // mặc định cổng 6379
});

client.on("error", (err) => console.error("Redis Client Error", err));

await client.connect();

export default client;
