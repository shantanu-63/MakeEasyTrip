export default function DestinationsLoading() {
  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <div style={{ marginBottom: "32px" }}>
        <div className="skeleton" style={{ width: "240px", height: "36px", borderRadius: "8px", marginBottom: "12px" }} />
        <div className="skeleton" style={{ width: "320px", height: "16px", borderRadius: "6px" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton" style={{ height: "240px", borderRadius: "16px" }} />
        ))}
      </div>
    </div>
  );
}
