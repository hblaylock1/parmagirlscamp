"use client";

export default function PrintShareButtons() {
  return (
    <div className="no-print flex flex-wrap gap-3">
      <button onClick={() => window.print()} className="btn-primary">
        Print
      </button>
      <a href="/qr-code.jpg" download className="btn-secondary">
        Download QR image
      </a>
    </div>
  );
}
