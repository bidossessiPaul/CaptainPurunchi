import { NextResponse } from "next/server";
import { readAllUsers, createUser } from "@/lib/user-store";
import { logActivity } from "@/lib/activity-log-store";
import { getSessionUser } from "@/lib/session";
import { sendWelcomeEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

const OWNER_EMAIL = "dossoumaxime888@gmail.com";

export async function GET() {
  const me = await getSessionUser();
  const users = await readAllUsers();

  // Hide owner account from everyone except the owner himself
  const isOwner = me && me.email === OWNER_EMAIL;
  const filtered = isOwner ? users : users.filter((u) => u.email !== OWNER_EMAIL);

  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  const me = await getSessionUser();
  const body = await request.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  try {
    const user = await createUser({ name, email, password, role });

    if (me) {
      await logActivity({
        userId: me.id,
        userName: me.name,
        action: "create",
        target: "user",
        targetId: user.id,
        details: `Créé l'utilisateur ${user.name} (${user.role})`,
      });
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail({ to: email, name, role, password }).catch(() => {});

    return NextResponse.json(user, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }
    const errMsg = e instanceof Error ? e.message : "Erreur interne";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
