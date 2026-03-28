export function InfoBanner({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div
      className={`mb-4 rounded-md p-3 text-sm ${
        type === "error"
          ? "border border-red-200 bg-red-50 text-red-700"
          : "border border-green-200 bg-green-50 text-green-700"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        <button type="button" onClick={onClose} className="text-xs underline">
          Dismiss
        </button>
      </div>
    </div>
  );
}
