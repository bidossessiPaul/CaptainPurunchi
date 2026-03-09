"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { BlogPost, BlogComment } from "@/app/types/blog";

function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => { setUrl(window.location.href); }, []);
  return (
    <div className="blog-detail-share">
      <span className="blog-detail-share-label">Partager :</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(title + " - " + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="blog-share-btn whatsapp"
      >
        <i className="fa fa-whatsapp"></i>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="blog-share-btn facebook"
      >
        <i className="fa fa-facebook"></i>
      </a>
    </div>
  );
}

function renderContent(text: string): string {
  if (!text) return "";
  // If content contains HTML tags, render as raw HTML
  if (/<[a-z][\s\S]*?>/i.test(text)) return text;
  // Otherwise, use simple markdown rendering
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?:<br \/>)*/g, (match) => {
    return "<ul>" + match.replace(/<br \/>/g, "") + "</ul>";
  });
  html = html.replace(/<\/blockquote><br \/><blockquote>/g, "<br />");
  return "<p>" + html + "</p>";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

export default function BlogArticle({
  post,
  comments: initialComments,
  otherPosts,
  whatsapp,
  phone,
}: {
  post: BlogPost;
  comments: BlogComment[];
  otherPosts: BlogPost[];
  whatsapp: string;
  phone: string;
}) {
  const [comments, setComments] = useState(initialComments);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    setCommentSubmitting(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: post.id,
        name: commentName.trim(),
        email: commentEmail.trim(),
        text: commentText.trim(),
      }),
    });

    if (res.ok) {
      setCommentSuccess(true);
      setCommentName("");
      setCommentEmail("");
      setCommentText("");
    }

    setCommentSubmitting(false);
  };

  return (
    <div className="blog-detail-layout">
      {/* Main content */}
      <article className="blog-detail-main">
        {/* Article content */}
        <div
          className="blog-detail-content"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />

        {/* Tags / Share */}
        <ShareButtons title={post.title} />

        {/* Comments section */}
        <div className="blog-comments-section">
          <h3 className="blog-comments-title">
            Commentaires ({comments.length})
          </h3>

          {comments.length > 0 ? (
            <div className="blog-comments-list">
              {comments.map((c) => (
                <div key={c.id} className="blog-comment">
                  <div className="blog-comment-avatar">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="blog-comment-body">
                    <div className="blog-comment-header">
                      <strong className="blog-comment-name">{c.name}</strong>
                      <span className="blog-comment-time">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="blog-comment-text">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="blog-comments-empty">
              Soyez le premier à commenter cet article.
            </p>
          )}

          {/* Comment form */}
          {commentSuccess ? (
            <div className="blog-comment-success">
              <i className="fa fa-check-circle"></i>
              Merci pour votre commentaire ! Il sera visible après modération.
            </div>
          ) : (
            <form className="blog-comment-form" onSubmit={handleCommentSubmit}>
              <h4>Laisser un commentaire</h4>
              <div className="blog-comment-form-row">
                <div className="blog-comment-form-group">
                  <input
                    type="text"
                    placeholder="Votre nom *"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    required
                  />
                </div>
                <div className="blog-comment-form-group">
                  <input
                    type="email"
                    placeholder="Votre email (optionnel)"
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="blog-comment-form-group">
                <textarea
                  placeholder="Votre commentaire *"
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="blog-comment-submit"
                disabled={commentSubmitting || !commentName.trim() || !commentText.trim()}
              >
                {commentSubmitting ? "Envoi..." : "Publier le commentaire"}
              </button>
            </form>
          )}
        </div>
      </article>

      {/* Sidebar */}
      <aside className="blog-detail-sidebar">
        {/* CTA Card */}
        <div className="blog-sidebar-cta">
          <div className="blog-sidebar-cta-icon">
            <img src="/logo.png" alt="Captain Purunchi" />
          </div>
          <h4 style={{ color: "#fff" }}>Envie de goûter ?</h4>
          <p>Découvrez nos plats du jour et passez votre commande en ligne.</p>
          <Link href="/menu" className="blog-sidebar-cta-btn">
            Voir le menu
          </Link>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="blog-sidebar-cta-whatsapp"
            >
              <i className="fa fa-whatsapp"></i> Nous contacter
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="blog-sidebar-cta-phone">
              <i className="fa fa-phone"></i> {phone}
            </a>
          )}
        </div>

        {/* Reservation CTA */}
        <div className="blog-sidebar-reserve">
          <h4>Réservez votre table</h4>
          <p>Pour une expérience inoubliable au Captain Purunchi</p>
          <Link href="/reservation" className="blog-sidebar-reserve-btn">
            Réserver maintenant
          </Link>
        </div>

        {/* Other articles */}
        {otherPosts.length > 0 && (
          <div className="blog-sidebar-articles">
            <h4 className="blog-sidebar-title">Autres articles</h4>
            <div className="blog-sidebar-list">
              {otherPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="blog-sidebar-item"
                >
                  {p.thumb && (
                    <img src={p.thumb} alt={p.title} className="blog-sidebar-item-img" />
                  )}
                  <div className="blog-sidebar-item-info">
                    <span className="blog-sidebar-item-title">{p.title}</span>
                    <span className="blog-sidebar-item-date">{p.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
