import { useState, useRef } from "react";
import { Upload, Link, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onReplace: (newSrc: string) => void;
  currentSrc: string;
}

const ImageReplaceDialog = ({ open, onClose, onReplace, currentSrc }: Props) => {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    if (tab === "upload" && preview) {
      onReplace(preview);
    } else if (tab === "url" && url.trim()) {
      onReplace(url.trim());
    }
    handleClose();
  };

  const handleClose = () => {
    setUrl("");
    setPreview(null);
    setTab("upload");
    onClose();
  };

  const canApply = (tab === "upload" && preview) || (tab === "url" && url.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="bg-card border border-border rounded-lg shadow-xl w-[420px] max-w-[90vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Replace Image</h3>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current image preview */}
        <div className="px-4 pt-3">
          <p className="text-xs text-muted-foreground mb-2">Current image:</p>
          <div className="h-20 rounded border border-border overflow-hidden bg-muted">
            <img src={currentSrc} alt="Current" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-3 gap-1">
          <button
            onClick={() => setTab("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              tab === "upload"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Upload className="w-3 h-3" />
            Upload
          </button>
          <button
            onClick={() => setTab("url")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              tab === "url"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <Link className="w-3 h-3" />
            Image URL
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          {tab === "upload" ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              {preview ? (
                <div className="space-y-2">
                  <div className="h-28 rounded border border-border overflow-hidden bg-muted">
                    <img src={preview} alt="New" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-28 rounded border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Click to upload an image</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://images.pexels.com/photos/..."
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {url.trim() && (
                <div className="h-28 rounded border border-border overflow-hidden bg-muted">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-xs font-medium rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!canApply}
            className="px-3 py-1.5 text-xs font-medium rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Replace
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageReplaceDialog;
