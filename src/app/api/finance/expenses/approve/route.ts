import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getSessionUser } from "@/lib/session";
import { logActivity } from "@/lib/activity-log-store";
import { readExpenseById, approveExpense } from "@/lib/expense-store";
import { canAction } from "@/lib/permissions";

/**
 * POST /api/finance/expenses/approve
 * Body: { expenseId: string, approved: boolean, rejectionReason?: string }
 *
 * Manager approval workflow for expenses
 */
export const POST = apiHandler(async (request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user has approve permission for finance
  if (!canAction(me.role, "finance", "approve")) {
    return NextResponse.json(
      { error: "Forbidden - You don't have permission to approve expenses" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { expenseId, approved, rejectionReason } = body;

  if (!expenseId || approved === undefined) {
    return NextResponse.json(
      { error: "expenseId and approved fields are required" },
      { status: 400 }
    );
  }

  // Check if expense exists
  const existing = await readExpenseById(expenseId);
  if (!existing) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  // Check if expense is in pending status
  if (existing.status !== "pending") {
    return NextResponse.json(
      { error: `Cannot approve/reject expense with status: ${existing.status}` },
      { status: 400 }
    );
  }

  // Approve or reject the expense
  const updated = await approveExpense(expenseId, me.id, approved);

  // Log activity
  const action = approved ? "approved" : "rejected";
  const details = approved
    ? `Dépense approuvée: ${updated.amount} FCFA (${updated.category})`
    : `Dépense rejetée: ${updated.amount} FCFA (${updated.category})${
        rejectionReason ? ` - Raison: ${rejectionReason}` : ""
      }`;

  logActivity({
    userId: me.id,
    userName: me.name,
    action: "update",
    target: "expense",
    targetId: expenseId,
    details,
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    expense: updated,
    message: `Expense ${action} successfully`,
  });
});
