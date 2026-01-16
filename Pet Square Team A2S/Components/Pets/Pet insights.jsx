import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function PetInsights({ pet, onRetakeQuiz }) {
    if (!pet.quiz_completed || !pet.quiz_results) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
        >
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-600" />
                            Personalized Care Insights
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRetakeQuiz}
                            className="rounded-full"
                        >
                            <RotateCw className="w-4 h-4 mr-2" />
                            Retake Quiz
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{pet.quiz_results.insights}</ReactMarkdown>
                    </div>
                    {pet.quiz_results.additionalNotes && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-emerald-200">
                            <p className="text-sm font-medium text-gray-700 mb-2">Your Notes:</p>
                            <p className="text-sm text-gray-600">{pet.quiz_results.additionalNotes}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}