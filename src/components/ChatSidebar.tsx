import { Plus, MessageSquare, Trash2, Zap } from "lucide-react";
import type { Conversation } from "@/hooks/useChat";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

const ChatSidebar = ({ conversations, activeId, onSelect, onCreate, onDelete, open, onClose }: Props) => {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:relative z-40 h-full w-72 border-r border-border bg-card flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:w-64`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">WebForge AI</span>
          </div>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <button
            onClick={() => { onCreate(); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent transition-all"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { onSelect(conv.id); onClose(); }}
              className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                activeId === conv.id
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Powered by Lovable AI
          </p>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
