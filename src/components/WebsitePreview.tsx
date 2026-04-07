import { ExternalLink, X, Monitor, Smartphone, Tablet, ImagePlus } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import ImageReplaceDialog from "./ImageReplaceDialog";

interface Props {
  html: string;
  onClose: () => void;
  onHtmlChange?: (html: string) => void;
}

// Script injected into the iframe to make images clickable
const INJECT_SCRIPT = `
<script>
(function() {
  let editMode = false;
  
  window.addEventListener('message', function(e) {
    if (e.data.type === 'toggleEditMode') {
      editMode = e.data.enabled;
      document.querySelectorAll('img').forEach(function(img) {
        img.style.cursor = editMode ? 'pointer' : '';
        img.style.outline = editMode ? '2px dashed rgba(0,120,255,0.5)' : '';
        img.style.outlineOffset = editMode ? '-2px' : '';
      });
      // Also handle background images
      document.querySelectorAll('[style*="background-image"]').forEach(function(el) {
        el.style.cursor = editMode ? 'pointer' : '';
        el.style.outline = editMode ? '2px dashed rgba(0,120,255,0.5)' : '';
        el.style.outlineOffset = editMode ? '-2px' : '';
      });
    }
    if (e.data.type === 'replaceImage') {
      var imgs = document.querySelectorAll('img');
      imgs.forEach(function(img) {
        if (img.src === e.data.oldSrc || img.getAttribute('src') === e.data.oldSrc) {
          img.src = e.data.newSrc;
        }
      });
      // Replace background images too
      document.querySelectorAll('[style*="background-image"]').forEach(function(el) {
        var style = el.getAttribute('style') || '';
        if (style.includes(e.data.oldSrc)) {
          el.setAttribute('style', style.replace(e.data.oldSrc, e.data.newSrc));
        }
      });
      // Send back updated HTML
      window.parent.postMessage({ type: 'htmlUpdated', html: document.documentElement.outerHTML }, '*');
    }
  });

  document.addEventListener('click', function(e) {
    if (!editMode) return;
    var target = e.target;
    
    // Check if it's an img
    if (target.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage({ type: 'imageClicked', src: target.src }, '*');
      return;
    }
    
    // Check for background-image
    var el = target;
    while (el && el !== document.body) {
      var bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none') {
        var match = bg.match(/url\\(["']?(.*?)["']?\\)/);
        if (match) {
          e.preventDefault();
          e.stopPropagation();
          window.parent.postMessage({ type: 'imageClicked', src: match[1] }, '*');
          return;
        }
      }
      el = el.parentElement;
    }
  }, true);
})();
</script>`;

const WebsitePreview = ({ html, onClose, onHtmlChange }: Props) => {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [editMode, setEditMode] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentHtmlRef = useRef(html);

  const iframeWidth = device === "mobile" ? "375px" : device === "tablet" ? "768px" : "100%";

  // Inject our script into the HTML
  const injectedHtml = html.replace("</body>", `${INJECT_SCRIPT}</body>`);

  // Listen for messages from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data.type === "imageClicked") {
        setSelectedImageSrc(e.data.src);
        setDialogOpen(true);
      }
      if (e.data.type === "htmlUpdated") {
        currentHtmlRef.current = e.data.html;
        onHtmlChange?.(e.data.html);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onHtmlChange]);

  // Toggle edit mode in iframe
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: "toggleEditMode", enabled: editMode }, "*");
  }, [editMode]);

  const handleReplace = useCallback((newSrc: string) => {
    iframeRef.current?.contentWindow?.postMessage({
      type: "replaceImage",
      oldSrc: selectedImageSrc,
      newSrc,
    }, "*");
    setDialogOpen(false);
  }, [selectedImageSrc]);

  const openInNewTab = () => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(currentHtmlRef.current || html);
      win.document.close();
    }
  };

  const DeviceButton = ({ type, icon: Icon, label }: { type: typeof device; icon: typeof Monitor; label: string }) => (
    <button
      onClick={() => setDevice(type)}
      className={`p-1.5 rounded transition-colors ${
        device === type
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
      title={label}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-muted/30 border-l border-border">
      {/* SLDS-style toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Preview</span>
        <div className="flex items-center gap-0.5">
          {/* Edit Images toggle */}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
              editMode
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            title="Toggle image edit mode — click images to replace them"
          >
            <ImagePlus className="w-3.5 h-3.5" />
            {editMode ? "Editing" : "Edit Images"}
          </button>

          <div className="w-px h-4 bg-border mx-1.5" />

          <DeviceButton type="desktop" icon={Monitor} label="Desktop" />
          <DeviceButton type="tablet" icon={Tablet} label="Tablet" />
          <DeviceButton type="mobile" icon={Smartphone} label="Mobile" />
          <div className="w-px h-4 bg-border mx-1.5" />
          <button
            onClick={openInNewTab}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Close preview"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edit mode banner */}
      {editMode && (
        <div className="px-3 py-1.5 bg-primary/10 border-b border-primary/20 text-xs text-primary font-medium text-center">
          🖼️ Click any image in the preview to replace it
        </div>
      )}

      {/* Preview area */}
      <div className="flex-1 flex items-start justify-center overflow-auto bg-muted/40 p-3">
        <div
          className="bg-background rounded overflow-hidden transition-all duration-300 h-full slds-card"
          style={{ width: iframeWidth, maxWidth: "100%" }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={injectedHtml}
            title="Website Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

      {/* Image replace dialog */}
      <ImageReplaceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onReplace={handleReplace}
        currentSrc={selectedImageSrc}
      />
    </div>
  );
};

export default WebsitePreview;
