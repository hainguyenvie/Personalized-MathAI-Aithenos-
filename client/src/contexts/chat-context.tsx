import React, { createContext, useContext, useState } from "react";

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  cta?: {
    text: string;
    href: string;
  };
}

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  addMessage: (message: string, isBot?: boolean, cta?: { text: string; href: string }) => void;
  openChatWithMessage: (message: string, response?: string) => void;
  pendingMessages: ChatMessage[];
  clearPendingMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen(!isOpen);

  const addMessage = (text: string, isBot: boolean = false, cta?: { text: string; href: string }) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
      cta,
    };
    setPendingMessages(prev => [...prev, newMessage]);
  };

  const clearPendingMessages = () => {
    setPendingMessages([]);
  };

  const openChatWithMessage = (message: string, response?: string) => {
    // Add user message
    addMessage(message, false);
    
    // Add bot response if provided
    if (response) {
      addMessage(response, true);
    }
    
    // Open chat
    setIsOpen(true);
  };

  return (
    <ChatContext.Provider value={{
      isOpen,
      setIsOpen,
      openChat,
      closeChat,
      toggleChat,
      addMessage,
      openChatWithMessage,
      pendingMessages,
      clearPendingMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

// Export the ChatMessage type for use in other components
export type { ChatMessage };