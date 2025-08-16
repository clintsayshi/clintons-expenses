import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { relations } from "drizzle-orm/relations";
import { sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const usersTable = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  isActive: integer("is_active").notNull().default(1),

  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const userRelations = relations(usersTable, ({ many }) => ({
  expenses: many(expensesTable),
}));

export const userInsertSchema = createInsertSchema(usersTable);
export const userSelectSchema = createSelectSchema(usersTable);

export type UserInsertType = InferInsertModel<typeof usersTable>;
export type UserSelectType = InferSelectModel<typeof usersTable>;

export const expensesTable = sqliteTable("expenses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull(),

  name: text("name").notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  category: text("category"),
  paymentMethod: text("payment_method"),
  notes: text("notes"),
  currency: text("currency").notNull().default("ZAR"), // South African Rand
  //date: integer({ mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`), // Explicit expense date

  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const expenseRelations = relations(expensesTable, ({ one, many }) => ({
  user: one(usersTable),
  items: many(expenseItems),
}));

export const expenseInsertSchema = createInsertSchema(expensesTable);
export const expenseSelectSchema = createSelectSchema(expensesTable);

export type ExpenseInsertType = InferInsertModel<typeof expensesTable>;
export type ExpenseSelectType = InferSelectModel<typeof expensesTable>;

export const expenseItems = sqliteTable("expense_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  expenseId: text("expense_id")
    .notNull()
    .references(() => expensesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text(),
  amount: real("amount").notNull(),

  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const expenseItemInsertSchema = createInsertSchema(expenseItems);
export const expenseItemSelectSchema = createSelectSchema(expenseItems);
export const expenseItemsUpdateSchema = createUpdateSchema(expenseItems);
export type ExpenseItemInsertType = InferInsertModel<typeof expenseItems>;
export type ExpenseItemSelectType = InferSelectModel<typeof expenseItems>;
