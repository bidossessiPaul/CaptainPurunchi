export default function MenuLoading() {
  return (
    <>
      <div className="skeleton" style={{ height: 200 }} />
      <div className="skeleton-section">
        <div className="container">
          <div className="skeleton skeleton-title" style={{ margin: "0 auto 20px" }} />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton skeleton-text" style={{ width: `${70 + (i % 3) * 10}%`, maxWidth: 500, margin: "0 auto 12px" }} />
          ))}
        </div>
      </div>
    </>
  );
}
