import nodemailer from "nodemailer";
import { ROLES, type Role } from "@/lib/permissions";

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

// ── Base layout (interne équipe) ─────────────────────────
function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Captain Purunchi</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:#0d1f35;padding:28px 40px;text-align:center;border-bottom:3px solid #c8a96e;">
      <img src="${APP_URL}/images%20captain/logo%20pour%20fond%20noir.png" alt="Captain Purunchi" style="height:44px;" />
      <p style="margin:10px 0 0;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.45);text-transform:uppercase;font-family:'Helvetica Neue',Arial,sans-serif;">Notification interne</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid #dde1e8;border-right:1px solid #dde1e8;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;text-align:center;border:1px solid #dde1e8;border-top:none;background:#f8f8f8;">
      <p style="margin:0;font-size:11px;color:#aab0be;font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.6;">
        Cet email a été envoyé automatiquement par le système Captain Purunchi.<br>
        &copy; ${new Date().getFullYear()} Captain Purunchi &mdash; Tous droits réservés
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ── Customer layout (clients) ────────────────────────────
function customerLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Captain Purunchi</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:#0d1f35;padding:28px 40px;text-align:center;border-bottom:3px solid #c8a96e;">
      <img src="${APP_URL}/images%20captain/logo%20pour%20fond%20noir.png" alt="Captain Purunchi" style="height:44px;" />
      <p style="margin:10px 0 0;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.45);text-transform:uppercase;font-family:'Helvetica Neue',Arial,sans-serif;">Restaurant &bull; Bar &bull; Hébergement</p>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:40px 40px 32px;border-left:1px solid #dde1e8;border-right:1px solid #dde1e8;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;text-align:center;border:1px solid #dde1e8;border-top:none;background:#f8f8f8;">
      <p style="margin:0 0 4px;font-size:12px;color:#7a8099;font-family:'Helvetica Neue',Arial,sans-serif;">Merci de votre confiance. À bientôt chez Captain Purunchi !</p>
      <p style="margin:0;font-size:11px;color:#aab0be;font-family:'Helvetica Neue',Arial,sans-serif;">
        &copy; ${new Date().getFullYear()} Captain Purunchi &mdash; Tous droits réservés
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

function heading(title: string, subtitle: string): string {
  return `
    <h2 style="margin:0 0 6px;font-size:24px;color:#0d1f35;font-family:Georgia,'Times New Roman',serif;font-weight:normal;">${title}</h2>
    <p style="margin:0 0 28px;font-size:14px;color:#7a8099;line-height:1.6;font-family:'Helvetica Neue',Arial,sans-serif;">${subtitle}</p>
    <hr style="border:none;border-top:1px solid #eef0f4;margin:0 0 28px;">`;
}

function badge(text: string, color: string): string {
  return `<div style="display:inline-block;background:${color}18;border:1px solid ${color}40;color:${color};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:4px 12px;border-radius:3px;margin-bottom:20px;font-family:'Helvetica Neue',Arial,sans-serif;">${text}</div>`;
}

function button(text: string, href: string): string {
  return `
    <div style="text-align:center;margin:32px 0 0;">
      <a href="${href}" style="display:inline-block;background:#c8a96e;color:#0d1f35;text-decoration:none;padding:13px 36px;font-weight:700;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;font-family:'Helvetica Neue',Arial,sans-serif;">
        ${text}
      </a>
    </div>`;
}

function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:11px 16px;font-size:12px;color:#9aa0b4;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #f2f4f7;white-space:nowrap;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:600;">${label}</td>
      <td style="padding:11px 16px;font-size:14px;color:#0d1f35;border-bottom:1px solid #f2f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">${value}</td>
    </tr>`;
}

function infoTable(rows: { label: string; value: string }[]): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;border:1px solid #eef0f4;">
      ${rows.map((r) => infoRow(r.label, r.value)).join("")}
    </table>`;
}

function alertBox(text: string, type: "info" | "warning" | "success" | "danger"): string {
  const colors = {
    info:    { bg: "#f0f6ff", border: "#c5d8f5", text: "#2c5282" },
    warning: { bg: "#fffbf0", border: "#f0d090", text: "#7a5c00" },
    success: { bg: "#f0faf4", border: "#b2d9c0", text: "#1a5c35" },
    danger:  { bg: "#fff0f0", border: "#f0b8b8", text: "#7a1c1c" },
  };
  const c = colors[type];
  return `<div style="background:${c.bg};border-left:3px solid ${c.border};padding:12px 16px;margin:20px 0;font-size:13px;color:${c.text};font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.6;">${text}</div>`;
}

// ── Send helpers ────────────────────────────────────────
async function send(to: string, subject: string, html: string): Promise<void> {
  try {
    await transporter.sendMail({ from: FROM, to, subject, html: layout(html) });
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
    await transporter.sendMail({ from: FROM, to, subject, html: customerLayout(html), attachments });
  } catch (err) {
    console.error("[MAIL] Failed to send customer email:", err);
  }
}

// ══════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ══════════════════════════════════════════════════════════

export async function sendWelcomeEmail(data: {
  to: string;
  name: string;
  role: string;
  password: string;
}): Promise<void> {
  const html = `
    ${heading("Bienvenue dans l'équipe", `Bonjour <strong>${data.name}</strong>, votre compte a été créé sur la plateforme Captain Purunchi.`)}
    ${infoTable([
      { label: "Nom", value: data.name },
      { label: "Email", value: data.to },
      { label: "Rôle", value: roleLabel(data.role) },
      { label: "Mot de passe temporaire", value: `<code style="background:#f4f6f9;padding:2px 6px;border-radius:3px;font-size:13px;">${data.password}</code>` },
    ])}
    ${alertBox("Veuillez changer votre mot de passe lors de votre première connexion.", "warning")}
    ${button("Accéder au tableau de bord", `${ADMIN_URL}/login`)}
  `;
  await send(data.to, "Bienvenue dans l'équipe — Captain Purunchi", html);
}

export async function sendRoleChangedEmail(data: {
  to: string;
  name: string;
  oldRole: string;
  newRole: string;
}): Promise<void> {
  const html = `
    ${heading("Changement de rôle", `Bonjour <strong>${data.name}</strong>, votre rôle sur la plateforme a été modifié.`)}
    ${infoTable([
      { label: "Ancien rôle", value: roleLabel(data.oldRole) },
      { label: "Nouveau rôle", value: roleLabel(data.newRole) },
    ])}
    <p style="font-size:14px;color:#7a8099;line-height:1.7;margin:0;font-family:'Helvetica Neue',Arial,sans-serif;">
      Vos permissions ont été mises à jour. Pour toute question, contactez votre responsable.
    </p>
    ${button("Voir mon espace", ADMIN_URL)}
  `;
  await send(data.to, "Votre rôle a été modifié — Captain Purunchi", html);
}

export async function sendAccountDeactivatedEmail(data: {
  to: string;
  name: string;
}): Promise<void> {
  const html = `
    ${heading("Compte désactivé", `Bonjour <strong>${data.name}</strong>, votre accès à la plateforme a été temporairement suspendu.`)}
    <p style="font-size:14px;color:#7a8099;line-height:1.7;margin:0;font-family:'Helvetica Neue',Arial,sans-serif;">
      Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre responsable directement.
    </p>
  `;
  await send(data.to, "Compte désactivé — Captain Purunchi", html);
}

export async function sendAccountReactivatedEmail(data: {
  to: string;
  name: string;
}): Promise<void> {
  const html = `
    ${heading("Compte réactivé", `Bonjour <strong>${data.name}</strong>, votre compte a été réactivé avec succès.`)}
    <p style="font-size:14px;color:#7a8099;line-height:1.7;margin:0;font-family:'Helvetica Neue',Arial,sans-serif;">
      Vous pouvez de nouveau accéder à la plateforme avec vos identifiants habituels.
    </p>
    ${button("Se reconnecter", `${ADMIN_URL}/login`)}
  `;
  await send(data.to, "Compte réactivé — Captain Purunchi", html);
}

export async function sendPasswordChangedEmail(data: {
  to: string;
  name: string;
}): Promise<void> {
  const html = `
    ${heading("Mot de passe modifié", `Bonjour <strong>${data.name}</strong>, votre mot de passe a été modifié avec succès.`)}
    ${alertBox("Si vous n'êtes pas à l'origine de ce changement, contactez immédiatement votre responsable.", "danger")}
    ${button("Accéder au tableau de bord", ADMIN_URL)}
  `;
  await send(data.to, "Mot de passe modifié — Captain Purunchi", html);
}

export async function sendNewReservationNotification(data: {
  to: string;
  memberName: string;
  type: "table" | "room" | "event";
  customerName: string;
  details: string;
  date: string;
}): Promise<void> {
  const typeConfig = {
    table: { label: "Réservation de table",   badgeColor: "#5BC0EB" },
    room:  { label: "Réservation de chambre", badgeColor: "#c8a96e" },
    event: { label: "Réservation événement",  badgeColor: "#0d1f35" },
  };
  const t = typeConfig[data.type];

  const html = `
    ${badge(t.label, t.badgeColor)}
    ${heading("Nouvelle réservation", `Bonjour <strong>${data.memberName}</strong>, une nouvelle réservation vient d'arriver.`)}
    ${infoTable([
      { label: "Client",  value: data.customerName },
      { label: "Type",    value: t.label },
      { label: "Date",    value: data.date },
      { label: "Détails", value: data.details },
    ])}
    ${button("Voir les réservations", `${ADMIN_URL}/reservations`)}
  `;

  await send(data.to, `Nouvelle ${t.label.toLowerCase()} — Captain Purunchi`, html);
}

export async function sendNewOrderNotification(data: {
  to: string;
  memberName: string;
  customerName: string;
  itemCount: number;
  totalAmount: string;
}): Promise<void> {
  const html = `
    ${badge("Nouvelle commande", "#28a745")}
    ${heading("Nouvelle commande", `Bonjour <strong>${data.memberName}</strong>, une nouvelle commande a été passée.`)}
    ${infoTable([
      { label: "Client",   value: data.customerName },
      { label: "Articles", value: `${data.itemCount} article(s)` },
      { label: "Total",    value: `${data.totalAmount} FCFA` },
    ])}
    ${button("Voir les commandes", `${ADMIN_URL}/orders`)}
  `;
  await send(data.to, "Nouvelle commande — Captain Purunchi", html);
}

// ── Customer templates ───────────────────────────────────

export async function sendCustomerReservationConfirmation(data: {
  to: string;
  customerName: string;
  type: "table" | "room" | "event";
  details: { label: string; value: string }[];
}): Promise<void> {
  const typeConfig = {
    table: { label: "Réservation de table",   badgeColor: "#5BC0EB" },
    room:  { label: "Réservation de chambre", badgeColor: "#c8a96e" },
    event: { label: "Inscription événement",  badgeColor: "#0d1f35" },
  };
  const t = typeConfig[data.type];

  const html = `
    ${badge(t.label, t.badgeColor)}
    ${heading("Demande enregistrée", `Bonjour <strong>${data.customerName}</strong>, nous avons bien reçu votre demande de réservation.`)}
    ${infoTable(data.details)}
    ${alertBox("Notre équipe vous contactera dans les plus brefs délais pour confirmer votre réservation.", "success")}
    ${button("Visiter notre site", APP_URL)}
  `;

  await sendCustomer(data.to, `${t.label} — Captain Purunchi`, html);
}

export async function sendCustomerStatusNotification(data: {
  to: string;
  customerName: string;
  type: "table" | "room" | "event";
  status: "confirmed" | "cancelled";
  details: { label: string; value: string }[];
}): Promise<void> {
  const typeLabels = {
    table: "réservation de table",
    room:  "réservation de chambre",
    event: "inscription événement",
  };

  const isConfirmed = data.status === "confirmed";
  const config = isConfirmed
    ? {
        badgeColor: "#28a745",
        badgeText: "Confirmée",
        title: "Réservation confirmée",
        subtitle: `Bonjour <strong>${data.customerName}</strong>, votre ${typeLabels[data.type]} a été confirmée. Nous avons hâte de vous accueillir !`,
        alert: alertBox("Votre place est réservée. Pensez à arriver à l'heure convenue.", "success"),
        cta: button("Visiter notre site", APP_URL),
      }
    : {
        badgeColor: "#dc3545",
        badgeText: "Annulée",
        title: "Réservation annulée",
        subtitle: `Bonjour <strong>${data.customerName}</strong>, votre ${typeLabels[data.type]} a été annulée.`,
        alert: alertBox("Pour toute question ou pour effectuer une nouvelle réservation, n'hésitez pas à nous contacter.", "info"),
        cta: "",
      };

  const html = `
    ${badge(config.badgeText, config.badgeColor)}
    ${heading(config.title, config.subtitle)}
    ${infoTable(data.details)}
    ${config.alert}
    ${config.cta}
  `;

  const subject = isConfirmed
    ? "Réservation confirmée — Captain Purunchi"
    : "Réservation annulée — Captain Purunchi";

  await sendCustomer(data.to, subject, html);
}

export async function sendCustomerOrderConfirmation(data: {
  to: string;
  customerName: string;
  items: { name: string; qty: number; price: string }[];
  totalAmount: string;
}): Promise<void> {
  const itemsHtml = data.items
    .map((i) => `<tr>
      <td style="padding:10px 16px;font-size:13px;color:#0d1f35;border-bottom:1px solid #f2f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">${i.qty}&times; ${i.name}</td>
      <td style="padding:10px 16px;font-size:13px;color:#7a8099;border-bottom:1px solid #f2f4f7;text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;">${i.price}</td>
    </tr>`)
    .join("");

  const html = `
    ${badge("Nouvelle commande", "#5BC0EB")}
    ${heading("Commande enregistrée", `Bonjour <strong>${data.customerName}</strong>, nous avons bien reçu votre commande.`)}
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;border:1px solid #eef0f4;">
      ${itemsHtml}
      <tr>
        <td style="padding:12px 16px;font-size:14px;color:#0d1f35;font-weight:700;font-family:'Helvetica Neue',Arial,sans-serif;border-top:2px solid #0d1f35;">Total</td>
        <td style="padding:12px 16px;font-size:14px;color:#c8a96e;font-weight:700;text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;border-top:2px solid #0d1f35;">${data.totalAmount}</td>
      </tr>
    </table>
    ${alertBox("Nous vous contacterons sous peu pour confirmer votre commande.", "success")}
    ${button("Visiter notre site", APP_URL)}
  `;

  await sendCustomer(data.to, "Commande enregistrée — Captain Purunchi", html);
}

export async function sendCustomerOrderStatusNotification(data: {
  to: string;
  customerName: string;
  status: "confirmed" | "cancelled";
  totalAmount: string;
}): Promise<void> {
  const isConfirmed = data.status === "confirmed";
  const config = isConfirmed
    ? {
        badgeColor: "#28a745",
        badgeText: "Confirmée",
        title: "Commande confirmée",
        subtitle: `Bonjour <strong>${data.customerName}</strong>, votre commande de ${data.totalAmount} a été confirmée.`,
        alert: alertBox("Votre commande est en cours de préparation.", "success"),
        cta: button("Visiter notre site", APP_URL),
      }
    : {
        badgeColor: "#dc3545",
        badgeText: "Annulée",
        title: "Commande annulée",
        subtitle: `Bonjour <strong>${data.customerName}</strong>, votre commande de ${data.totalAmount} a été annulée.`,
        alert: alertBox("Pour toute question, n'hésitez pas à nous contacter.", "info"),
        cta: "",
      };

  const html = `
    ${badge(config.badgeText, config.badgeColor)}
    ${heading(config.title, config.subtitle)}
    ${config.alert}
    ${config.cta}
  `;

  const subject = isConfirmed
    ? "Commande confirmée — Captain Purunchi"
    : "Commande annulée — Captain Purunchi";

  await sendCustomer(data.to, subject, html);
}

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
      <td style="padding:9px 16px;font-size:13px;color:#0d1f35;border-bottom:1px solid #f2f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">${i.description}</td>
      <td style="padding:9px 16px;font-size:13px;color:#7a8099;border-bottom:1px solid #f2f4f7;text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;">${i.qty}</td>
      <td style="padding:9px 16px;font-size:13px;color:#7a8099;border-bottom:1px solid #f2f4f7;text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;">${fmt(i.unitPrice)}</td>
      <td style="padding:9px 16px;font-size:13px;color:#0d1f35;font-weight:600;border-bottom:1px solid #f2f4f7;text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;">${fmt(i.total)}</td>
    </tr>`)
    .join("");

  const html = `
    ${badge(`Facture ${data.invoiceNumber}`, "#c8a96e")}
    ${heading("Votre facture", `Bonjour <strong>${data.customerName}</strong>, veuillez trouver ci-jointe votre facture.`)}

    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;border:1px solid #eef0f4;">
      <thead>
        <tr style="background:#f8f9fb;">
          <th style="padding:10px 16px;font-size:11px;color:#9aa0b4;text-align:left;text-transform:uppercase;letter-spacing:0.8px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:600;">Description</th>
          <th style="padding:10px 16px;font-size:11px;color:#9aa0b4;text-align:center;text-transform:uppercase;letter-spacing:0.8px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:600;">Qté</th>
          <th style="padding:10px 16px;font-size:11px;color:#9aa0b4;text-align:right;text-transform:uppercase;letter-spacing:0.8px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:600;">Prix unit.</th>
          <th style="padding:10px 16px;font-size:11px;color:#9aa0b4;text-align:right;text-transform:uppercase;letter-spacing:0.8px;font-family:'Helvetica Neue',Arial,sans-serif;font-weight:600;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot>
        ${data.tax > 0 ? `<tr>
          <td colspan="3" style="padding:9px 16px;font-size:13px;color:#7a8099;text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;">Sous-total</td>
          <td style="padding:9px 16px;font-size:13px;color:#0d1f35;text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;">${fmt(data.subtotal)} FCFA</td>
        </tr>
        <tr>
          <td colspan="3" style="padding:9px 16px;font-size:13px;color:#7a8099;text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;">Taxe</td>
          <td style="padding:9px 16px;font-size:13px;color:#0d1f35;text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;">${fmt(data.tax)} FCFA</td>
        </tr>` : ""}
        <tr>
          <td colspan="3" style="padding:12px 16px;font-size:14px;color:#0d1f35;font-weight:700;text-align:right;border-top:2px solid #0d1f35;font-family:'Helvetica Neue',Arial,sans-serif;">Total</td>
          <td style="padding:12px 16px;font-size:14px;color:#c8a96e;font-weight:700;text-align:right;border-top:2px solid #0d1f35;font-family:'Helvetica Neue',Arial,sans-serif;">${fmt(data.total)} FCFA</td>
        </tr>
      </tfoot>
    </table>

    ${data.dueDate ? alertBox(`Date d'échéance : <strong>${data.dueDate}</strong>`, "warning") : ""}

    <p style="font-size:13px;color:#9aa0b4;text-align:center;margin:0;font-family:'Helvetica Neue',Arial,sans-serif;line-height:1.7;">
      La facture au format PDF est jointe à cet email.<br>Pour toute question, n'hésitez pas à nous contacter.
    </p>
    ${button("Visiter notre site", APP_URL)}
  `;

  await sendCustomer(
    data.to,
    `Facture ${data.invoiceNumber} — Captain Purunchi`,
    html,
    [{ filename: `Facture_${data.invoiceNumber}.pdf`, content: pdfBuffer, contentType: "application/pdf" }]
  );
}
