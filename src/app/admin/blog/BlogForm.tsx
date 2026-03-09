"use client";

import { useState, useRef } from "react";
import type { BlogPost } from "@/app/types/blog";

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  thumb: string;
}

interface BlogFormProps {
  post?: BlogPost;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onCancel: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function BlogForm({ post, onSubmit, onCancel }: BlogFormProps) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [date, setDate] = useState(post?.date || "");
  const [author, setAuthor] = useState(post?.author || "");
  const [thumb, setThumb] = useState(post?.thumb || "");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [slugManual, setSlugManual] = useState(!!post?.slug);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugManual(true);
    setSlug(slugify(val));
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/blog/upload", { method: "POST", body: formData });
    if (res.ok) {
      const { src } = await res.json();
      setThumb(src);
    } else {
      const err = await res.json();
      alert(err.error || "Erreur upload");
    }
    setUploadingThumb(false);
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await onSubmit({
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content,
      date: date.trim(),
      author: author.trim(),
      thumb,
    });
    setSubmitting(false);
  };

  // Simple toolbar for content editor
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("blog-content") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="mb-3">{post ? "Modifier l'article" : "Nouvel article"}</h6>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Title */}
            <div className="col-md-6">
              <label className="form-label fs-13">Titre *</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Titre de l'article"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            {/* Slug */}
            <div className="col-md-6">
              <label className="form-label fs-13">Slug (URL)</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text fs-12">/blog/</span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="mon-article"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                />
              </div>
            </div>

            {/* Date + Author */}
            <div className="col-md-3">
              <label className="form-label fs-13">Date</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="15 F&Eacute;VRIER 2025"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fs-13">Auteur</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Chef Arnaud"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            {/* Thumbnail */}
            <div className="col-md-6">
              <label className="form-label fs-13">Image de couverture</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="d-none"
                  onChange={handleThumbUpload}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => thumbInputRef.current?.click()}
                  disabled={uploadingThumb}
                >
                  {uploadingThumb ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <><i className="iconoir-upload me-1"></i>Upload</>
                  )}
                </button>
                {thumb && (
                  <img
                    src={thumb}
                    alt="thumb"
                    style={{ height: 40, width: 60, objectFit: "cover", borderRadius: 4 }}
                  />
                )}
                {thumb && (
                  <span className="text-muted fs-12 text-truncate" style={{ maxWidth: 200 }}>
                    {thumb.split("/").pop()}
                  </span>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div className="col-12">
              <label className="form-label fs-13">
                Extrait <span className="text-muted">(affiché dans la liste des articles)</span>
              </label>
              <textarea
                className="form-control form-control-sm"
                rows={2}
                placeholder="Un court résumé de l'article..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                maxLength={500}
              />
              <small className="text-muted">{excerpt.length}/500</small>
            </div>

            {/* Content editor with toolbar */}
            <div className="col-12">
              <label className="form-label fs-13">Contenu de l'article</label>
              <div className="blog-editor-toolbar">
                <button type="button" className="btn btn-sm btn-light" onClick={() => insertMarkdown("## ", "\n")} title="Titre">
                  <strong>H2</strong>
                </button>
                <button type="button" className="btn btn-sm btn-light" onClick={() => insertMarkdown("### ", "\n")} title="Sous-titre">
                  <strong>H3</strong>
                </button>
                <button type="button" className="btn btn-sm btn-light" onClick={() => insertMarkdown("**", "**")} title="Gras">
                  <strong>B</strong>
                </button>
                <button type="button" className="btn btn-sm btn-light" onClick={() => insertMarkdown("*", "*")} title="Italique">
                  <em>I</em>
                </button>
                <button type="button" className="btn btn-sm btn-light" onClick={() => insertMarkdown("\n- ")} title="Liste">
                  &bull; Liste
                </button>
                <button type="button" className="btn btn-sm btn-light" onClick={() => insertMarkdown("\n> ")} title="Citation">
                  &ldquo; Citation
                </button>
                <button type="button" className="btn btn-sm btn-light" onClick={() => insertMarkdown("[", "](url)")} title="Lien">
                  Lien
                </button>
              </div>
              <textarea
                id="blog-content"
                className="form-control blog-content-editor"
                rows={24}
                placeholder={"Rédigez votre article ici...\n\nVous pouvez utiliser du Markdown :\n## Titre\n**gras**, *italique*\n- liste\n> citation"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <small className="text-muted">Markdown supporté : titres (##), gras (**), italique (*), listes (-), citations (&gt;), liens [texte](url)</small>
            </div>

            {/* Actions */}
            <div className="col-12 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-sm btn-primary"
                disabled={submitting || !title.trim()}
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <><i className="iconoir-check me-1"></i>{post ? "Enregistrer" : "Créer"}</>
                )}
              </button>
              <button type="button" className="btn btn-sm btn-light" onClick={onCancel}>
                Annuler
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
