import { useRef, useEffect, useState, useMemo } from "react";
import { Menu, Zap } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessageComponent from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import WebsitePreview from "@/components/WebsitePreview";
import { extractHtmlFromMessage } from "@/lib/htmlExtractor";

const Index = () => {
  const {
    conversations,
    activeConversation,
    activeId,
    isLoading,
    setActiveId,
    createConversation,
    deleteConversation,
    sendMessage,
    stopGeneration,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = activeConversation?.messages || [];

  const latestHtml = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") {
        const html = extractHtmlFromMessage(messages[i].content);
        if (html) return html;
      }
    }
    return null;
  }, [messages]);

  useEffect(() => {
    if (latestHtml && !isLoading) {
      setPreviewHtml(latestHtml);
    }
  }, [latestHtml, isLoading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleRegenerate = (index: number) => {
    const userMessages = messages.slice(0, index).filter((m) => m.role === "user");
    const lastUserMsg = userMessages[userMessages.length - 1];
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={createConversation}
        onDelete={deleteConversation}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Chat panel */}
      <div className={`flex-1 flex flex-col min-w-0 ${previewHtml ? "max-w-[50%]" : ""}`}>
        {/* SLDS-style page header */}
        <header className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-sm text-foreground">
              {activeConversation?.title || "WebForge AI"}
            </h1>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin bg-background">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
            {messages.length === 0 && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="max-w-[85%] md:max-w-[75%] rounded px-4 py-3 bg-chat-ai text-chat-ai-foreground border border-border slds-card">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      Hi! I'm <strong>WebForge AI</strong> ⚡
                    </p>
                    <p className="text-sm leading-relaxed mt-2">
                      Tell me your business name and any details — tone, colors, audience, goal — and I'll build a <strong>real, live website</strong> for you instantly!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <ChatMessageComponent
                key={i}
                message={msg}
                isLast={i === messages.length - 1}
                isLoading={isLoading && i === messages.length - 1}
                onPreview={(html) => setPreviewHtml(html)}
                onRegenerate={
                  msg.role === "assistant" && !isLoading
                    ? () => handleRegenerate(i)
                    : undefined
                }
              />
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="rounded bg-chat-ai border border-border slds-card">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        </div>

        <ChatInput onSend={sendMessage} onStop={stopGeneration} isLoading={isLoading} />
      </div>

      {/* Preview panel */}
      {previewHtml && (
        <div className="hidden md:flex w-1/2 flex-shrink-0">
          <WebsitePreview
            html={previewHtml}
            onClose={() => setPreviewHtml(null)}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
