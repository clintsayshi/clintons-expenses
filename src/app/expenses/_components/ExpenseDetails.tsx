import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { createClient } from "@/lib/supabase/client";
import GroceryList from "./Groceries";

type ExpenseItem = {
  id: string;
  name: string;
  amount: string;
};

type Expense = {
  id: string;
  name: string;
  amount: string;
  category?: string;
  currency?: string;
  description?: string;
  notes?: string;
  paymentMethod?: string;
  userId: string;
  items: ExpenseItem[];

  createdAt: string;
};

const expenseItemSchema = z.object({
  name: z.string(),
  amount: z.string().optional(),
});

type ExpenseItemForm = z.Infer<typeof expenseItemSchema>;

export default function ExpenseDetails({ expenseId }: { expenseId: string }) {
  const [details, setDetails] = useState<Expense | null>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ExpenseItemForm>({
    resolver: zodResolver(expenseItemSchema),
    defaultValues: {
      name: "",
    },
  });

  async function fetchExpenseDetails() {
    try {
      setLoading(true);
      // Get the current user's JWT token
      const { data } = await supabase.auth.getSession();
      const jwtToken = data?.session?.access_token;

      if (!jwtToken) {
        throw new Error("Missing JWT token");
      }

      const response = await fetch(`/api/expenses/${expenseId}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        const json = await response.json();
        console.log("Error:", json);
        throw new Error("Error:", json);

        router.push("/expenses");
      }

      const json = await response.json();

      setDetails(json.expenses[0]);
    } catch (error) {
      console.log("An error occured: ", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExpenseDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseId]);

  async function handleAddExpenseItem(data: ExpenseItemForm) {
    // Get the current user's JWT token
    const { data: authData } = await supabase.auth.getSession();
    const jwtToken = authData?.session?.access_token;

    if (!jwtToken) {
      throw new Error("Missing JWT token");
    }

    const response = await fetch(`/api/expenses/${expenseId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        ...data,
      }),
    });

    if (!response.ok) {
      console.log("Error adding new expense item");
      return;
    }

    reset();

    fetchExpenseDetails();
  }

  async function handleDeleteExpense(id: string) {
    const { data: authData } = await supabase.auth.getSession();
    const jwtToken = authData?.session?.access_token;

    if (!jwtToken) {
      throw new Error("Missing JWT token");
    }

    const response = await fetch(`/api/expenses/${expenseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) {
      console.log("Error delete expense with ID: ", id);
      return;
    }

    const json = await response.json();
    console.log(json);

    router.push("/expenses");
  }

  return (
    <div>
      <header className="flex gap-5 py-5 items-center justify-between">
        <Link href="/expenses" className="sm:hidden">
          Back
        </Link>

        {loading ? (
          <div className="block p-2 w-1/2 rounded bg-gray-300 animate-pulse"></div>
        ) : details ? (
          <h1 className="text-xl font-semibold ">
            <span className="capitalize">{details.name}</span> items
          </h1>
        ) : (
          <p>error</p>
        )}

        <button onClick={() => handleDeleteExpense(expenseId)}>Delete</button>
      </header>

      <form
        className="mb-5 space-y-2"
        onSubmit={handleSubmit(handleAddExpenseItem)}
      >
        <div>
          <input
            {...register("name")}
            name="name"
            placeholder="+ Enter expense item name"
            required
            className="px-2 py-1 w-full border rounded"
          />
          {errors.name && <p>errors.name.message</p>}
        </div>
        <div>
          <input
            {...register("amount", {
              required: "Amount is required",
              min: { value: 0.1, message: "Amount must be greater than 0" },
              max: {
                value: 1000000,
                message: "Amount must be less than 1 million",
              },
            })}
            type="number"
            name="amount"
            placeholder="+ Enter expense item cost"
            required
            className="px-2 py-1 w-full border rounded"
          />
          {errors.amount && <p>errors.amount.message</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-1 rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding item..." : "Add"}
        </button>
      </form>

      <GroceryList expenseId={expenseId} />

      <ul className="mt-4 space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <li key={idx}>
              <div className="block p-2 rounded bg-gray-100 animate-pulse">
                <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
              </div>
            </li>
          ))
        ) : details && details.items ? (
          <ul className="space-y-2">
            {details.items.map((item) => (
              <li
                key={item.id}
                className="block p-2 border rounded hover:bg-gray-100"
              >
                {item.name} - R {item.amount}
              </li>
            ))}
          </ul>
        ) : (
          <li className="text-gray-500">No expense items found.</li>
        )}
      </ul>
    </div>
  );
}
