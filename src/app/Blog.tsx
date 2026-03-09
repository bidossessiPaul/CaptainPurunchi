import Link from "next/link";
import type { BlogPost } from "@/app/types/blog";

const MAX_HOME_POSTS = 4;

export default function Blog({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  const visible = posts.slice(0, MAX_HOME_POSTS);
  const hasMore = posts.length > MAX_HOME_POSTS;

  return (
    <section id="blog" className="home-blog-section">
      <div className="container">
        <div className="home-blog-header">
          <span className="home-blog-label">Blog</span>
          <h2 className="home-blog-title">Notre Blog</h2>
          <p className="home-blog-subtitle">
            Recettes, coulisses et actualit&eacute;s de Captain Purunchi.
          </p>
        </div>

        <div className="home-blog-grid">
          {visible.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="home-blog-card"
            >
              <div className="home-blog-card-img">
                {post.thumb ? (
                  <img src={post.thumb} alt={post.title} />
                ) : (
                  <div className="home-blog-card-placeholder">
                    <i className="fa fa-newspaper" aria-hidden="true"></i>
                  </div>
                )}
                <div className="home-blog-card-overlay">
                  <span>Lire &rarr;</span>
                </div>
              </div>
              <div className="home-blog-card-body">
                <p className="home-blog-card-date">
                  <i className="fa fa-calendar-alt"></i> {post.date}
                </p>
                <h3 className="home-blog-card-title">{post.title}</h3>
                <span className="home-blog-card-readmore">
                  Lire l&apos;article &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="home-blog-more">
            <Link href="/blog" className="home-blog-more-btn">
              Voir tous les articles
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
