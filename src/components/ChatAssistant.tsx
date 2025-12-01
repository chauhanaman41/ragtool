'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import styles from './ChatAssistant.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatAssistantProps {
    context: string;
}

export default function ChatAssistant({ context }: ChatAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I can help you answer questions about your content. Ask me anything!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    context
                }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setMessages((prev) => [...prev, data]);
        } catch (error) {
            console.error('Chat failed:', error);
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.container}>
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <span>Content Assistant</span>
                        <button onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className={styles.messages}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                                    }`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className={`${styles.message} ${styles.assistantMessage}`}>
                                Typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className={styles.inputArea}>
                        <input
                            className={styles.input}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask a question..."
                            disabled={isLoading}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
            <button
                className={styles.toggleButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
}
