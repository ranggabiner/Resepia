import React, { useState, useRef, useEffect } from 'react';

// Types
interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  loading?: boolean;
  role: 'system' | 'user' | 'assistant';
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  recipeContext?: {
    name: string;
    description: string;
    ingredients: string[];
    steps: string[];
  };
}

const getInitialMessage = (recipeName: string): ChatMessage => ({
  id: 0,
  text: `Hi! Saya adalah resepia. Saya siap membantu Anda dengan resep ${recipeName}. Silakan tanyakan apa saja terkait resep ini!`,
  isBot: true,
  role: 'system'
});

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose, recipeContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => 
    [getInitialMessage(recipeContext?.name || 'ini')]
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const SYSTEM_PROMPT: OpenAIMessage = {
    role: 'system',
    content: `Saya adalah asisten resep yang dapat membantu hal-hal seputar resep makanan. 
  
  Saya akan merespons pertanyaan tentang resep makanan.
  
  Untuk resep ${recipeContext?.name || ''}: 
  Deskripsi: ${recipeContext?.description || ''}
  
  Bahan-bahan:
  ${recipeContext?.ingredients?.join('\n') || ''}
  
  Langkah-langkah:
  ${recipeContext?.steps?.join('\n') || ''}  
`
  };

  const formatMessagesForAPI = (messages: ChatMessage[]): OpenAIMessage[] => {
    return [
      SYSTEM_PROMPT,
      ...messages
        .filter(msg => msg.id !== 0) // Exclude initial greeting
        .map(msg => ({
          role: msg.role,
          content: msg.text
        }))
    ];
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: messages.length,
      text: input,
      isBot: false,
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const loadingMessage: ChatMessage = {
      id: messages.length + 1,
      text: '...',
      isBot: true,
      loading: true,
      role: 'assistant'
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formatMessagesForAPI([...messages, userMessage]),
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const botResponse = data.choices[0].message.content;

      setMessages(prev => 
        prev
          .filter(msg => !msg.loading)
          .concat({
            id: messages.length + 1,
            text: botResponse,
            isBot: true,
            role: 'assistant'
          })
      );
    } catch (error) {
      console.error('Error:', error);
      
      setMessages(prev => 
        prev
          .filter(msg => !msg.loading)
          .concat({
            id: messages.length + 1,
            text: error instanceof Error 
              ? `Error: ${error.message}` 
              : "Sorry, I couldn't process your request. Please try again.",
            isBot: true,
            role: 'assistant'
          })
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 w-80 bg-white rounded-lg shadow-xl z-50">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold">Cooking Assistant</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      <div className="h-96 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.isBot ? 'text-left' : 'text-right'}`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                message.isBot
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-indigo-600 text-white'
              } ${message.loading ? 'animate-pulse' : ''}`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:bg-gray-100"
            placeholder={isLoading ? "Please wait..." : "Type a message..."}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBot;