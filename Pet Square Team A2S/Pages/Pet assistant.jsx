import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, Bot, AlertCircle, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ChatMessage from "../components/assistant/ChatMessage";
import VoiceInput from "../components/assistant/VoiceInput";
import ImageUpload from "../components/assistant/ImageUpload";
import PetSelector from "../components/assistant/PetSelector";

export default function PetAssistant() {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");
    const [selectedPet, setSelectedPet] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [readAloudEnabled, setReadAloudEnabled] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        base44.auth.me().then(setUser).catch(() => {});
    }, []);

    const { data: pets = [] } = useQuery({
        queryKey: ['myPets', user?.email],
        queryFn: () => base44.entities.Pet.filter({ created_by: user?.email }),
        enabled: !!user?.email,
    });

    const { data: chatHistory = [] } = useQuery({
        queryKey: ['chatHistory', user?.email],
        queryFn: () => base44.entities.ChatMessage.filter({ user_email: user?.email }, '-created_date'),
        enabled: !!user?.email,
    });

    const sendMessageMutation = useMutation({
        mutationFn: async ({ message, imageUrl, petContext }) => {
            let prompt = message;
            
            // Build context
            if (petContext) {
                prompt = `User is asking about their pet:
Name: ${petContext.name}
Species: ${petContext.species}
Breed: ${petContext.breed || 'Not specified'}
Age: ${petContext.age || 'Not specified'}
Dietary Preferences: ${petContext.dietary_preferences || 'Not specified'}
Activity Level: ${petContext.activity_level || 'Not specified'}
Health Notes: ${petContext.health_notes || 'None'}

${petContext.quiz_completed && petContext.quiz_results ? `
The user has completed a detailed quiz about this pet. Here are the insights:
${petContext.quiz_results.insights}
` : ''}

User's question: ${message}

Provide helpful, supportive advice. Remember to:
- Be empathetic and understanding
- Use simple, beginner-friendly language
- Structure your response with bullet points when helpful
- Always remind the user that for medical emergencies or specific diagnoses, they should consult a licensed veterinarian
- Never provide prescription dosages or attempt to diagnose conditions`;
            } else {
                prompt = `User is asking a general pet care question: ${message}

Provide helpful, supportive advice about pet care. Remember to:
- Be empathetic and understanding
- Use simple, beginner-friendly language
- Structure your response with bullet points when helpful
- Always remind the user that for medical emergencies or specific diagnoses, they should consult a licensed veterinarian
- Never provide prescription dosages or attempt to diagnose conditions
- Ask which type of pet they have if it would help provide better advice`;
            }

            const llmParams = {
                prompt,
                add_context_from_internet: true
            };

            if (imageUrl) {
                llmParams.file_urls = [imageUrl];
                llmParams.prompt = `The user has uploaded an image of their pet. Please:
1. Identify the type/species and breed (if possible) - mention this is a best-effort identification
2. Comment on what you observe in the image
3. Provide relevant care tips based on what you see

${prompt}`;
            }

            const response = await base44.integrations.Core.InvokeLLM(llmParams);

            // Save to chat history
            return await base44.entities.ChatMessage.create({
                user_email: user.email,
                pet_id: petContext?.id || null,
                message,
                response,
                image_url: imageUrl || null,
                context: petContext || null
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
            setMessage("");
            setUploadedImage(null);
            scrollToBottom();
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() && !uploadedImage) return;

        sendMessageMutation.mutate({
            message: message.trim() || "Please analyze this image",
            imageUrl: uploadedImage,
            petContext: selectedPet
        });
    };

    const handleVoiceTranscript = (transcript) => {
        setMessage(transcript);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Pet Care Assistant
                                </h1>
                                <p className="text-xs text-gray-600">Your AI-powered pet care companion</p>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSettings(!showSettings)}
                        >
                            <Settings className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Settings Panel */}
                    <AnimatePresence>
                        {showSettings && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 pt-4 border-t border-emerald-100"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="read-aloud"
                                            checked={readAloudEnabled}
                                            onCheckedChange={setReadAloudEnabled}
                                        />
                                        <Label htmlFor="read-aloud" className="cursor-pointer">
                                            Read responses aloud automatically
                                        </Label>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pet Selector */}
                    {pets.length > 0 && (
                        <div className="mt-3">
                            <PetSelector
                                pets={pets}
                                selectedPet={selectedPet}
                                onSelectPet={setSelectedPet}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
                {/* Disclaimer */}
                <Card className="mb-6 border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-900">
                                <p className="font-semibold mb-1">Important Notice</p>
                                <p>
                                    This assistant provides general pet care information only. For medical emergencies, 
                                    specific diagnoses, or prescription advice, please consult a licensed veterinarian.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Welcome Message */}
                {chatHistory.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                            <Bot className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Hello! I'm Your Pet Care Assistant 🐾
                        </h2>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            Ask me anything about pet care, health, nutrition, behavior, grooming, or training. 
                            I'm here to help with all types of pets!
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                            {[
                                "What should I feed my puppy?",
                                "How often should I groom my cat?",
                                "My bird seems stressed, what should I do?",
                                "Best exercises for my dog?"
                            ].map((suggestion, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMessage(suggestion)}
                                    className="rounded-full text-xs"
                                >
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Messages */}
                <div className="space-y-4">
                    {chatHistory.map((chat) => (
                        <div key={chat.id} className="space-y-4">
                            <ChatMessage
                                message={chat.message}
                                isUser={true}
                                image={chat.image_url}
                            />
                            <ChatMessage
                                message={chat.response}
                                isUser={false}
                                readAloudEnabled={readAloudEnabled}
                            />
                        </div>
                    ))}
                    {sendMessageMutation.isPending && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-emerald-100">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <ImageUpload
                            onImageUploaded={setUploadedImage}
                            disabled={sendMessageMutation.isPending}
                        />
                        <VoiceInput
                            onTranscript={handleVoiceTranscript}
                            disabled={sendMessageMutation.isPending}
                        />
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask me anything about pet care..."
                            className="resize-none rounded-2xl"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            disabled={(!message.trim() && !uploadedImage) || sendMessageMutation.isPending}
                            className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                            size="icon"
                        >
                            {sendMessageMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}