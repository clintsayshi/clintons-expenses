import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

import {
  addExpenseItem,
  deleteExpense,
  getExpenseById,
} from "@/handlers/expenses/expenses.handlers";

export async function GET(request: NextRequest) {
  // Extract expenseId from the URL
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const expenseId = parts[parts.length - 1];

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
    const supabase = createClient();
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

    const result = await getExpenseById(expenseId);

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

export async function POST(request: NextRequest) {
  // Extract expenseId from the URL
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const expenseId = parts[parts.length - 1];

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
    const supabase = createClient();
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
    const { name, amount = 100.0 } = await request.json();

    if (!name || !amount) {
      return NextResponse.json(
        { error: "Name and amount are required" },
        { status: 400 }
      );
    }

    // Insert the expenses into the database
    await addExpenseItem(expenseId, name, amount);

    return NextResponse.json(
      {
        message: "Expense item created successfully",
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

export async function DELETE(request: NextRequest) {
  // Extract expenseId from the URL
  const url = new URL(request.url);
  const parts = url.pathname.split("/");
  const expenseId = parts[parts.length - 1];

  try {
    // Parse the request body

    if (!expenseId) {
      return NextResponse.json(
        { error: "Expense ID is required" },
        { status: 400 }
      );
    }

    // Insert the expenses into the database
    await deleteExpense(expenseId);

    return NextResponse.json(
      {
        message: "Expense item deleted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
