import type { Config } from "drizzle-kit";

/* export default {
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config; */
export default {
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: "http://127.0.0.1:8080",
    //authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
