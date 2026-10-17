const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export const formatPrice = (value) => inr.format(value ?? 0);

export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "";

// Inline placeholder shown when a product image fails to load.
const placeholderSvg =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="#e2e8f0"/>
      <text x="50%" y="50%" fill="#64748b" font-family="sans-serif" font-size="28" text-anchor="middle" dominant-baseline="middle">No image</text>
    </svg>`
  );

export const onImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = placeholderSvg;
};

export const STATUSES = ["PLACED", "SHIPPED", "DELIVERED", "CANCELLED"];

export const statusStyles = {
  PLACED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};
