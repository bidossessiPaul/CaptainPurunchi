"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice, InvoiceItem } from "@/app/types/invoice";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";

interface CompanyInfo {
  phone: string;
  email: string;
  address: string;
}

async function loadLogo(): Promise<{ data: string; width: number; height: number } | null> {
  try {
    const res = await fetch("/images%20captain/logo%20pour%20fond%20noir.png");
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject();
      reader.readAsDataURL(blob);
    });
    // Get natural dimensions via Image
    const dims: { width: number; height: number } = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 960, height: 480 }); // fallback ~2:1
      img.src = dataUrl;
    });
    return { data: dataUrl, ...dims };
  } catch {
    return null;
  }
}

function fmt(n: number) {
  // Replace non-breaking spaces with regular spaces for PDF compatibility
  return n.toLocaleString("fr-FR").replace(/\u202F|\u00A0/g, " ");
}

export async function generateInvoicePDF(invoice: Invoice, company: CompanyInfo) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── HEADER BAND ──────────────────────────────────
  doc.setFillColor(26, 58, 92); // #1a3a5c
  doc.rect(0, 0, pageWidth, 52, "F");

  // Logo
  const logo = await loadLogo();
  let logoEndX = 15;
  if (logo) {
    const logoHeight = 30; // fixed height in mm
    const ratio = logo.width / logo.height;
    const logoWidth = logoHeight * ratio;
    doc.addImage(logo.data, "PNG", 15, 11, logoWidth, logoHeight);
    logoEndX = 15 + logoWidth + 6;
  }

  // Company info (to the right of the logo, or left if no logo)
  doc.setTextColor(200, 210, 230);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (company.address) doc.text(company.address, logoEndX, 22);
  const contactLine = [company.phone, company.email].filter(Boolean).join(" | ");
  if (contactLine) doc.text(contactLine, logoEndX, 28);

  // Invoice title on the right
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(200, 169, 126); // gold accent
  doc.text("FACTURE", pageWidth - 15, 24, { align: "right" });

  doc.setFontSize(11);
  doc.setTextColor(180, 195, 220);
  doc.text(invoice.invoiceNumber, pageWidth - 15, 33, { align: "right" });

  // ── INVOICE META ──────────────────────────────────
  let y = 62;

  // Left block: Customer info
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURÉ À", 15, y);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.customerName, 15, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  let cy = y + 13;
  if (invoice.customerEmail) {
    doc.text(invoice.customerEmail, 15, cy);
    cy += 5;
  }
  if (invoice.customerPhone) {
    doc.text(invoice.customerPhone, 15, cy);
  }

  // Right block: Invoice details
  const rightX = pageWidth - 15;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text("DÉTAILS", rightX, y, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  const createdDate = new Date(invoice.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Date : ${createdDate}`, rightX, y + 7, { align: "right" });

  if (invoice.dueDate) {
    doc.text(`Échéance : ${invoice.dueDate}`, rightX, y + 13, { align: "right" });
  }

  const statusLabel = INVOICE_STATUS_LABELS[invoice.status] || invoice.status;
  doc.setFont("helvetica", "bold");
  if (invoice.status === "paid") {
    doc.setTextColor(40, 167, 69);
  } else if (invoice.status === "cancelled") {
    doc.setTextColor(220, 53, 69);
  } else {
    doc.setTextColor(23, 162, 184);
  }
  doc.text(`Statut : ${statusLabel}`, rightX, y + 19, { align: "right" });

  // ── ITEMS TABLE ──────────────────────────────────
  y = 90;

  let items: InvoiceItem[] = [];
  try {
    items = JSON.parse(invoice.items);
  } catch {
    items = [];
  }

  autoTable(doc, {
    startY: y,
    head: [["Description", "Qté", "Prix unitaire", "Total"]],
    body: items.map((item) => [
      item.description,
      String(item.qty),
      `${fmt(item.unitPrice)} FCFA`,
      `${fmt(item.total)} FCFA`,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [26, 58, 92],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 45, halign: "right" },
      3: { cellWidth: 45, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 15, right: 15 },
  });

  // ── TOTALS ──────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
  const totalsX = pageWidth - 15;
  let ty = finalY + 10;

  // Subtotal
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Sous-total :", totalsX - 50, ty);
  doc.setTextColor(50, 50, 50);
  doc.text(`${fmt(invoice.subtotal)} FCFA`, totalsX, ty, { align: "right" });

  // Tax
  if (invoice.tax > 0) {
    ty += 7;
    doc.setTextColor(100, 100, 100);
    doc.text("Taxe :", totalsX - 50, ty);
    doc.setTextColor(50, 50, 50);
    doc.text(`${fmt(invoice.tax)} FCFA`, totalsX, ty, { align: "right" });
  }

  // Divider line
  ty += 5;
  doc.setDrawColor(26, 58, 92);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 70, ty, totalsX, ty);

  // Total
  ty += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 58, 92);
  doc.text("TOTAL :", totalsX - 50, ty);
  doc.text(`${fmt(invoice.total)} FCFA`, totalsX, ty, { align: "right" });

  // ── PAID STAMP ──────────────────────────────────
  if (invoice.status === "paid") {
    doc.setFontSize(40);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 167, 69);
    doc.saveGraphicsState();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const GState = (doc as any).GState;
    if (GState) doc.setGState(new GState({ opacity: 0.15 }));
    const centerX = pageWidth / 2;
    const centerY = finalY - 10;
    doc.text("PAYÉE", centerX, centerY, {
      align: "center",
      angle: 30,
    });
    doc.restoreGraphicsState();
  }

  // ── NOTES ──────────────────────────────────
  if (invoice.notes) {
    ty += 15;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("NOTES", 15, ty);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 30);
    doc.text(noteLines, 15, ty + 6);
  }

  // ── FOOTER ──────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(245, 247, 250);
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Captain Purunchi — ${company.address || "Cotonou, Bénin"} — ${company.phone || ""}`,
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );
  doc.text(
    "Merci pour votre confiance !",
    pageWidth / 2,
    pageHeight - 7,
    { align: "center" }
  );

  // Download
  doc.save(`Facture_${invoice.invoiceNumber}.pdf`);
}
