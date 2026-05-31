import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { MAX_SHARE_URL } from "../share";

interface Props {
  url: string;
  title: string;
  onClose: () => void;
}

export function ShareDialog({ url, title, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  const tooLong = url.length > MAX_SHARE_URL;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      prompt("Copy this link:", url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: `${title} — current scores`, url });
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="dialog-title">Share read-only</h2>

        {tooLong ? (
          <p className="dialog-note">
            This game is large, so the link is too long for a scannable QR code.
            Use the link below instead.
          </p>
        ) : (
          <div className="qr-box">
            <QRCodeSVG value={url} size={224} level="L" marginSize={2} />
          </div>
        )}

        <p className="dialog-note">
          Anyone with this link sees a read-only snapshot of the current scores.
        </p>

        <div className="dialog-url">{url}</div>

        <div className="dialog-actions">
          {canShare && (
            <button className="btn btn-ghost" onClick={nativeShare}>
              Share…
            </button>
          )}
          <button className="btn btn-primary" onClick={copy}>
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        </div>

        <button className="link dialog-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
