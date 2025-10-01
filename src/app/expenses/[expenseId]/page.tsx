"use client";
import { useParams } from "next/navigation";
import ExpenseDetails from "../_components/ExpenseDetails";

export default function ExpenseDetailPage() {
  const params = useParams();
  const expenseId = params.expenseId as string | undefined;

  return (
    <div>
      {expenseId ? (
        <ExpenseDetails expenseId={expenseId} />
      ) : (
        <p>Select an expense</p>
      )}
    </div>
  );
}
