import { expenseItems, expensesTable, groceryItems } from "@/db/schema";
import { db, drizzleDb } from "../../turso";
import { drizzle } from "drizzle-orm/libsql";

import { desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const handleError = (error: unknown, functionName: string) => {
  console.error(`Error in ${functionName}:`, error);
  throw new Error(`Error in ${functionName}: ${error}`);
};

export async function createExpense({
  name,
  amount = 0,
  userId,
  currency = "ZAR", // default currency
  //date = Date.now(), // default to current timestamp (ms)
  description = null,
  category = null,
  paymentMethod = null,
  notes = null,
}: {
  name: string;
  amount?: number;
  userId: string;
  currency?: string;
  date?: number;
  description?: string | null;
  category?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
}) {
  const orm = drizzle(db);

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

export async function getAllExpenses() {
  try {
    const orm = drizzle(db);

    const expenses = await orm.select().from(expensesTable).all();
    if (expenses.length === 0) {
      return [];
    }

    return expenses;
  } catch (error) {
    return handleError(error, "getAllExpenses");
  }
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

/*
 * Get grocery expenses for a selected expense
 *
 */
export async function getGroceriesByExpenseId(expenseId: string) {
  try {
    const orm = drizzle(db);

    const expenses = await orm
      .select()
      .from(groceryItems)
      // TODO: remove comment soon as you can test online
      .where(eq(groceryItems.expenseId, expenseId))
      .orderBy(desc(groceryItems.createdAt))
      .all();
    if (expenses.length === 0) {
      return [];
    }

    return expenses;
  } catch (error) {
    return handleError(error, "getGroceriesByExpenseId");
  }
}

export async function getExpenseById(expenseId: string) {
  try {
    const expense = await drizzleDb.query.expensesTable.findMany({
      with: {
        items: true,
      },
      where: eq(expensesTable.id, expenseId),
    });

    if (expense.length === 0) {
      return [];
    }

    return expense;
  } catch (error) {
    return handleError(error, "getExpenseById");
  }
}

export async function addExpenseItem(
  expenseId: string,
  name: string,
  amount: number,
  description = null
) {
  const orm = drizzle(db);
  const [newExpenseItem] = await orm
    .insert(expenseItems)
    .values({
      id: uuidv4(),
      name: name,
      amount: amount,
      expenseId: expenseId,
      description: description,
    })
    .returning();

  return newExpenseItem;
}

export async function addGroceryItem(
  expenseId: string,
  name: string,
  amount: number,
  brand: string | null = null,
  description: string | null = null
) {
  const orm = drizzle(db);
  const [newExpenseItem] = await orm
    .insert(groceryItems)
    .values({
      id: uuidv4(),
      name: name,
      amount: amount,
      expenseId: expenseId,
      brand: brand,
      description: description,
    })
    .returning();

  return newExpenseItem;
}

export async function deleteExpense(id: string) {
  try {
    const deletedExpense = await drizzleDb
      .delete(expensesTable)
      .where(eq(expensesTable.id, id))
      .returning();

    if (deletedExpense.length === 0) {
      console.log("unable to delete");
      throw new Error("Error deleting expense");
    }

    return deleteExpense;
  } catch (error) {
    return handleError(error, "deleteExpense");
  }
}
