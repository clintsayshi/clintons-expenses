import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { relations } from "drizzle-orm/relations";
import { sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Users table - enhanced with billing cycle preferences
export const usersTable = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => uuidv4()),
    name: text("name").notNull().unique(),
    email: text("email").notNull().unique(),
    phone: text("phone").unique(),
    isActive: integer("is_active").notNull().default(1),

    // User's custom billing cycle preferences
    billingCycleStart: integer("billing_cycle_start").notNull().default(1), // Day of month (1-31)
    billingCycleEnd: integer("billing_cycle_end").notNull().default(31), // Day of month (1-31)
    // For weekly/bi-weekly cycles, users can set start=1, end=7 or start=1, end=14

    createdAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
});

export const userRelations = relations(usersTable, ({ many }) => ({
    expenses: many(expensesTable),
    recurringExpenses: many(recurringExpensesTable),
    billingPeriods: many(billingPeriodsTable),
}));

// Billing periods - tracks user's custom expense tracking periods
export const billingPeriodsTable = sqliteTable("billing_periods", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => uuidv4()),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),

    name: text("name").notNull(), // e.g., "January 2024", "Week 1 Feb 2024"
    startDate: integer({ mode: "timestamp_ms" }).notNull(),
    endDate: integer({ mode: "timestamp_ms" }).notNull(),
    isActive: integer("is_active").notNull().default(1), // Current active period

    createdAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
});

export const billingPeriodRelations = relations(billingPeriodsTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [billingPeriodsTable.userId],
        references: [usersTable.id],
    }),
    expenses: many(expensesTable),
}));

// Recurring expense templates - defines the pattern for recurring expenses
export const recurringExpensesTable = sqliteTable("recurring_expenses", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => uuidv4()),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    amount: real("amount").notNull(),
    description: text("description"),
    category: text("category"),
    paymentMethod: text("payment_method"),
    notes: text("notes"),
    currency: text("currency").notNull().default("ZAR"),

    // Recurrence settings
    recurrenceType: text("recurrence_type").notNull(), // 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'
    recurrenceInterval: integer("recurrence_interval").notNull().default(1), // Every X periods
    dayOfRecurrence: integer("day_of_recurrence"), // Day of month for monthly (1-31), day of week for weekly (0-6)

    isActive: integer("is_active").notNull().default(1),

    createdAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
});

export const recurringExpenseRelations = relations(recurringExpensesTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [recurringExpensesTable.userId],
        references: [usersTable.id],
    }),
    expenses: many(expensesTable), // Generated expenses from this template
    items: many(recurringExpenseItems), // Template items
}));

// Template items for recurring expenses
export const recurringExpenseItems = sqliteTable("recurring_expense_items", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => uuidv4()),
    recurringExpenseId: text("recurring_expense_id")
        .notNull()
        .references(() => recurringExpensesTable.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    description: text("description"),
    amount: real("amount").notNull(),

    createdAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
});

export const recurringExpenseItemRelations = relations(recurringExpenseItems, ({ one }) => ({
    recurringExpense: one(recurringExpensesTable, {
        fields: [recurringExpenseItems.recurringExpenseId],
        references: [recurringExpensesTable.id],
    }),
}));

// Enhanced expenses table - actual expense instances
export const expensesTable = sqliteTable("expenses", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => uuidv4()),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    billingPeriodId: text("billing_period_id")
        .notNull()
        .references(() => billingPeriodsTable.id, { onDelete: "cascade" }),
    recurringExpenseId: text("recurring_expense_id")
        .references(() => recurringExpensesTable.id, { onDelete: "set null" }), // null if one-time expense

    name: text("name").notNull(),
    amount: real("amount").notNull(),
    description: text("description"),
    category: text("category"),
    paymentMethod: text("payment_method"),
    notes: text("notes"),
    currency: text("currency").notNull().default("ZAR"),

    // Expense status tracking
    status: text("status").notNull().default("pending"), // 'pending', 'paid', 'overdue', 'cancelled'
    dueDate: integer({ mode: "timestamp_ms" }), // When this expense is due
    paidDate: integer({ mode: "timestamp_ms" }), // When it was actually paid

    isRecurring: integer("is_recurring").notNull().default(0), // 1 if generated from recurring template

    createdAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
});

export const expenseRelations = relations(expensesTable, ({ one, many }) => ({
    user: one(usersTable, {
        fields: [expensesTable.userId],
        references: [usersTable.id],
    }),
    billingPeriod: one(billingPeriodsTable, {
        fields: [expensesTable.billingPeriodId],
        references: [billingPeriodsTable.id],
    }),
    recurringExpense: one(recurringExpensesTable, {
        fields: [expensesTable.recurringExpenseId],
        references: [recurringExpensesTable.id],
    }),
    items: many(expenseItems),
    groceryItems: many(groceryItems),
}));

// Favorite expenses (unchanged)
export const favoriteExpenses = sqliteTable("favorite_expenses", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => uuidv4()),
    expenseId: text("expense_id")
        .notNull()
        .references(() => expensesTable.id, { onDelete: "cascade" }),
});

// Expense items (unchanged)
export const expenseItems = sqliteTable("expense_items", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => uuidv4()),
    expenseId: text("expense_id")
        .notNull()
        .references(() => expensesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    amount: real("amount").notNull(),

    createdAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
});

export const expenseItemRelations = relations(expenseItems, ({ one }) => ({
    expense: one(expensesTable, {
        fields: [expenseItems.expenseId],
        references: [expensesTable.id],
    }),
}));

// Grocery items (unchanged)
export const groceryItems = sqliteTable("grocery_items", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => uuidv4()),
    expenseId: text("expense_id")
        .notNull()
        .references(() => expensesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    brand: text("brand"),
    imageUrl: text("image_url"),
    amount: real("amount").notNull(),

    createdAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer({ mode: "timestamp_ms" })
        .notNull()
        .default(sql`(unixepoch() * 1000)`),
});

export const groceryItemsRelations = relations(groceryItems, ({ one }) => ({
    expense: one(expensesTable, {
        fields: [groceryItems.expenseId],
        references: [expensesTable.id],
    }),
}));

// Zod schemas and types
export const userInsertSchema = createInsertSchema(usersTable);
export const userSelectSchema = createSelectSchema(usersTable);
export type UserInsertType = InferInsertModel<typeof usersTable>;
export type UserSelectType = InferSelectModel<typeof usersTable>;

export const billingPeriodInsertSchema = createInsertSchema(billingPeriodsTable);
export const billingPeriodSelectSchema = createSelectSchema(billingPeriodsTable);
export type BillingPeriodInsertType = InferInsertModel<typeof billingPeriodsTable>;
export type BillingPeriodSelectType = InferSelectModel<typeof billingPeriodsTable>;

export const recurringExpenseInsertSchema = createInsertSchema(recurringExpensesTable);
export const recurringExpenseSelectSchema = createSelectSchema(recurringExpensesTable);
export type RecurringExpenseInsertType = InferInsertModel<typeof recurringExpensesTable>;
export type RecurringExpenseSelectType = InferSelectModel<typeof recurringExpensesTable>;

export const recurringExpenseItemInsertSchema = createInsertSchema(recurringExpenseItems);
export const recurringExpenseItemSelectSchema = createSelectSchema(recurringExpenseItems);
export type RecurringExpenseItemInsertType = InferInsertModel<typeof recurringExpenseItems>;
export type RecurringExpenseItemSelectType = InferSelectModel<typeof recurringExpenseItems>;

export const expenseInsertSchema = createInsertSchema(expensesTable);
export const expenseSelectSchema = createSelectSchema(expensesTable);
export type ExpenseInsertType = InferInsertModel<typeof expensesTable>;
export type ExpenseSelectType = InferSelectModel<typeof expensesTable>;

export const expenseItemInsertSchema = createInsertSchema(expenseItems);
export const expenseItemSelectSchema = createSelectSchema(expenseItems);
export const expenseItemsUpdateSchema = createUpdateSchema(expenseItems);
export type ExpenseItemInsertType = InferInsertModel<typeof expenseItems>;
export type ExpenseItemSelectType = InferSelectModel<typeof expenseItems>;

export const groceryItemInsertSchema = createInsertSchema(groceryItems);
export const groceryItemSelectSchema = createSelectSchema(groceryItems);
export const groceryItemUpdateSchema = createUpdateSchema(groceryItems);
export type GroceryItemInsertType = InferInsertModel<typeof groceryItems>;
export type GroceryItemSelectType = InferSelectModel<typeof groceryItems>;