import { useState, useCallback, useRef } from "react";
import { ChatMessage, streamChat } from "@/lib/streamChat";

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const createConversation = useCallback(() => {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      // Prevent duplicate sends
      if (sendingRef.current || isLoading) return;
      sendingRef.current = true;

      let convId = activeId;
      if (!convId) {
        convId = createConversation();
      }

      const userMsg: ChatMessage = { role: "user", content };

      // Capture current messages before updating state
      let currentMessages: ChatMessage[] = [];
      setConversations((prev) => {
        const conv = prev.find((c) => c.id === convId);
        currentMessages = conv?.messages || [];
        return prev.map((c) => {
          if (c.id !== convId) return c;
          const updated = [...c.messages, userMsg];
          const title = c.messages.length === 0 ? content.slice(0, 40) + (content.length > 40 ? "..." : "") : c.title;
          return { ...c, messages: updated, title };
        });
      });

      setIsLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;

      let assistantSoFar = "";

      const updateAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        const current = assistantSoFar;
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c;
            const msgs = [...c.messages];
            const last = msgs[msgs.length - 1];
            if (last?.role === "assistant") {
              msgs[msgs.length - 1] = { ...last, content: current };
            } else {
              msgs.push({ role: "assistant", content: current });
            }
            return { ...c, messages: msgs };
          })
        );
      };

      const allMessages = [...currentMessages, userMsg];

      try {
        await streamChat({
          messages: allMessages,
          onDelta: updateAssistant,
          onDone: () => {
            setIsLoading(false);
            sendingRef.current = false;
          },
          onError: (err) => {
            updateAssistant(`\n\n⚠️ ${err}`);
            setIsLoading(false);
            sendingRef.current = false;
          },
          signal: controller.signal,
        });
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          updateAssistant("\n\n⚠️ Something went wrong. Please try again.");
        }
        setIsLoading(false);
        sendingRef.current = false;
      }
    },
    [activeId, isLoading, createConversation]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    sendingRef.current = false;
  }, []);

  return {
    conversations,
    activeConversation,
    activeId,
    isLoading,
    setActiveId,
    createConversation,
    deleteConversation,
    sendMessage,
    stopGeneration,
  };
}
