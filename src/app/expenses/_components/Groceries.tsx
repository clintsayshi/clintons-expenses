import { items as groceries } from "@/groceries";
import Image from "next/image";
import { useEffect } from "react";

export default function GroceryList({ expenseId }: { expenseId: string }) {
  //console.log("groceries: ", groceries);

  const getGroceryList = async () => {
    const response = await fetch("/api/groceries");

    if (!response.ok) {
      console.log("Failed to add grocery item...");

      return;
    }

    const json = await response.json();

    console.log("response: ", json);
  };

  useEffect(() => {
    getGroceryList();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddListItem = async (item: any) => {
    console.log(item);

    const response = await fetch("/api/groceries", {
      method: "POST",
      body: JSON.stringify({
        name: item.name,
        amount: item.prices.original,
        brand: item.brand,
        expenseId,
      }),
    });

    if (!response.ok) {
      console.log("Failed to add grocery item...");

      return;
    }

    const json = await response.json();

    console.log(json);
  };

  return (
    <div>
      <h2>Here for grocery planning...</h2>

      <div></div>

      <div></div>

      <div className="py-5 grid grid-cols-4 gap-5">
        {groceries.map((item) => (
          <div key={item.name} className="p-3 bg-gray-50">
            <Image
              width="300"
              height="300"
              src={item.images[0]}
              alt="grocery item"
            />

            <p className="pt-2 py-1 font-medium">{item.name}</p>

            <p>R {item.prices.original}</p>

            {item.prices.sale && (
              <div className="bg-red-700 w-max text-white px-2 py-1">
                {item.prices.sale?.quantity} x {item.prices.sale?.price}
              </div>
            )}

            <p className="pt-1 font-medium italic">{item.store}</p>

            <button
              className="py-2 px-4 bg-blue-400 text-white rounded cursor-pointer"
              onClick={() => handleAddListItem(item)}
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
