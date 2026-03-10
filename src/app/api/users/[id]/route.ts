import { NextResponse } from "next/server";
import { readUserById, updateUser, deleteUser } from "@/lib/user-store";
import { logActivity } from "@/lib/activity-log-store";
import { getSessionUser } from "@/lib/session";
import {
  sendRoleChangedEmail,
  sendAccountDeactivatedEmail,
  sendAccountReactivatedEmail,
  sendPasswordChangedEmail,
} from "@/lib/mail";

// Owner account — cannot be deleted, deactivated, or demoted
const OWNER_EMAIL = "dossoumaxime888@gmail.com";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await readUserById(id);
  if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getSessionUser();
  const body = await request.json();

  const before = await readUserById(id);

  // Protect owner account
  if (before?.email === OWNER_EMAIL) {
    if (body.active === false) {
      return NextResponse.json({ error: "Ce compte ne peut pas être désactivé" }, { status: 403 });
    }
    if (body.role && body.role !== "super_admin") {
      return NextResponse.json({ error: "Ce compte doit rester Super Admin" }, { status: 403 });
    }
  }

  try {
    const user = await updateUser(id, body);

    if (me) {
      await logActivity({
        userId: me.id,
        userName: me.name,
        action: "update",
        target: "user",
        targetId: id,
        details: `Modifié l'utilisateur ${user.name}`,
      });
    }

    // Send emails based on what changed (non-blocking)
    if (before) {
      if (body.role && body.role !== before.role) {
        sendRoleChangedEmail({ to: user.email, name: user.name, oldRole: before.role, newRole: body.role }).catch(() => {});
      }
      if (body.active === false && before.active) {
        sendAccountDeactivatedEmail({ to: user.email, name: user.name }).catch(() => {});
      }
      if (body.active === true && !before.active) {
        sendAccountReactivatedEmail({ to: user.email, name: user.name }).catch(() => {});
      }
      if (body.password) {
        sendPasswordChangedEmail({ to: user.email, name: user.name }).catch(() => {});
      }
    }

    return NextResponse.json(user);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }
    if (msg.includes("Record to update not found")) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getSessionUser();
  const user = await readUserById(id);

  if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

  // Protect owner account
  if (user.email === OWNER_EMAIL) {
    return NextResponse.json({ error: "Ce compte ne peut pas être supprimé" }, { status: 403 });
  }

  // Prevent self-deletion
  if (me && me.id === id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
  }

  await deleteUser(id);

  if (me) {
    await logActivity({
      userId: me.id,
      userName: me.name,
      action: "delete",
      target: "user",
      targetId: id,
      details: `Supprimé l'utilisateur ${user.name}`,
    });
  }

  return NextResponse.json({ success: true });
}
