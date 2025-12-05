'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    onAnalysisRequest: (text: string) => void;
    onEmotionUpdate?: (data: any) => void;
}

export function ChatInterface({ onAnalysisRequest, onEmotionUpdate }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Bonjour 👋\n\nJe suis MindSpace, votre espace d'écoute bienveillant.\n\nComment vous sentez-vous aujourd'hui ?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            const data = await response.json();
            if (response.ok) {
                let formattedReply = "";

                if (data.reformulation) formattedReply += `${data.reformulation}\n\n`;
                if (data.motivational_summary) formattedReply += `💪 ${data.motivational_summary}\n\n`;

                if (data.suggested_actions && data.suggested_actions.length > 0) {
                    formattedReply += "🌱 Suggestions :\n";
                    data.suggested_actions.forEach((action: string) => {
                        formattedReply += `• ${action}\n`;
                    });
                    formattedReply += "\n";
                }

                if (data.open_questions && data.open_questions.length > 0) {
                    formattedReply += "❓ " + data.open_questions[0];
                }

                if (!formattedReply.trim() && data.reply) {
                    formattedReply = data.reply;
                }

                setMessages(prev => [...prev, { role: 'assistant', content: formattedReply.trim() }]);

                if (onEmotionUpdate && data.emotions) {
                    onEmotionUpdate({
                        date: new Date().toLocaleTimeString(),
                        emotions: data.emotions,
                        stress_score: data.stress_score
                    });
                }
            } else {
                console.error("Chat error:", data.error);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "⚠️ Une erreur est survenue."
                }]);
            }
        } catch (error) {
            console.error("Network error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "⚠️ Erreur de connexion."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl h-[550px] flex flex-col bg-white/80 backdrop-blur-sm border-white/50">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="block">MindSpace</span>
                        <span className="text-xs font-normal opacity-80">Psychologue IA • En ligne</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`p-2 rounded-full shrink-0 ${m.role === 'user'
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                : 'bg-gradient-to-br from-slate-200 to-slate-300'}`}>
                                {m.role === 'user'
                                    ? <User className="h-4 w-4 text-white" />
                                    : <Bot className="h-4 w-4 text-slate-600" />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${m.role === 'user'
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-none'
                                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gradient-to-br from-slate-200 to-slate-300">
                                <Bot className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex items-center gap-2 bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                <span className="text-sm text-slate-500">MindSpace réfléchit...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </CardContent>
            <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl">
                <div className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Écrivez ce que vous ressentez..."
                        className="min-h-[50px] max-h-[120px] resize-none border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="h-auto px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <div className="text-center mt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAnalysisRequest(messages.map(m => m.content).join('\n'))}
                        className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Générer un bilan complet
                    </Button>
                </div>
            </div>
        </Card>
    );
}
