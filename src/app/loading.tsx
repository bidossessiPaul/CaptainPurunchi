export default function Loading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="skeleton skeleton-hero" />

      {/* Content skeletons */}
      <div className="skeleton-section">
        <div className="container">
          <div className="skeleton skeleton-title" style={{ margin: "0 auto 30px" }} />
          <div className="row">
            {[1, 2, 3].map((i) => (
              <div key={i} className="col-lg-4 col-md-6" style={{ marginBottom: 24 }}>
                <div className="skeleton skeleton-card" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
