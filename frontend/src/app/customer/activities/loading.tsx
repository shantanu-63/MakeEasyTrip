export default function ActivitiesLoading() {
  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: "24px" }}>
        <div className="skeleton" style={{ width: "120px", height: "16px", borderRadius: "6px", marginBottom: "12px" }} />
        <div className="skeleton" style={{ width: "280px", height: "32px", borderRadius: "8px", marginBottom: "8px" }} />
        <div className="skeleton" style={{ width: "180px", height: "14px", borderRadius: "6px" }} />
      </div>
      {/* Gallery skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "32px", height: "320px" }}>
        <div className="skeleton" style={{ borderRadius: "12px", height: "100%" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="skeleton" style={{ borderRadius: "12px", flex: 1 }} />
          <div className="skeleton" style={{ borderRadius: "12px", flex: 1 }} />
        </div>
      </div>
      {/* Content skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: "120px", borderRadius: "12px" }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="skeleton" style={{ height: "280px", borderRadius: "12px" }} />
          <div className="skeleton" style={{ height: "180px", borderRadius: "12px" }} />
        </div>
      </div>
    </div>
  );
}
