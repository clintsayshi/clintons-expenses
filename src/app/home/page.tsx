"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../components/AuthProvider";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
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
  amount: number;
  user_id: string;
}

export default function HomePage() {
  const { session } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingExpenses, setFetchingExpenses] = useState(true);

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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setLoading(true);
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: data.name,
          amount: data.cost,
        }),
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
      <main className="max-w-lg mx-auto py-4 p-5 sm:px-0">
        <header>
          <nav className="mb-5 flex justify-between items-center">
            <div className="font-bold border">Xsenses</div>

            <button className="font-medium" onClick={logout}>
              Logout
            </button>
          </nav>
        </header>

        <div>
          <h1 className="text-lg font-medium my-5">Hello, Clinton</h1>

          <div className="hidden mb-2">
            <div className="bg-white  pb-6 flex flex-col items-start ">
              <p className="text-gray-500 text-sm">Your balance</p>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold">R 3,200.00</h2>
                <Eye size={20} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="  ">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white flex-col sm:flex-row flex gap-2 items-end">
                <div className="w-full  flex flex-col items-start justify-start">
                  <label className="text-xs mb-1" id="name">
                    Expense
                  </label>
                  <input
                    id="name"
                    {...register("name")}
                    type="text"
                    placeholder="Enter expense"
                    className="w-full border-gray-600 border px-2 py-1 rounded-lg"
                  />
                  {errors.name && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </div>
                  )}
                </div>
                <div className=" w-full flex flex-col items-start justify-start">
                  <label className="text-xs mb-1" id="name">
                    Cost
                  </label>
                  <input
                    id="cost"
                    {...register("cost", { valueAsNumber: true })}
                    type="text"
                    placeholder="Enter cost"
                    className="w-full border-gray-600 border px-2 py-1 rounded-lg"
                  />
                  {errors.cost && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.cost.message}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className=" w-full rounded-lg bg-black border border-black text-white font-medium h-max py-1 px-3"
                >
                  {isSubmitting || loading ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Real Expenses List */}
        <div className="mt-8 w-full   bg-white  ">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Expenses
          </h2>
          {fetchingExpenses ? (
            <div className="text-center text-gray-500">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center text-gray-500">No expenses yet</div>
          ) : (
            <>
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
                      <div className="text-xs text-gray-500">
                        ID: {expense.id}
                      </div>
                    </div>
                    <div className="font-bold text-green-600">
                      R{expense.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-gray-800">
                    Total
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    R
                    {expenses
                      .reduce((sum, expense) => sum + expense.amount, 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
