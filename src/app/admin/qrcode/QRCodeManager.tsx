"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";

const PRESET_LINKS = [
  { label: "Menu du restaurant", path: "/menu", icon: "fa-solid fa-utensils" },
  { label: "Réservation table", path: "/reservation", icon: "fa-solid fa-calendar-check" },
  { label: "Chambres", path: "/chambres", icon: "fa-solid fa-bed" },
  { label: "Événements", path: "/evenements", icon: "fa-solid fa-people-group" },
  { label: "Page d'accueil", path: "/", icon: "fa-solid fa-home" },
  { label: "Contact", path: "/contact", icon: "fa-solid fa-phone" },
];

const SIZES = [
  { value: 256, label: "Petit (256px)" },
  { value: 512, label: "Moyen (512px)" },
  { value: 1024, label: "Grand (1024px)" },
];

export default function QRCodeManager() {
  const [selectedPath, setSelectedPath] = useState("/menu");
  const [customUrl, setCustomUrl] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [size, setSize] = useState(512);
  const [tableNumber, setTableNumber] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://captainpurunchi.com";

  const getFullUrl = () => {
    if (useCustom) return customUrl;
    const path = selectedPath;
    const url = new URL(path, baseUrl);
    if (tableNumber) url.searchParams.set("table", tableNumber);
    return url.toString();
  };

  const generateQR = async () => {
    const url = getFullUrl();
    if (!url) return;

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: { dark: "#1a3a5c", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      setQrDataUrl(dataUrl);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    generateQR();
  }, [selectedPath, customUrl, useCustom, size, tableNumber]);

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    const label = useCustom ? "custom" : selectedPath.replace(/\//g, "-") || "accueil";
    const suffix = tableNumber ? `-table-${tableNumber}` : "";
    link.download = `qrcode-captain-purunchi${label}${suffix}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const printQR = () => {
    if (!qrDataUrl) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const label = useCustom ? customUrl : PRESET_LINKS.find(l => l.path === selectedPath)?.label || "Captain Purunchi";
    win.document.write(`
      <html>
        <head><title>QR Code - ${label}</title></head>
        <body style="text-align:center;font-family:sans-serif;padding:40px;">
          <h1 style="color:#1a3a5c;font-size:24px;">Captain Purunchi</h1>
          <img src="${qrDataUrl}" style="width:400px;height:400px;" />
          <h2 style="color:#333;margin-top:20px;">${label}</h2>
          ${tableNumber ? `<h3 style="color:#666;">Table ${tableNumber}</h3>` : ""}
          <p style="color:#999;font-size:14px;">Scannez pour accéder</p>
          <script>window.print();window.close();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="fa-solid fa-qrcode me-2"></i>
          QR Codes
        </h1>
      </div>

      <div className="row g-4">
        {/* Configuration */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Configuration</h5>
            </div>
            <div className="card-body">
              {/* Toggle */}
              <div className="mb-3">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="preset"
                    checked={!useCustom}
                    onChange={() => setUseCustom(false)}
                  />
                  <label className="form-check-label" htmlFor="preset">Page du site</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="custom"
                    checked={useCustom}
                    onChange={() => setUseCustom(true)}
                  />
                  <label className="form-check-label" htmlFor="custom">URL personnalisée</label>
                </div>
              </div>

              {/* Preset links */}
              {!useCustom && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">Page</label>
                  <div className="d-flex flex-wrap gap-2">
                    {PRESET_LINKS.map((link) => (
                      <button
                        key={link.path}
                        className={`btn ${selectedPath === link.path ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setSelectedPath(link.path)}
                      >
                        <i className={`${link.icon} me-1`}></i>
                        {link.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom URL */}
              {useCustom && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* Table number */}
              {!useCustom && selectedPath === "/menu" && (
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Numéro de table <span className="text-muted fw-normal">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="ex: 1, 2, 3..."
                    style={{ maxWidth: 200 }}
                  />
                  <small className="text-muted">
                    Ajouté au lien pour identifier la table qui commande
                  </small>
                </div>
              )}

              {/* Size */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Taille</label>
                <select className="form-select" style={{ maxWidth: 250 }} value={size} onChange={(e) => setSize(Number(e.target.value))}>
                  {SIZES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* URL preview */}
              <div className="alert alert-light mb-0">
                <small className="text-muted d-block mb-1">URL encodée :</small>
                <code className="text-break">{getFullUrl()}</code>
              </div>
            </div>
          </div>

          {/* Batch generation for tables */}
          {!useCustom && selectedPath === "/menu" && (
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fa-solid fa-table-cells me-2"></i>
                  Génération par lot
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">
                  Générez et imprimez les QR codes pour toutes vos tables en une fois.
                </p>
                <BatchPrint baseUrl={baseUrl} />
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Aperçu</h5>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={downloadQR} disabled={!qrDataUrl}>
                  <i className="fa-solid fa-download me-1"></i>Télécharger
                </button>
                <button className="btn btn-sm btn-primary" onClick={printQR} disabled={!qrDataUrl}>
                  <i className="fa-solid fa-print me-1"></i>Imprimer
                </button>
              </div>
            </div>
            <div className="card-body text-center py-5">
              {qrDataUrl ? (
                <>
                  <img src={qrDataUrl} alt="QR Code" style={{ maxWidth: 300, width: "100%", borderRadius: 8 }} />
                  <p className="text-muted mt-3 mb-0">
                    {useCustom ? "URL personnalis\u00e9e" : PRESET_LINKS.find(l => l.path === selectedPath)?.label}
                    {tableNumber && !useCustom ? ` — Table ${tableNumber}` : ""}
                  </p>
                </>
              ) : (
                <div className="text-muted">
                  <i className="fa-solid fa-qrcode" style={{ fontSize: 64, opacity: 0.3 }}></i>
                  <p className="mt-3">Configurez les options pour générer un QR code</p>
                </div>
              )}
            </div>
          </div>

          {/* Usage tips */}
          <div className="card mt-3">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fa-solid fa-lightbulb me-2 text-warning"></i>
                Conseils d{"'"}utilisation
              </h5>
            </div>
            <div className="card-body">
              <ul className="mb-0" style={{ lineHeight: 2 }}>
                <li>Imprimez le QR code <strong>Menu</strong> et placez-le sur chaque table</li>
                <li>Ajoutez le numéro de table pour savoir d{"'"}où vient la commande</li>
                <li>Utilisez le QR code <strong>Réservation</strong> sur vos cartes de visite</li>
                <li>Le QR code <strong>Contact</strong> est parfait pour les flyers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

/** Batch print component for all tables */
function BatchPrint({ baseUrl }: { baseUrl: string }) {
  const [count, setCount] = useState(10);
  const [printing, setPrinting] = useState(false);

  const handleBatchPrint = async () => {
    setPrinting(true);
    try {
      const qrCodes: { table: number; dataUrl: string }[] = [];
      for (let i = 1; i <= count; i++) {
        const url = `${baseUrl}/menu?table=${i}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 400,
          margin: 2,
          color: { dark: "#1a3a5c", light: "#ffffff" },
          errorCorrectionLevel: "H",
        });
        qrCodes.push({ table: i, dataUrl });
      }

      const win = window.open("", "_blank");
      if (!win) return;
      const cards = qrCodes.map(qr => `
        <div style="page-break-inside:avoid;display:inline-block;width:45%;text-align:center;margin:2%;padding:20px;border:2px solid #1a3a5c;border-radius:12px;">
          <h3 style="color:#1a3a5c;margin:0 0 10px;">Captain Purunchi</h3>
          <img src="${qr.dataUrl}" style="width:200px;height:200px;" />
          <h2 style="color:#1a3a5c;margin:10px 0 5px;">Table ${qr.table}</h2>
          <p style="color:#666;font-size:13px;margin:0;">Scannez pour voir le menu</p>
        </div>
      `).join("");

      win.document.write(`
        <html>
          <head><title>QR Codes - Tables 1 à ${count}</title></head>
          <body style="font-family:sans-serif;padding:20px;text-align:center;">
            ${cards}
            <script>setTimeout(()=>{window.print();},500);</script>
          </body>
        </html>
      `);
      win.document.close();
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="d-flex align-items-center gap-3">
      <div className="d-flex align-items-center gap-2">
        <label className="form-label mb-0 fw-semibold">Nombre de tables :</label>
        <input
          type="number"
          className="form-control"
          style={{ width: 80 }}
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />
      </div>
      <button className="btn btn-primary" onClick={handleBatchPrint} disabled={printing}>
        <i className="fa-solid fa-print me-1"></i>
        {printing ? "G\u00e9n\u00e9ration..." : `Imprimer ${count} QR codes`}
      </button>
    </div>
  );
}
