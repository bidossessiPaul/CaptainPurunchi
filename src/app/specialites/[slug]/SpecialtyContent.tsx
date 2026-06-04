"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function renderMarkdown(text: string): string {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^## (.+)$/gm, '<h2 class="sd-h2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="sd-h3">$1</h3>')
    .replace(/^\*\*(.+)\*\*$/gm, '<p class="sd-bold">$1</p>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^\*(.+)\*$/gm, '<p class="sd-note">$1</p>')
    .replace(/^- (.+)$/gm, '<li class="sd-li">$1</li>')
    .replace(/(<li[\s\S]*?<\/li>\n?)+/g, (match) => `<ul class="sd-ul">${match}</ul>`)
    .replace(/\n\n/g, "</p><p class=\"sd-p\">")
    .replace(/\n/g, " ");
  html = html.replace(/<\/h[23]> /g, (m) => m.trim());
  if (!html.startsWith("<")) html = `<p class="sd-p">${html}</p>`;
  return html;
}

export function SpecialtyShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => { setUrl(window.location.href); }, []);

  return (
    <div className="sd-share">
      <span className="sd-share-label">Partager</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(title + " — " + url)}`}
        target="_blank" rel="noopener noreferrer"
        className="sd-share-btn sd-share-wa"
        title="Partager sur WhatsApp"
      >
        <i className="fa fa-whatsapp" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank" rel="noopener noreferrer"
        className="sd-share-btn sd-share-fb"
        title="Partager sur Facebook"
      >
        <i className="fa fa-facebook" />
      </a>
    </div>
  );
}

export function SpecialtyArticle({ details, description }: { details: string | null; description: string }) {
  const html = details ? renderMarkdown(details) : `<p class="sd-p">${description}</p>`;
  return (
    <div
      className="sd-article"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function SpecialtyStickyCard({
  title,
  description,
  src,
  id,
}: {
  title: string;
  description: string;
  src: string;
  id: string;
}) {
  return (
    <aside className="sd-sticky-card">
      {src && (
        <div
          className="sd-card-img"
          style={{ backgroundImage: `url(${src})` }}
        />
      )}
      <div className="sd-card-body">
        <div className="sd-card-badge">
          <i className="iconoir-map-pin" />
          <span>Captain Purunchi · Cotonou, Bénin</span>
        </div>
        <h3 className="sd-card-title">{title}</h3>
        <p className="sd-card-desc">{description}</p>
        <div className="sd-card-divider" />
        <Link href="/reservation" className="sd-card-cta-primary">
          <i className="iconoir-calendar me-2" />
          Réserver une table
        </Link>
        <Link href="/menu" className="sd-card-cta-secondary">
          <i className="iconoir-utensils me-2" />
          Voir le menu complet
        </Link>
        <div className="sd-card-divider" />
        <SpecialtyShareButtons title={title} />
      </div>
    </aside>
  );
}
