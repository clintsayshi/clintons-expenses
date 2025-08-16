import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabaseClient";
import {
  createExpense,
  getExpensesByUserId,
} from "@/handlers/expenses/expenses.handlers";

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Extract the JWT token
    const jwtToken = authHeader.substring(7);

    // Verify the JWT token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwtToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Fetch expenses for the user
    /* const result = await db.execute({
      sql: "SELECT id, name, cost, user_id FROM expense WHERE user_id = ? ORDER BY id DESC",
      args: [user.id],
    }); */
    const result = await getExpensesByUserId(user.id);

    return NextResponse.json({
      expenses: result,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Extract the JWT token
    const jwtToken = authHeader.substring(7);

    // Verify the JWT token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwtToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse the request body
    const { name, cost } = await request.json();

    if (!name || !cost) {
      return NextResponse.json(
        { error: "Name and cost are required" },
        { status: 400 }
      );
    }

    console.log("we get here: ", name, cost, user);

    // Insert the expense into the database
    const result = await db.execute({
      sql: "INSERT INTO expense (name, cost, user_id) VALUES (?, ?, ?)",
      args: [name, cost, user.id],
    });

    console.log("the result", result);

    return NextResponse.json(
      {
        message: "Expense created successfully",
        id:
          typeof result.lastInsertRowid === "bigint"
            ? result.lastInsertRowid.toString()
            : result.lastInsertRowid,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} */

///

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    // Extract the JWT token
    const jwtToken = authHeader.substring(7);

    // Verify the JWT token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwtToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse the request body
    const { name, amount } = await request.json();

    if (!name || !amount) {
      return NextResponse.json(
        { error: "Name and amount are required" },
        { status: 400 }
      );
    }

    console.log("we get here: ", name, amount, user);

    // Insert the expenses into the database
    const result = await createExpense({ name, amount, userId: user.id });

    console.log("the results", result);

    return NextResponse.json(
      {
        message: "Expense created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
