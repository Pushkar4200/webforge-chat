import { useMemo } from "react";
import { ExternalLink, X, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

interface Props {
  html: string;
  onClose: () => void;
}

const WebsitePreview = ({ html, onClose }: Props) => {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const iframeWidth = device === "mobile" ? "375px" : device === "tablet" ? "768px" : "100%";

  const openInNewTab = () => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/30 border-l border-border">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/80 backdrop-blur-sm">
        <span className="text-xs font-medium text-muted-foreground">Live Preview</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-md transition-colors ${device === "desktop" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`p-1.5 rounded-md transition-colors ${device === "tablet" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Tablet"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-md transition-colors ${device === "mobile" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={openInNewTab}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title="Close preview"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-start justify-center overflow-auto bg-muted/50 p-2">
        <div
          className="bg-background rounded-lg shadow-lg overflow-hidden transition-all duration-300 h-full"
          style={{ width: iframeWidth, maxWidth: "100%" }}
        >
          <iframe
            srcDoc={html}
            title="Website Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};

export default WebsitePreview;
