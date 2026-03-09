export default function GalerieLoading() {
  return (
    <>
      <div className="skeleton" style={{ height: 200 }} />
      <div className="skeleton-section">
        <div className="container">
          <div className="row">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="col-lg-4 col-md-6" style={{ marginBottom: 24 }}>
                <div className="skeleton" style={{ height: 220, borderRadius: 12 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
