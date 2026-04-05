import ReactMarkdown from "react-markdown";
import { Copy, RefreshCw, Check } from "lucide-react";
import { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/streamChat";

interface Props {
  message: ChatMessageType;
  onRegenerate?: () => void;
  isLast?: boolean;
  isLoading?: boolean;
}

function convertMarkdownToHtml(md: string): string {
  // Basic conversion for copy functionality
  return md
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-8 mb-3">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-12 mb-6">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/^---$/gm, '<hr class="my-8 border-gray-200" />')
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hlu]|<li|<hr|<p)/gm, "<p>")
    .replace(/<p><\/p>/g, "");
}

const ChatMessageComponent = ({ message, onRegenerate, isLast, isLoading }: Props) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isWebsite = message.content.includes("## Website for:");

  const handleCopy = () => {
    const html = convertMarkdownToHtml(message.content);
    const wrapped = `<div class="max-w-4xl mx-auto px-6 py-12 font-sans">\n${html}\n</div>`;
    navigator.clipboard.writeText(wrapped);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-chat-ai-foreground prose-strong:text-foreground prose-li:text-chat-ai-foreground">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {!isUser && isWebsite && !isLoading && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy as HTML"}
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
