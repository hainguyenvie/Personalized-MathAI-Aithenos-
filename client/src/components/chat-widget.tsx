import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { useChat, type ChatMessage } from "@/contexts/chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

export default function ChatWidget() {
  const { isOpen, toggleChat, closeChat, pendingMessages, clearPendingMessages } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Chào bạn học, hôm nay bạn muốn học cái gì theo lộ trình được thiết kế dành riêng cho bạn nhỉ",
      isBot: true,
      timestamp: new Date(),
    }
  ]);

  // Suggested questions for quick access
  const suggestedQuestions = [
    "Làm thế nào để xác định hệ số góc từ đồ thị?",
    "Khi nào hai đường thẳng song song với nhau?",
    "Cách tìm giao điểm của hai đường thẳng?",
    "Ý nghĩa của tung độ gốc trong thực tế?",
    "Tại sao đồ thị hàm số bậc nhất luôn là đường thẳng?",
    "Hàm số bậc nhất có những tính chất gì?",
    "Cách vẽ đồ thị hàm số y = ax + b?",
    "Sự khác biệt giữa hàm số đồng biến và nghịch biến?",
  ];
  
  // Add pending messages to chat when widget opens
  useEffect(() => {
    if (isOpen && pendingMessages.length > 0) {
      setMessages(prev => [...prev, ...pendingMessages]);
      clearPendingMessages();
    }
  }, [isOpen, pendingMessages, clearPendingMessages]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(true);

  const handleSuggestedQuestion = async (question: string) => {
    setShowSuggestedQuestions(false);
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: question,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: "typing",
      text: "Đang trả lời...",
      isBot: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      });
      
      const data = await response.json();
      
      // Replace typing indicator with actual response
      setMessages(prev => prev.filter(m => m.id !== "typing"));
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.",
        isBot: true,
        timestamp: new Date(),
        cta: data.cta || undefined,
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => prev.filter(m => m.id !== "typing"));
      
      const errorResponse: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: "Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.",
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setShowSuggestedQuestions(false);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    const userMessage = inputValue;
    setInputValue("");

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: "typing",
      text: "Đang trả lời...",
      isBot: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await response.json();
      
      // Replace typing indicator with actual response
      setMessages(prev => prev.filter(m => m.id !== "typing"));
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.",
        isBot: true,
        timestamp: new Date(),
        cta: data.cta || undefined,
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => prev.filter(m => m.id !== "typing"));
      
      const errorResponse: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: "Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.",
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorResponse]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-xl transition-all duration-300 z-50"
      >
        <MessageCircle size={24} />
      </Button>

      {/* Chat Widget */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 bg-white rounded-xl shadow-2xl border z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot size={20} />
                <span className="font-semibold">Trợ lý AI</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeChat}
                className="hover:bg-white/20 rounded p-1"
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 h-64 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${
                    message.isBot ? 'bg-gray-100' : 'bg-teal text-white ml-8'
                  } p-3 rounded-lg`}
                >
                  <p className="text-sm" data-testid={`message-text-${message.id}`}>{message.text}</p>
                  {message.cta && (
                    <div className="mt-3">
                      <Link href={message.cta.href}>
                        <Button 
                          size="sm" 
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                          data-testid={`cta-button-${message.id}`}
                        >
                          {message.cta.text}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Suggested Questions */}
              {showSuggestedQuestions && messages.length === 1 && (
                <div className="space-y-2">
                  {suggestedQuestions.slice(0, 6).map((question, index) => (
                    <Button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-3 bg-teal hover:bg-teal/90 text-white border-teal hover:border-teal"
                      data-testid={`suggested-question-${index}`}
                    >
                      <span className="text-xs leading-relaxed">{question}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi..."
                className="flex-1 text-sm focus:ring-purple-500"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
