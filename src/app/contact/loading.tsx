export default function ContactLoading() {
  return (
    <>
      <div className="skeleton" style={{ height: 200 }} />
      <div className="skeleton-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton skeleton-text" style={{ width: `${60 + (i % 3) * 15}%` }} />
              ))}
            </div>
            <div className="col-lg-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 48, marginBottom: 16, borderRadius: 8 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
