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

  // Remove the html code block from display and show it cleaner
  const displayContent = message.content;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 ${
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-br-md"
            : "bg-chat-ai text-chat-ai-foreground border border-border rounded-bl-md shadow-sm"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-chat-ai-foreground prose-strong:text-foreground prose-li:text-chat-ai-foreground prose-code:text-xs prose-pre:bg-muted prose-pre:rounded-lg prose-pre:text-xs">
            <ReactMarkdown>{displayContent}</ReactMarkdown>
          </div>
        )}

        {!isUser && containsHtml && !isLoading && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
            <button
              onClick={handlePreview}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview Website
            </button>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Code"}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageComponent;
