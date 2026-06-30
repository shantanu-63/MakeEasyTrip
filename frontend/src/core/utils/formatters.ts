export const formatPrice = (amount: number, currency = "₹"): string =>
  `${currency}${amount.toLocaleString("en-IN")}`;

export const formatPricePerNight = (amount: number): string =>
  `₹${amount.toLocaleString("en-IN")}/night`;

export const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
};

export const formatDateRange = (checkIn: string, checkOut: string): string =>
  `${formatDate(checkIn)} → ${formatDate(checkOut)}`;

export const getRatingLabel = (rating: number): string => {
  if (rating >= 4.5) return "Exceptional";
  if (rating >= 4.0) return "Excellent";
  if (rating >= 3.5) return "Very Good";
  if (rating >= 3.0) return "Good";
  return "Fair";
};

export const getInitials = (name: string): string =>
  name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

export const truncateText = (text: string, maxLen: number): string =>
  text.length > maxLen ? `${text.substring(0, maxLen)}...` : text;

export const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const calculateNights = (checkIn: string, checkOut: string): number => {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
};
