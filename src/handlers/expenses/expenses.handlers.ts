import { ExpenseInsertType, expensesTable } from "@/db/schema";
import { db } from "@/lib/turso";
import { drizzle } from "drizzle-orm/libsql";
import { handleError } from "@/utils/errorHandler";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/* export async function createExpense({
  name,
  amount,
  userId,
}: ExpenseInsertType) {
  try {
    const orm = drizzle(db);

    const [newExpense] = await orm
      .insert(expensesTable)
      .values({ name, amount, userId })
      .returning();

    return newExpense;
  } catch (error) {
    return handleError(error, "createExpense");
  }
} */

export async function createExpense({
  name,
  amount,
  userId,
  currency = "ZAR", // default currency
  //date = Date.now(), // default to current timestamp (ms)
  description = null,
  category = null,
  paymentMethod = null,
  notes = null,
}: {
  name: string;
  amount: number;
  userId: string;
  currency?: string;
  date?: number;
  description?: string | null;
  category?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
}) {
  const orm = drizzle(db);

  console.log("name:", name);
  console.log("amount:", amount);
  console.log("userId:", userId);
  console.log("currency:", currency);
  console.log("description:", description);
  console.log("category:", category);
  console.log("paymentMethod:", paymentMethod);
  console.log("notes:", notes);

  const [newExpense] = await orm
    .insert(expensesTable)
    .values({
      id: uuidv4(),
      name: name,
      amount: amount,
      userId,
      currency,
      //date,
      description,
      category,
      paymentMethod,
      notes,
    })
    .returning();

  return newExpense;
}

export async function getExpensesByUserId(userId: string) {
  try {
    const orm = drizzle(db);

    const expenses = await orm
      .select()
      .from(expensesTable)
      .where(eq(expensesTable.userId, userId))
      .orderBy(desc(expensesTable.createdAt))
      .all();
    if (expenses.length === 0) {
      return [];
    }

    return expenses;
  } catch (error) {
    return handleError(error, "getExpensesByUserId");
  }
}
