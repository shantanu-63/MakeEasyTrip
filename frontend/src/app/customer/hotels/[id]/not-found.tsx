import Link from "next/link";

export default function HotelNotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🏨</div>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 800,
          color: "var(--color-primary)",
          marginBottom: "12px",
        }}
      >
        Hotel Not Found
      </h1>
      <p
        style={{
          fontSize: "14px",
          color: "var(--color-text-muted)",
          maxWidth: "400px",
          marginBottom: "28px",
          lineHeight: 1.6,
        }}
      >
        We couldn&apos;t find the hotel you&apos;re looking for. It may have been removed or the link is incorrect.
      </p>
      <Link
        href="/customer/hotels"
        style={{
          backgroundColor: "var(--color-secondary)",
          color: "#fff",
          padding: "10px 28px",
          borderRadius: "999px",
          fontWeight: 700,
          fontSize: "14px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <i className="fa-solid fa-hotel" /> Browse Hotels
      </Link>
    </div>
  );
}
