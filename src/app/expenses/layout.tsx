"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ExpensesList from "./_components/ExpenseList";
import ExpenseDetails from "./_components/ExpenseDetails";
import { createClient } from "@/lib/supabase/client";

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //const pathname = usePathname();
  const params = useParams();
  const [isDesktop, setIsDesktop] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
      console.log("Error fetching user: ", error);

      router.push("/auth/login");
    }
  }

  useEffect(() => {
    setLoading(true);
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    handler();
    window.addEventListener("resize", handler);

    handleSignOut().finally(() => {
      setLoading(false);
    });
    return () => window.removeEventListener("resize", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>MoneyRight</p>
      </div>
    );
  }

  if (isDesktop) {
    //const expenseId = pathname.split("/")[2]; // /expenses/[expenseId]
    // If you want to get the id from the route using Next.js modules, you can use the `useParams` hook from "next/navigation".
    // However, since this is a layout and you are already using usePathname, you can also use useParams for more robust param extraction:
    // import { useParams } from "next/navigation";

    const expenseId = params.expenseId as string | undefined;

    return (
      <div className="grid grid-cols-3 h-screen px-5 sm:px-0">
        <div className="col-span-1 border-r p-4">
          <ExpensesList />
        </div>
        <div className="col-span-2 p-4">
          {expenseId ? (
            <ExpenseDetails expenseId={expenseId} />
          ) : (
            <p>Select an expense</p>
          )}
        </div>
      </div>
    );
  }

  // On mobile, just render normal route pages
  return <div className="px-5 sm:px-0">{children}</div>;
}
