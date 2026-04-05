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
  const loadingRef = useRef(false);
  const conversationsRef = useRef<Conversation[]>([]);
  conversationsRef.current = conversations;
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

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
      if (loadingRef.current) return;
      loadingRef.current = true;

      let convId = activeIdRef.current;
      if (!convId) {
        const id = crypto.randomUUID();
        const conv: Conversation = {
          id,
          title: content.slice(0, 40) + (content.length > 40 ? "..." : ""),
          messages: [],
          createdAt: new Date(),
        };
        setConversations((prev) => [conv, ...prev]);
        setActiveId(id);
        convId = id;
      }

      const userMsg: ChatMessage = { role: "user", content };

      const currentMessages = conversationsRef.current.find((c) => c.id === convId)?.messages || [];

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const updated = [...c.messages, userMsg];
          const title = c.messages.length === 0 ? content.slice(0, 40) + (content.length > 40 ? "..." : "") : c.title;
          return { ...c, messages: updated, title };
        })
      );

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

      const finish = () => {
        setIsLoading(false);
        loadingRef.current = false;
      };

      const allMessages = [...currentMessages, userMsg];

      try {
        await streamChat({
          messages: allMessages,
          onDelta: updateAssistant,
          onDone: finish,
          onError: (err) => {
            updateAssistant(`\n\n⚠️ ${err}`);
            finish();
          },
          signal: controller.signal,
        });
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          updateAssistant("\n\n⚠️ Something went wrong. Please try again.");
        }
        finish();
      }
    },
    [] // no state dependencies - uses refs
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    loadingRef.current = false;
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
