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

      {/* Preview area */}
      <div className="flex-1 flex items-start justify-center overflow-auto bg-muted/40 p-3">
        <div
          className="bg-background rounded overflow-hidden transition-all duration-300 h-full slds-card"
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
