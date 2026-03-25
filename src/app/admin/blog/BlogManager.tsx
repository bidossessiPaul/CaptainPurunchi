"use client";

import { useState, useEffect, useCallback } from "react";
import type { BlogPost } from "@/app/types/blog";
import BlogCard from "./BlogCard";
import BlogForm from "./BlogForm";
import ConfirmModal from "../ConfirmModal";

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/blog");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement articles:", err);
      setPosts([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreate = async (data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    date: string;
    author: string;
    thumb: string;
  }) => {
    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchPosts();
      setShowForm(false);
    } else {
      const err = await res.json().catch(() => null);
      alert(err?.error || "Erreur lors de la création de l'article");
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setShowForm(false);
  };

  const handleUpdate = async (data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    date: string;
    author: string;
    thumb: string;
  }) => {
    if (!editingPost) return;
    const res = await fetch(`/api/blog/${editingPost.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      await fetchPosts();
      setEditingPost(null);
    } else {
      const err = await res.json().catch(() => null);
      alert(err?.error || "Erreur lors de la modification de l'article");
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active } : p))
    );
    await fetch(`/api/blog/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/blog/${id}`, { method: "DELETE" });
    await fetchPosts();
  };

  const reorder = async (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    await fetch("/api/blog/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: newPosts.map((p) => p.id) }),
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const arr = [...posts];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    reorder(arr);
  };

  const handleMoveDown = (index: number) => {
    if (index === posts.length - 1) return;
    const arr = [...posts];
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    reorder(arr);
  };

  const dragHandlers = {
    onDragStart: (_e: React.DragEvent, index: number) => {
      setDragIndex(index);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
    },
    onDrop: (_e: React.DragEvent, dropIndex: number) => {
      if (dragIndex === null || dragIndex === dropIndex) return;
      const arr = [...posts];
      const [dragged] = arr.splice(dragIndex, 1);
      arr.splice(dropIndex, 0, dragged);
      reorder(arr);
      setDragIndex(null);
    },
    onDragEnd: () => {
      setDragIndex(null);
    },
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="row mb-3">
        <div className="col">
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setEditingPost(null); }}
            disabled={showForm}
          >
            <i className="iconoir-plus me-1"></i>
            Ajouter un article
          </button>
          <span className="text-muted ms-3 fs-13">
            {posts.length} article{posts.length !== 1 ? "s" : ""} •{" "}
            {posts.filter((p) => p.active).length} actif{posts.filter((p) => p.active).length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {showForm && (
        <BlogForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingPost && (
        <BlogForm
          post={editingPost}
          onSubmit={handleUpdate}
          onCancel={() => setEditingPost(null)}
        />
      )}

      {posts.length === 0 && !showForm ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="iconoir-page-edit" style={{ fontSize: "48px", color: "#95a0c5" }}></i>
            <h5 className="mt-3">Aucun article</h5>
            <p className="text-muted">Ajoutez votre premier article de blog.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <i className="iconoir-plus me-1"></i>
              Ajouter un article
            </button>
          </div>
        </div>
      ) : (
        <div className="row">
          {posts.map((post, i) => (
            <div key={post.id} className="col-md-6 col-lg-4 col-xl-3">
              <BlogCard
                post={post}
                index={i}
                onToggleActive={handleToggleActive}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteTarget(id)}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isFirst={i === 0}
                isLast={i === posts.length - 1}
                dragHandlers={dragHandlers}
              />
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Supprimer l'article"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cet article ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
