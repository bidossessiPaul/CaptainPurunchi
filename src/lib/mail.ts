import nodemailer from "nodemailer";
import { ROLES, type Role } from "@/lib/permissions";

// ── Transporter ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "Captain Purunchi <noreply@captainpurunchi.com>";
const APP_URL = process.env.NEXT_PUBLIC_URL || "https://captainpurunchi.com";
const ADMIN_URL = `${APP_URL}/admin`;

// ── Base layout ─────────────────────────────────────────
function layout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a3a5c 0%,#2a5a8c 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
      <img src="${APP_URL}/images%20captain/logo%20pour%20fond%20noir.png" alt="Captain Purunchi" style="height:50px;margin-bottom:8px;" />
      <div style="margin-top:4px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:2px;text-transform:uppercase;">
        Gestion interne
      </div>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:40px;border-left:1px solid #e9ecef;border-right:1px solid #e9ecef;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="background:#f8f9fa;border-radius:0 0 16px 16px;padding:24px 40px;border:1px solid #e9ecef;border-top:none;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;color:#8a92a6;">
        Cet email a été envoyé automatiquement par le système Captain Purunchi.
      </p>
      <p style="margin:0;font-size:12px;color:#b0b7c3;">
        &copy; ${new Date().getFullYear()} Captain Purunchi — Tous droits réservés
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ── Helpers ──────────────────────────────────────────────
function roleLabel(role: string): string {
  return ROLES[role as Role] || role;
}

function button(text: string, href: string): string {
  return `
    <div style="text-align:center;margin:32px 0 8px;">
      <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#5BC0EB,#3a9cc7);color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:600;font-size:15px;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(91,192,235,0.3);">
        ${text}
      </a>
    </div>`;
}

function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 16px;font-size:13px;color:#8a92a6;border-bottom:1px solid #f5f5f5;white-space:nowrap;">${label}</td>
      <td style="padding:10px 16px;font-size:14px;color:#1a3a5c;font-weight:600;border-bottom:1px solid #f5f5f5;">${value}</td>
    </tr>`;
}

function infoTable(rows: { label: string; value: string }[]): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f8f9fa;border-radius:10px;overflow:hidden;">
      ${rows.map((r) => infoRow(r.label, r.value)).join("")}
    </table>`;
}

// ── Customer layout ──────────────────────────────────────
function customerLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="background:linear-gradient(135deg,#1a3a5c 0%,#2a5a8c 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
      <img src="${APP_URL}/images%20captain/logo%20pour%20fond%20noir.png" alt="Captain Purunchi" style="height:50px;margin-bottom:8px;" />
      <div style="margin-top:4px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.6);letter-spacing:2px;text-transform:uppercase;">
        Restaurant &bull; Bar &bull; H&eacute;bergement
      </div>
    </div>
    <div style="background:#ffffff;padding:40px;border-left:1px solid #e9ecef;border-right:1px solid #e9ecef;">
      ${content}
    </div>
    <div style="background:#f8f9fa;border-radius:0 0 16px 16px;padding:24px 40px;border:1px solid #e9ecef;border-top:none;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;color:#8a92a6;">
        Merci de votre confiance. &Agrave; bient&ocirc;t chez Captain Purunchi !
      </p>
      <p style="margin:0;font-size:12px;color:#b0b7c3;">
        &copy; ${new Date().getFullYear()} Captain Purunchi &mdash; Tous droits r&eacute;serv&eacute;s
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ── Send helpers ────────────────────────────────────────
async function send(to: string, subject: string, html: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html: layout(html),
    });
  } catch (err) {
    console.error("[MAIL] Failed to send:", err);
  }
}

async function sendCustomer(
  to: string,
  subject: string,
  html: string,
  attachments?: { filename: string; content: Buffer; contentType: string }[]
): Promise<void> {
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html: customerLayout(html),
      attachments,
    });
  } catch (err) {
    console.error("[MAIL] Failed to send customer email:", err);
  }
}

// ══════════════════════════════════════════════════════════
// ── EMAIL TEMPLATES ──────────────────────────────────────
// ══════════════════════════════════════════════════════════

/**
 * Welcome email — sent when a new team member is created
 */
export async function sendWelcomeEmail(data: {
  to: string;
  name: string;
  role: string;
  password: string;
}): Promise<void> {
  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#5BC0EB,#3a9cc7);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;color:#fff;">&#128075;</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        Bienvenue dans l'équipe !
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.name}</strong>, votre compte a été créé sur la plateforme Captain Purunchi.
      </p>
    </div>

    ${infoTable([
      { label: "Nom", value: data.name },
      { label: "Email", value: data.to },
      { label: "Rôle", value: roleLabel(data.role) },
      { label: "Mot de passe", value: data.password },
    ])}

    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#856404;">
      <strong>&#9888;&#65039; Important :</strong> Nous vous recommandons de changer votre mot de passe après votre première connexion.
    </div>

    ${button("Accéder au tableau de bord", `${ADMIN_URL}/login`)}
  `;

  await send(data.to, "Bienvenue dans l'équipe Captain Purunchi", html);
}

/**
 * Role changed email
 */
export async function sendRoleChangedEmail(data: {
  to: string;
  name: string;
  oldRole: string;
  newRole: string;
}): Promise<void> {
  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#ffc107,#e0a800);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;color:#fff;">&#128260;</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        Changement de rôle
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.name}</strong>, votre rôle a été modifié.
      </p>
    </div>

    ${infoTable([
      { label: "Ancien rôle", value: roleLabel(data.oldRole) },
      { label: "Nouveau rôle", value: roleLabel(data.newRole) },
    ])}

    <p style="font-size:14px;color:#6c757d;line-height:1.6;text-align:center;">
      Vos permissions d'accès ont été mises à jour en conséquence. Si vous avez des questions, contactez votre responsable.
    </p>

    ${button("Voir mon espace", ADMIN_URL)}
  `;

  await send(data.to, "Votre rôle a été modifié — Captain Purunchi", html);
}

/**
 * Account deactivated email
 */
export async function sendAccountDeactivatedEmail(data: {
  to: string;
  name: string;
}): Promise<void> {
  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#dc3545,#c82333);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;color:#fff;">&#128683;</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        Compte désactivé
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.name}</strong>, votre compte a été temporairement désactivé.
      </p>
    </div>

    <p style="font-size:14px;color:#6c757d;line-height:1.6;text-align:center;">
      Vous ne pouvez plus accéder à la plateforme pour le moment. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre responsable.
    </p>
  `;

  await send(data.to, "Votre compte a été désactivé — Captain Purunchi", html);
}

/**
 * Account reactivated email
 */
export async function sendAccountReactivatedEmail(data: {
  to: string;
  name: string;
}): Promise<void> {
  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#28a745,#218838);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;color:#fff;">&#9989;</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        Compte réactivé
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.name}</strong>, votre compte a été réactivé avec succès !
      </p>
    </div>

    <p style="font-size:14px;color:#6c757d;line-height:1.6;text-align:center;">
      Vous pouvez à nouveau accéder à la plateforme. Connectez-vous avec vos identifiants habituels.
    </p>

    ${button("Se reconnecter", `${ADMIN_URL}/login`)}
  `;

  await send(data.to, "Votre compte a été réactivé — Captain Purunchi", html);
}

/**
 * Password changed notification
 */
export async function sendPasswordChangedEmail(data: {
  to: string;
  name: string;
}): Promise<void> {
  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#6f42c1,#5a32a3);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;color:#fff;">&#128272;</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        Mot de passe modifié
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.name}</strong>, votre mot de passe a été modifié avec succès.
      </p>
    </div>

    <div style="background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#721c24;">
      <strong>&#9888;&#65039; Pas vous ?</strong> Si vous n'avez pas demandé ce changement, contactez immédiatement votre responsable.
    </div>

    ${button("Accéder au tableau de bord", ADMIN_URL)}
  `;

  await send(data.to, "Votre mot de passe a été modifié — Captain Purunchi", html);
}

/**
 * New reservation notification — sent to team members
 */
export async function sendNewReservationNotification(data: {
  to: string;
  memberName: string;
  type: "table" | "room" | "event";
  customerName: string;
  details: string;
  date: string;
}): Promise<void> {
  const typeLabels = {
    table: { label: "Réservation de table", icon: "&#127869;", color: "#5BC0EB" },
    room: { label: "Réservation de chambre", icon: "&#128716;", color: "#ffc107" },
    event: { label: "Réservation événement", icon: "&#127881;", color: "#dc3545" },
  };

  const t = typeLabels[data.type];

  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,${t.color},${t.color}cc);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">${t.icon}</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        ${t.label}
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.memberName}</strong>, une nouvelle réservation vient d'arriver.
      </p>
    </div>

    ${infoTable([
      { label: "Client", value: data.customerName },
      { label: "Type", value: t.label },
      { label: "Date", value: data.date },
      { label: "Détails", value: data.details },
    ])}

    ${button("Voir les réservations", `${ADMIN_URL}/reservations`)}
  `;

  await send(data.to, `Nouvelle ${t.label.toLowerCase()} — Captain Purunchi`, html);
}

/**
 * New order notification
 */
export async function sendNewOrderNotification(data: {
  to: string;
  memberName: string;
  customerName: string;
  itemCount: number;
  totalAmount: string;
}): Promise<void> {
  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#28a745,#218838);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">&#128717;</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        Nouvelle commande
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.memberName}</strong>, une nouvelle commande a été passée.
      </p>
    </div>

    ${infoTable([
      { label: "Client", value: data.customerName },
      { label: "Articles", value: `${data.itemCount} article(s)` },
      { label: "Total", value: `${data.totalAmount} FCFA` },
    ])}

    ${button("Voir les commandes", `${ADMIN_URL}/orders`)}
  `;

  await send(data.to, "Nouvelle commande — Captain Purunchi", html);
}

// ══════════════════════════════════════════════════════════
// ── CUSTOMER EMAIL TEMPLATES ─────────────────────────────
// ══════════════════════════════════════════════════════════

/**
 * Customer reservation confirmation — sent on creation
 */
export async function sendCustomerReservationConfirmation(data: {
  to: string;
  customerName: string;
  type: "table" | "room" | "event";
  details: { label: string; value: string }[];
}): Promise<void> {
  const typeLabels = {
    table: { label: "R\u00e9servation de table", icon: "&#127869;", color: "#5BC0EB" },
    room: { label: "R\u00e9servation de chambre", icon: "&#128716;", color: "#ffc107" },
    event: { label: "Inscription \u00e9v\u00e9nement", icon: "&#127881;", color: "#dc3545" },
  };
  const t = typeLabels[data.type];

  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,${t.color},${t.color}cc);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">${t.icon}</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        ${t.label} enregistr\u00e9e
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.customerName}</strong>, nous avons bien re\u00e7u votre demande.
      </p>
    </div>

    ${infoTable(data.details)}

    <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#155724;text-align:center;">
      Nous vous contacterons sous peu pour confirmer votre r\u00e9servation.
    </div>

    ${button("Visiter notre site", APP_URL)}
  `;

  await sendCustomer(data.to, `${t.label} enregistr\u00e9e \u2014 Captain Purunchi`, html);
}

/**
 * Customer status notification — sent when admin confirms or cancels
 */
export async function sendCustomerStatusNotification(data: {
  to: string;
  customerName: string;
  type: "table" | "room" | "event";
  status: "confirmed" | "cancelled";
  details: { label: string; value: string }[];
}): Promise<void> {
  const typeLabels = {
    table: "r\u00e9servation de table",
    room: "r\u00e9servation de chambre",
    event: "inscription \u00e9v\u00e9nement",
  };

  const isConfirmed = data.status === "confirmed";
  const statusConfig = isConfirmed
    ? { icon: "&#9989;", color: "#28a745", title: "R\u00e9servation confirm\u00e9e", msg: "Votre " + typeLabels[data.type] + " a \u00e9t\u00e9 confirm\u00e9e. Nous vous attendons avec plaisir !" }
    : { icon: "&#10060;", color: "#dc3545", title: "R\u00e9servation annul\u00e9e", msg: "Votre " + typeLabels[data.type] + " a \u00e9t\u00e9 annul\u00e9e. N'h\u00e9sitez pas \u00e0 nous contacter pour plus d'informations." };

  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,${statusConfig.color},${statusConfig.color}cc);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;color:#fff;">${statusConfig.icon}</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        ${statusConfig.title}
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.customerName}</strong>, ${statusConfig.msg}
      </p>
    </div>

    ${infoTable(data.details)}

    ${isConfirmed ? button("Visiter notre site", APP_URL) : ""}
  `;

  const subject = isConfirmed
    ? "R\u00e9servation confirm\u00e9e \u2014 Captain Purunchi"
    : "R\u00e9servation annul\u00e9e \u2014 Captain Purunchi";

  await sendCustomer(data.to, subject, html);
}

/**
 * Customer order confirmation — sent on creation
 */
export async function sendCustomerOrderConfirmation(data: {
  to: string;
  customerName: string;
  items: { name: string; qty: number; price: string }[];
  totalAmount: string;
}): Promise<void> {
  const itemsHtml = data.items
    .map((i) => `<tr>
      <td style="padding:8px 16px;font-size:13px;color:#1a3a5c;border-bottom:1px solid #f5f5f5;">${i.qty}x ${i.name}</td>
      <td style="padding:8px 16px;font-size:13px;color:#8a92a6;border-bottom:1px solid #f5f5f5;text-align:right;">${i.price}</td>
    </tr>`)
    .join("");

  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#28a745,#218838);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">&#128717;</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        Commande enregistr\u00e9e
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.customerName}</strong>, nous avons bien re\u00e7u votre commande.
      </p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f8f9fa;border-radius:10px;overflow:hidden;">
      ${itemsHtml}
      <tr>
        <td style="padding:12px 16px;font-size:14px;color:#1a3a5c;font-weight:700;border-top:2px solid #e9ecef;">Total</td>
        <td style="padding:12px 16px;font-size:14px;color:#5BC0EB;font-weight:700;border-top:2px solid #e9ecef;text-align:right;">${data.totalAmount}</td>
      </tr>
    </table>

    <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#155724;text-align:center;">
      Nous vous contacterons sous peu pour confirmer votre commande.
    </div>

    ${button("Visiter notre site", APP_URL)}
  `;

  await sendCustomer(data.to, "Commande enregistr\u00e9e \u2014 Captain Purunchi", html);
}

/**
 * Customer order status notification — sent when admin confirms or cancels
 */
export async function sendCustomerOrderStatusNotification(data: {
  to: string;
  customerName: string;
  status: "confirmed" | "cancelled";
  totalAmount: string;
}): Promise<void> {
  const isConfirmed = data.status === "confirmed";
  const statusConfig = isConfirmed
    ? { icon: "&#9989;", color: "#28a745", title: "Commande confirm\u00e9e", msg: "Votre commande de " + data.totalAmount + " a \u00e9t\u00e9 confirm\u00e9e. Nous pr\u00e9parons votre commande !" }
    : { icon: "&#10060;", color: "#dc3545", title: "Commande annul\u00e9e", msg: "Votre commande de " + data.totalAmount + " a \u00e9t\u00e9 annul\u00e9e. N'h\u00e9sitez pas \u00e0 nous contacter." };

  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,${statusConfig.color},${statusConfig.color}cc);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;color:#fff;">${statusConfig.icon}</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        ${statusConfig.title}
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.customerName}</strong>, ${statusConfig.msg}
      </p>
    </div>

    ${isConfirmed ? button("Visiter notre site", APP_URL) : ""}
  `;

  const subject = isConfirmed
    ? "Commande confirm\u00e9e \u2014 Captain Purunchi"
    : "Commande annul\u00e9e \u2014 Captain Purunchi";

  await sendCustomer(data.to, subject, html);
}

/**
 * Invoice email — sent when invoice status changes to "sent"
 */
export async function sendInvoiceEmail(data: {
  to: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { description: string; qty: number; unitPrice: number; total: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  dueDate: string;
  createdAt: string;
  notes: string;
  company: { phone: string; email: string; address: string };
}): Promise<void> {
  const fmt = (n: number) => n.toLocaleString("fr-FR");

  // Generate PDF attachment
  const { generateInvoicePDFBuffer } = await import("@/lib/generate-invoice-pdf-server");
  const pdfBuffer = generateInvoicePDFBuffer(
    {
      invoiceNumber: data.invoiceNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      status: data.status,
      dueDate: data.dueDate,
      createdAt: data.createdAt,
      notes: data.notes,
    },
    data.company
  );

  const itemsHtml = data.items
    .map((i) => `<tr>
      <td style="padding:8px 16px;font-size:13px;color:#1a3a5c;border-bottom:1px solid #f5f5f5;">${i.description}</td>
      <td style="padding:8px 16px;font-size:13px;color:#8a92a6;border-bottom:1px solid #f5f5f5;text-align:center;">${i.qty}</td>
      <td style="padding:8px 16px;font-size:13px;color:#8a92a6;border-bottom:1px solid #f5f5f5;text-align:right;">${fmt(i.unitPrice)}</td>
      <td style="padding:8px 16px;font-size:13px;color:#1a3a5c;font-weight:600;border-bottom:1px solid #f5f5f5;text-align:right;">${fmt(i.total)}</td>
    </tr>`)
    .join("");

  const html = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#6F6AF8,#5a55d4);margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;color:#fff;">&#128196;</span>
      </div>
      <h2 style="margin:0 0 8px;font-size:22px;color:#1a3a5c;font-weight:700;">
        Facture ${data.invoiceNumber}
      </h2>
      <p style="margin:0;font-size:15px;color:#6c757d;line-height:1.6;">
        Bonjour <strong>${data.customerName}</strong>, veuillez trouver ci-jointe votre facture.
      </p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f8f9fa;border-radius:10px;overflow:hidden;">
      <thead>
        <tr style="background:#e9ecef;">
          <th style="padding:10px 16px;font-size:12px;color:#8a92a6;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Description</th>
          <th style="padding:10px 16px;font-size:12px;color:#8a92a6;text-align:center;text-transform:uppercase;letter-spacing:0.5px;">Qté</th>
          <th style="padding:10px 16px;font-size:12px;color:#8a92a6;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Prix unit.</th>
          <th style="padding:10px 16px;font-size:12px;color:#8a92a6;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:8px 16px;font-size:13px;color:#8a92a6;text-align:right;border-top:2px solid #e9ecef;">Sous-total</td>
          <td style="padding:8px 16px;font-size:14px;color:#1a3a5c;font-weight:600;text-align:right;border-top:2px solid #e9ecef;">${fmt(data.subtotal)} FCFA</td>
        </tr>
        ${data.tax > 0 ? `<tr>
          <td colspan="3" style="padding:8px 16px;font-size:13px;color:#8a92a6;text-align:right;">Taxe</td>
          <td style="padding:8px 16px;font-size:14px;color:#1a3a5c;font-weight:600;text-align:right;">${fmt(data.tax)} FCFA</td>
        </tr>` : ""}
        <tr>
          <td colspan="3" style="padding:12px 16px;font-size:15px;color:#1a3a5c;font-weight:700;text-align:right;border-top:2px solid #1a3a5c;">Total</td>
          <td style="padding:12px 16px;font-size:15px;color:#5BC0EB;font-weight:700;text-align:right;border-top:2px solid #1a3a5c;">${fmt(data.total)} FCFA</td>
        </tr>
      </tfoot>
    </table>

    ${data.dueDate ? `<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#856404;text-align:center;">
      <strong>Date d'échéance :</strong> ${data.dueDate}
    </div>` : ""}

    <p style="font-size:13px;color:#8a92a6;text-align:center;margin-top:24px;">
      Vous trouverez la facture au format PDF en pièce jointe.<br/>
      Pour toute question, n'hésitez pas à nous contacter.
    </p>

    ${button("Visiter notre site", APP_URL)}
  `;

  await sendCustomer(
    data.to,
    `Facture ${data.invoiceNumber} — Captain Purunchi`,
    html,
    [{
      filename: `Facture_${data.invoiceNumber}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    }]
  );
}
