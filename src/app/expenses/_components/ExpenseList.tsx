"use client";

import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
//import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

type Expense = {
  id: string;
  name: string;
  amount?: number;
  category?: string;
  currency?: string;
  description?: string;
  notes?: string;
  paymentMethod?: string;
  userId: string;

  createdAt: string;
};

const expenseSchema = z.object({
  name: z.string(),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

export default function ExpenseList() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<Array<Expense>>([]);
  //const router = useRouter();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  async function fetchExpenses() {
    try {
      setLoading(true);
      // Get the current user's JWT token
      const { data } = await supabase.auth.getSession();
      const jwtToken = data?.session?.access_token;

      if (!jwtToken) {
        throw new Error("Missing JWT token");
      }

      const response = await fetch("/api/expenses", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json);
      }

      const json = await response.json();
      setExpenses(json.expenses);
      setExpenses(json.expenses);
    } catch {
      // Error fetching expenses
    } finally {
      setLoading(false);
    }
  }

  async function handleAddExpense(data: ExpenseForm) {
    const exists = expenses.find((expense) => expense.name === data.name);
    if (exists) {
      // Duplicate expense error
      return;
    }

    try {
      // Get the current user's JWT token
      const { data: authData } = await supabase.auth.getSession();
      const jwtToken = authData?.session?.access_token;

      if (!jwtToken) {
        throw new Error("Missing JWT token");
      }

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          name: data.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Error adding new expense");
      }

      await response.json();
      reset();

      fetchExpenses();
    } catch {
      // Error adding expense
    }
  }

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      <header className="pt-5 flex justify-between items-center mb-5">
        <h1 className="text-xl font-semibold ">MoneyRight</h1>
        <button onClick={handleSignOut}>Logout</button>
      </header>

      <form className="mb-5" onSubmit={handleSubmit(handleAddExpense)}>
        <input
          {...register("name", {
            validate: async (value) => {
              const exists = await expenses.find(
                (expense) => expense.name === value
              );
              if (exists) {
                return "Error: duplicate expense";
              }
            },
          })}
          name="name"
          placeholder="+ Enter expense name"
          className="px-2 py-1 w-full border rounded mb-2"
        />
        <div className="my-2">
          {errors.name && (
            <p className="text-sm text-red-500 block">{errors.name.message}</p>
          )}
        </div>
      </form>

      {/* Favorites Here */}
      <div></div>

      <ul className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <li key={idx}>
              <div className="block p-2 rounded bg-gray-100 animate-pulse">
                <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
              </div>
            </li>
          ))
        ) : expenses.length > 0 ? (
          expenses.map((exp) => (
            <li key={exp.id}>
              <Link
                href={`/expenses/${exp.id}`}
                className="block p-2 border rounded hover:bg-gray-100"
              >
                {exp.name}
              </Link>
            </li>
          ))
        ) : (
          <li className="text-gray-500">No expenses found.</li>
        )}
      </ul>
    </div>
  );
}
