import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readBlogPostBySlug, readActiveBlogPosts, readApprovedComments } from "@/lib/blog-store";
import { readContactInfo } from "@/lib/contact-store";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import BlogArticle from "./BlogArticle";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.SITE_URL || "https://captainpurunchi.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await readBlogPostBySlug(slug);
  if (!post) return { title: "Article introuvable" };

  const description = post.excerpt || `${post.title} — Blog Captain Purunchi Cotonou`;
  const articleUrl = `/blog/${post.slug}`;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      url: articleUrl,
      type: "article",
      ...(post.thumb && { images: [{ url: post.thumb, alt: post.title }] }),
      ...(post.author && { authors: [post.author] }),
      ...(post.date && { publishedTime: post.date }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(post.thumb && { images: [post.thumb] }),
    },
    alternates: { canonical: articleUrl },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts, contact] = await Promise.all([
    readBlogPostBySlug(slug),
    readActiveBlogPosts(),
    readContactInfo(),
  ]);

  if (!post) notFound();

  const comments = await readApprovedComments(post.id);
  const otherPosts = allPosts.filter((p) => p.id !== post.id).slice(0, 5);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || "",
    ...(post.thumb && { image: post.thumb }),
    ...(post.author && { author: { "@type": "Person", name: post.author } }),
    ...(post.date && { datePublished: post.date }),
    publisher: {
      "@type": "Organization",
      name: "Captain Purunchi",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <div className="blog-detail-page">
      <Breadcrumbs items={[{ name: "Blog", href: "/blog" }, { name: post.title, href: `/blog/${post.slug}` }]} />
      <Navbar activePage="blog" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="blog-detail-hero">
        <div className="container blog-detail-hero-content">
          <div className="blog-detail-meta">
            <span className="blog-detail-date">
              <i className="fa fa-calendar-alt"></i> {post.date}
            </span>
            {post.author && (
              <span className="blog-detail-author">
                <i className="fa fa-user"></i> {post.author}
              </span>
            )}
          </div>
          <h1>{post.title}</h1>
        </div>
      </div>

      {post.thumb && (
        <div className="container">
          <div className="blog-detail-featured-img">
            <img src={post.thumb} alt={post.title} />
          </div>
        </div>
      )}

      <div className="container">
        <BlogArticle
          post={post}
          comments={comments}
          otherPosts={otherPosts}
          whatsapp={contact.whatsapp}
          phone={contact.phone}
        />
      </div>

      <Footer contact={contact} />
      <WhatsAppFloat whatsapp={contact.whatsapp} />
    </div>
  );
}
