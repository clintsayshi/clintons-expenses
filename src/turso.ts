import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql/sqlite3";
import * as schema from "./db/schema";

const url = process.env.TURSO_CONNECTION_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;

export const db = createClient({
  url,
  authToken,
});
/* export const db = createClient({
  url: "http://127.0.0.1:8080",
}); */

export const drizzleDb = drizzle(db, { schema: schema });
