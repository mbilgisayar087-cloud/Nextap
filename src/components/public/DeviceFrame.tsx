import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders children inside an <iframe> with its own document, so CSS media
 * queries (Tailwind's `sm:` etc.) evaluate against the iframe's own narrow
 * viewport instead of the admin panel's desktop viewport. This is what makes
 * the live preview panel show the exact same layout a phone would show at
 * `/k/[card_code]` — shrinking the component into a small box without an
 * iframe would keep every `sm:` class active (since those check the real
 * browser window width), producing a different, "desktop" layout.
 */
export default function DeviceFrame({ children, width = 390, height = 780 }: { children: ReactNode; width?: number; height?: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function setup() {
      const doc = iframe!.contentDocument;
      if (!doc) return;

      // Copy every stylesheet/style tag from the host document so Tailwind
      // (and the rest of the app's CSS) applies identically inside the frame.
      doc.head.innerHTML = '';
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        doc.head.appendChild(node.cloneNode(true));
      });

      doc.body.innerHTML = '';
      doc.body.style.margin = '0';
      doc.documentElement.style.margin = '0';
      const root = doc.createElement('div');
      root.id = 'device-frame-root';
      doc.body.appendChild(root);
      setMountNode(root);
    }

    if (iframe.contentDocument?.readyState === 'complete') setup();
    iframe.addEventListener('load', setup);
    return () => iframe.removeEventListener('load', setup);
  }, []);

  return (
    <div
      style={{
        width, height, margin: '0 auto', borderRadius: 34, background: '#111827',
        padding: 10, boxShadow: 'var(--shadow-md)', boxSizing: 'content-box',
      }}
    >
      <iframe
        ref={iframeRef}
        title="Canlı Önizleme"
        style={{ width, height, border: 'none', borderRadius: 24, background: '#fff', display: 'block' }}
      />
      {mountNode && createPortal(children, mountNode)}
    </div>
  );
}
