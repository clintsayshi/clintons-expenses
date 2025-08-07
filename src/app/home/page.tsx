"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../components/AuthProvider";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

// Zod schema for expense form
const expenseSchema = z.object({
  name: z.string().min(1, "Expense name is required"),
  cost: z.number().min(0.01, "Cost must be greater than 0"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface Expense {
  id: number;
  name: string;
  cost: number;
  user_id: string;
}

export default function HomePage() {
  const { session } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingExpenses, setFetchingExpenses] = useState(true);
  const supabaseClient = supabase;
  const [userId, setUserId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: "",
      cost: 0,
    },
  });

  const costValue = watch("cost");

  // Fetch expenses from API
  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      } else {
        console.error("Error fetching expenses");
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setFetchingExpenses(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchExpenses();
    }
  }, [session?.access_token]);

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setLoading(true);
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        reset();
        // Refresh the expenses list
        await fetchExpenses();
        console.log("Expense added successfully!");
      } else {
        const errorData = await response.json();
        console.error("Error adding expense:", errorData);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-lg space-y-4">
            {/* <div className="flex justify-between space-x-2">
              <select className="flex-1 bg-blue-100 text-blue-900 font-medium rounded-full px-4 py-2">
                <option>Cash</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </select>
              <select className="flex-1 bg-green-100 text-green-900 font-medium rounded-full px-4 py-2">
                <option>Shopping</option>
                <option>Food</option>
                <option>Gifts</option>
              </select>
            </div> */}

            {/* Cost Input */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                R{costValue.toFixed(2)}
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("cost", { valueAsNumber: true })}
                className="w-full text-center text-2xl font-bold text-gray-800 bg-transparent border-none outline-none"
              />
              {errors.cost && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.cost.message}
                </div>
              )}
            </div>

            {/* Name Input */}
            <input
              type="text"
              placeholder="Expense name..."
              {...register("name")}
              className="w-full border text-black border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.name && (
              <div className="text-red-500 text-sm mt-1">
                {errors.name.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>

        {/* Real Expenses List */}
        <div className="mt-8 bg-white rounded-2xl p-5 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Expenses
          </h2>
          {fetchingExpenses ? (
            <div className="text-center text-gray-500">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center text-gray-500">No expenses yet</div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {expense.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {expense.id}
                    </div>
                  </div>
                  <div className="font-bold text-green-600">
                    R{expense.cost.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
