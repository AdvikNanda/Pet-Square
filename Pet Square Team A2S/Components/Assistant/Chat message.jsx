import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function ChatMessage({ message, isUser, image, readAloudEnabled }) {
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if (readAloudEnabled && !isUser && message) {
            speakText(message);
        }
    }, [message, readAloudEnabled, isUser]);

    const speakText = (text) => {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const toggleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            speakText(message);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                </div>
            )}

            <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
                <div
                    className={`rounded-2xl px-4 py-3 ${
                        isUser
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                >
                    {image && (
                        <img
                            src={image}
                            alt="Uploaded"
                            className="rounded-lg mb-2 max-h-48 w-auto"
                        />
                    )}
                    {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
                    ) : (
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{message}</ReactMarkdown>
                        </div>
                    )}
                </div>

                {!isUser && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSpeak}
                        className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        {isSpeaking ? (
                            <>
                                <VolumeX className="w-3 h-3 mr-1" />
                                Stop
                            </>
                        ) : (
                            <>
                                <Volume2 className="w-3 h-3 mr-1" />
                                Read Aloud
                            </>
                        )}
                    </Button>
                )}
            </div>

            {isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                </div>
            )}
        </motion.div>
    );
}