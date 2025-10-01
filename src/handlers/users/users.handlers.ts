import { usersTable } from "@/db/schema";
import { db } from "../../turso";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export async function createOrDontUser({
  name,
  email,
  userId,
}: {
  name: string;
  email: string;
  userId: string;
}) {
  const orm = drizzle(db);

  const [newUser] = await orm
    .insert(usersTable)
    .values({
      id: userId,
      name: name,
      email: email,
    })
    .onConflictDoNothing()
    .returning();

  return newUser;
}

export async function getUserById(userId: string) {
  const orm = drizzle(db);

  const user = await orm
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  return user;
}
