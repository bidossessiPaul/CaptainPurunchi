export default function ReservationLoading() {
  return (
    <>
      <div className="skeleton" style={{ height: 200 }} />
      <div className="skeleton-section">
        <div className="container" style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="skeleton skeleton-title" style={{ margin: "0 auto 20px" }} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 48, marginBottom: 16, borderRadius: 8 }} />
          ))}
          <div className="skeleton" style={{ height: 48, width: 200, borderRadius: 50, margin: "20px auto 0" }} />
        </div>
      </div>
    </>
  );
}
