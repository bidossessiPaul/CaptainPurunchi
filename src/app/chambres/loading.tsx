export default function ChambresLoading() {
  return (
    <>
      <div className="skeleton" style={{ height: 200 }} />
      <div className="skeleton-section">
        <div className="container">
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
