import ReactMarkdown from "react-markdown";
import { Copy, RefreshCw, Check, Eye, Code } from "lucide-react";
import { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/streamChat";
import { extractHtmlFromMessage, hasHtmlCode } from "@/lib/htmlExtractor";

interface Props {
  message: ChatMessageType;
  onRegenerate?: () => void;
  onPreview?: (html: string) => void;
  isLast?: boolean;
  isLoading?: boolean;
}

const ChatMessageComponent = ({ message, onRegenerate, onPreview, isLast, isLoading }: Props) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const containsHtml = hasHtmlCode(message.content);

  const handleCopyCode = () => {
    const html = extractHtmlFromMessage(message.content);
    if (html) {
      navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreview = () => {
    const html = extractHtmlFromMessage(message.content);
    if (html && onPreview) onPreview(html);
  };

  const displayContent = message.content;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded px-4 py-3 ${
          isUser
            ? "bg-chat-user text-chat-user-foreground"
            : "bg-chat-ai text-chat-ai-foreground border border-border slds-card"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-chat-ai-foreground prose-strong:text-foreground prose-li:text-chat-ai-foreground prose-code:text-xs prose-pre:bg-muted prose-pre:rounded prose-pre:text-xs">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>
        )}

        {!isUser && containsHtml && !isLoading && (
          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-border">
            <button
              onClick={handlePreview}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2.5 py-1.5 rounded bg-primary/8 hover:bg-primary/12"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded hover:bg-accent"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded hover:bg-accent"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Redo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageComponent;
