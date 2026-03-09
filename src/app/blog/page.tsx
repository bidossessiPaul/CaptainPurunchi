import type { Metadata } from "next";
import Link from "next/link";
import { readActiveBlogPosts } from "@/lib/blog-store";
import { readContactInfo } from "@/lib/contact-store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Blog — Recettes, Actualités & Coulisses du Captain Purunchi Cotonou",
  description:
    "Blog du Captain Purunchi : recettes de fruits de mer, coulisses de la cuisine, actualités du restaurant et conseils gastronomiques à Cotonou, Bénin. Découvrez nos articles.",
  keywords: [
    "blog Captain Purunchi", "recettes fruits de mer Cotonou",
    "actualités restaurant Cotonou", "blog gastronomique Bénin",
    "cuisine africaine recettes", "restaurant Cotonou blog",
    "Captain Purunchi news", "seafood recipes Cotonou",
    "Benin food blog", "Captain Purunchi articles",
  ],
  openGraph: {
    title: "Blog Captain Purunchi — Recettes & Actualités",
    description: "Recettes, coulisses et actualités du Captain Purunchi. Suivez notre blog pour les dernières nouvelles du restaurant à Cotonou.",
    url: "/blog",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Blog Captain Purunchi" }],
  },
  alternates: { canonical: "/blog" },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const [posts, contact] = await Promise.all([
    readActiveBlogPosts(),
    readContactInfo(),
  ]);

  return (
    <div className="blog-page">
      <Breadcrumbs items={[{ name: "Blog", href: "/blog" }]} />
      <Navbar activePage="blog" />

      <div className="blog-page-header">
        <div className="container">
          <Link href="/" className="blog-back">
            &larr; Retour
          </Link>
          <h1>Notre Blog</h1>
          <p>{posts.length} articles</p>
        </div>
      </div>

      <div className="container">
        <div className="blog-archive-grid">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="blog-archive-card"
            >
              <div className="blog-archive-card-img">
                {post.thumb ? (
                  <img src={post.thumb} alt={post.title} />
                ) : (
                  <div className="blog-archive-card-placeholder">
                    <i className="fa fa-newspaper" aria-hidden="true"></i>
                  </div>
                )}
                <div className="blog-archive-card-overlay">
                  <span>Lire &rarr;</span>
                </div>
              </div>
              <div className="blog-archive-card-body">
                <p className="blog-archive-card-date">
                  <i className="fa fa-calendar-alt"></i> {post.date}
                </p>
                <h3 className="blog-archive-card-title">{post.title}</h3>
                {post.excerpt && (
                  <p className="blog-archive-card-excerpt">{post.excerpt}</p>
                )}
                <div className="blog-archive-card-footer">
                  <span className="blog-archive-card-author">
                    <i className="fa fa-user"></i> {post.author}
                  </span>
                  <span className="blog-archive-card-readmore">
                    Lire l&apos;article &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
