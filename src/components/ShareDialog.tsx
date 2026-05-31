import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { MAX_SHARE_URL } from "../share";

interface Props {
  url: string;
  title: string;
  onClose: () => void;
}

export function ShareDialog({ url, title, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);
  const urlRef = useRef<HTMLTextAreaElement>(null);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  const tooLong = url.length > MAX_SHARE_URL;

  function selectUrl() {
    const ta = urlRef.current;
    if (!ta) return;
    ta.focus();
    ta.setSelectionRange(0, ta.value.length); // iOS-friendly select-all
  }

  async function copy() {
    // The async Clipboard API is the only path we can trust to have actually
    // copied (and it needs a secure context: HTTPS or localhost).
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        return;
      } catch {
        /* fall through to manual selection */
      }
    }
    // Fallback (e.g. http LAN preview): select the link so it's one tap to copy.
    selectUrl();
    setManual(true);
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

        <textarea
          className="dialog-url"
          ref={urlRef}
          readOnly
          rows={2}
          value={url}
          onFocus={selectUrl}
        />

        {manual && (
          <p className="dialog-note manual-hint">
            Link selected — tap <strong>Copy</strong> on the selection menu.
          </p>
        )}

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
