import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readExpenses, createExpense } from "@/lib/expense-store";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;

  const expenses = await readExpenses({ dateFrom, dateTo, category, status });
  return NextResponse.json(expenses);
});

export const POST = apiHandler(async (request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  // Extract and validate required fields
  const amount = parseInt(formData.get("amount") as string, 10);
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string;

  if (!amount || !category || !description || !date) {
    return NextResponse.json(
      { error: "amount, category, description et date sont requis" },
      { status: 400 }
    );
  }

  // Extract optional fields
  const supplier = formData.get("supplier") as string || "";
  const paymentMethod = formData.get("paymentMethod") as string || "";
  const isRecurring = formData.get("isRecurring") === "true";
  const recurringDay = formData.get("recurringDay")
    ? parseInt(formData.get("recurringDay") as string, 10)
    : undefined;

  // Upload receipt to Cloudinary if provided
  let receiptUrl = "";
  const receiptFile = formData.get("receiptFile") as File | null;

  if (receiptFile && receiptFile.size > 0) {
    try {
      const arrayBuffer = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "expenses",
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      receiptUrl = uploadResult.secure_url;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      // Continue without receipt URL
    }
  }

  // Create expense with status="pending" by default
  const expense = await createExpense({
    amount,
    category,
    supplier,
    description,
    paymentMethod,
    receiptUrl,
    date,
    status: "pending", // Always pending on creation
    isRecurring,
    recurringDay,
    createdBy: me.id,
  });

  logActivity({
    userId: me.id,
    userName: me.name,
    action: "create",
    target: "expense",
    targetId: expense.id,
    details: `Dépense ${amount} FCFA (${category})`,
  }).catch(() => {});

  return NextResponse.json(expense, { status: 201 });
});
