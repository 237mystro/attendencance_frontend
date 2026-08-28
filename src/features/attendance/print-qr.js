/**
 * Opens a print-friendly window containing just the QR code and the
 * instructions someone needs when they walk up to it on a wall.
 *
 * Deliberately a standalone document rather than a print stylesheet: the poster
 * shares nothing with the app's layout, and this keeps the printed artefact
 * stable no matter how the surrounding page changes.
 */
export const printQrPoster = ({ qrCode, title, subtitle }) => {
  if (!qrCode) return;

  const printWindow = window.open('', '_blank', 'width=600,height=760');
  if (!printWindow) return; // Blocked by a popup blocker.

  const escapeHtml = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[character],
    );

  printWindow.document.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)} — attendance QR</title>
    <style>
      body { font-family: "Segoe UI", Arial, sans-serif; text-align: center; padding: 40px; background: #fff; color: #0f172a; }
      h1 { font-size: 26px; margin: 0 0 4px; }
      p { font-size: 14px; color: #475569; margin: 6px 0; }
      img { width: 280px; height: 280px; margin: 24px auto; display: block; border: 1px solid #e2e8f0; padding: 12px; border-radius: 12px; }
      .brand { font-size: 13px; color: #155eef; font-weight: 700; }
      .note { margin-top: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #eef2f7; padding-top: 14px; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(subtitle)}</p>
    <img src="${qrCode}" alt="Attendance QR code" />
    <p class="brand">AutoPayroll · Attendance check-in</p>
    <div class="note">
      <p>Point your phone camera at this code when you arrive or leave.</p>
      <p>You must be inside the workplace geofence for it to work.</p>
    </div>
    <script>
      // Print once the QR image has actually decoded, or the sheet comes out blank.
      const image = document.querySelector('img');
      if (image.complete) window.print();
      else image.onload = () => window.print();
    </script>
  </body>
</html>`);
  printWindow.document.close();
};

/** Saves the QR code as a PNG using its data URL. */
export const downloadQrPng = (qrCode, filename) => {
  if (!qrCode) return;
  const link = document.createElement('a');
  link.href = qrCode;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
};
