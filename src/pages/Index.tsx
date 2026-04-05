import { useRef, useEffect, useState } from "react";
import { Menu, Zap } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessageComponent from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";

const WELCOME_MESSAGE = `Hi! I'm **WebForge AI** ⚡

Tell me your business name and any details — tone, colors, audience, goal — even if it's messy — and I'll build your website instantly!`;

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages, isLoading]);

  const messages = activeConversation?.messages || [];

  const handleRegenerate = (index: number) => {
    // Find the last user message before this assistant message
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

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-3 h-3 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-sm text-foreground">
              {activeConversation?.title || "WebForge AI"}
            </h1>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {/* Welcome message when no conversation */}
            {messages.length === 0 && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-bl-md px-5 py-3.5 bg-chat-ai text-chat-ai-foreground border border-border shadow-sm">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      Hi! I'm <strong>WebForge AI</strong> ⚡
                    </p>
                    <p className="text-sm leading-relaxed mt-2">
                      Tell me your business name and any details — tone, colors, audience, goal — even if it's messy — and I'll build your website instantly!
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
                onRegenerate={
                  msg.role === "assistant" && !isLoading
                    ? () => handleRegenerate(i)
                    : undefined
                }
              />
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="rounded-2xl rounded-bl-md bg-chat-ai border border-border shadow-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} onStop={stopGeneration} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Index;
