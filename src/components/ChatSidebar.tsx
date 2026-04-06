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
      {open && (
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-30 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:relative z-40 h-full w-72 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200 border-r border-sidebar-border ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } md:w-64`}
      >
        {/* Brand header */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-sidebar-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-accent-foreground tracking-tight text-sm">
              WebForge AI
            </span>
          </div>
        </div>

        {/* New chat */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => { onCreate(); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded border border-sidebar-border text-xs font-medium text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pt-2 space-y-0.5">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { onSelect(conv.id); onClose(); }}
              className={`group flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-xs transition-colors ${
                activeId === conv.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
              <span className="truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                className="opacity-0 group-hover:opacity-100 text-sidebar-foreground hover:text-destructive transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground/60 text-center tracking-wide uppercase">
            Powered by Lovable AI
          </p>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
