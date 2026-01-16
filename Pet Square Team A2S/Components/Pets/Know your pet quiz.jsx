import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const quizQuestions = {
    dog: [
        {
            question: "How active is your dog?",
            options: [
                { value: "low", label: "Prefers lounging and short walks" },
                { value: "moderate", label: "Enjoys daily walks and playtime" },
                { value: "high", label: "Needs lots of exercise and activity" },
                { value: "very_high", label: "Extremely energetic, athletic" }
            ]
        },
        {
            question: "What is your dog's primary diet?",
            options: [
                { value: "dry_kibble", label: "Dry kibble" },
                { value: "wet_food", label: "Wet/canned food" },
                { value: "raw_diet", label: "Raw diet" },
                { value: "mixed", label: "Mixed (combination)" }
            ]
        },
        {
            question: "How does your dog behave around strangers?",
            options: [
                { value: "friendly", label: "Very friendly and welcoming" },
                { value: "cautious", label: "Cautious but warms up" },
                { value: "reserved", label: "Reserved or shy" },
                { value: "protective", label: "Protective or territorial" }
            ]
        }
    ],
    cat: [
        {
            question: "How active is your cat?",
            options: [
                { value: "low", label: "Mostly sleeps and lounges" },
                { value: "moderate", label: "Plays occasionally" },
                { value: "high", label: "Very playful and energetic" }
            ]
        },
        {
            question: "What is your cat's primary diet?",
            options: [
                { value: "dry_food", label: "Dry food only" },
                { value: "wet_food", label: "Wet food only" },
                { value: "mixed", label: "Both dry and wet" }
            ]
        },
        {
            question: "How social is your cat?",
            options: [
                { value: "very_social", label: "Loves attention and cuddles" },
                { value: "moderately_social", label: "Affectionate at times" },
                { value: "independent", label: "Prefers alone time" }
            ]
        }
    ],
    default: [
        {
            question: "How active is your pet?",
            options: [
                { value: "low", label: "Low - minimal activity" },
                { value: "moderate", label: "Moderate - regular activity" },
                { value: "high", label: "High - very active" }
            ]
        },
        {
            question: "What type of environment does your pet prefer?",
            options: [
                { value: "quiet", label: "Quiet and calm" },
                { value: "moderate", label: "Moderate activity level" },
                { value: "lively", label: "Lively and stimulating" }
            ]
        }
    ]
};

export default function KnowYourPetQuiz({ pet, onComplete, onClose }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const questions = quizQuestions[pet.species] || quizQuestions.default;
    const isLastQuestion = currentStep === questions.length;

    const handleAnswer = (value) => {
        setAnswers({ ...answers, [currentStep]: value });
    };

    const handleNext = () => {
        if (currentStep < questions.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        setIsGenerating(true);
        try {
            // Generate personalized insights using AI
            const prompt = `Based on this pet profile, provide comprehensive care insights:
            
Pet Name: ${pet.name}
Species: ${pet.species}
Breed: ${pet.breed || 'Mixed/Unknown'}
Age: ${pet.age || 'Not specified'}
Quiz Answers: ${JSON.stringify(answers)}
Additional Notes: ${additionalNotes}

Provide detailed insights in the following structure (use markdown formatting):

## Breed/Type Characteristics
[Details about the breed or species characteristics]

## Dietary Recommendations
[Specific dietary advice based on their answers]

## Activity & Exercise Needs
[Exercise and activity recommendations]

## Health Considerations
[Common health issues to watch for and preventive care tips]

## Behavioral Traits
[Typical behaviors and how to manage them]

## Environment & Lifestyle Tips
[Best living conditions and lifestyle recommendations]

Make it friendly, supportive, and easy to understand. Use bullet points where helpful.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                add_context_from_internet: true
            });

            const quizResults = {
                answers,
                additionalNotes,
                insights: response,
                completedAt: new Date().toISOString()
            };

            // Update pet with quiz results
            await base44.entities.Pet.update(pet.id, {
                quiz_completed: true,
                quiz_results: quizResults
            });

            onComplete(quizResults);
        } catch (error) {
            console.error('Error generating insights:', error);
            alert('Failed to generate insights. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    Know Your Pet: {pet.name}
                </CardTitle>
                <div className="flex gap-1 mt-4">
                    {questions.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 flex-1 rounded-full transition-all ${
                                index <= currentStep
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                    : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                <AnimatePresence mode="wait">
                    {!isLastQuestion ? (
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-4">
                                    {questions[currentStep].question}
                                </h3>
                                <RadioGroup
                                    value={answers[currentStep]}
                                    onValueChange={handleAnswer}
                                    className="space-y-3"
                                >
                                    {questions[currentStep].options.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                                answers[currentStep] === option.value
                                                    ? 'border-emerald-500 bg-emerald-50'
                                                    : 'border-gray-200 hover:border-emerald-200'
                                            }`}
                                            onClick={() => handleAnswer(option.value)}
                                        >
                                            <RadioGroupItem value={option.value} id={option.value} />
                                            <Label
                                                htmlFor={option.value}
                                                className="flex-1 cursor-pointer"
                                            >
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    disabled={!answers[currentStep]}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500"
                                >
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-2">
                                    Anything else we should know about {pet.name}?
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Share any additional information about health conditions, preferences, or behaviors.
                                </p>
                                <Textarea
                                    value={additionalNotes}
                                    onChange={(e) => setAdditionalNotes(e.target.value)}
                                    placeholder="Optional: Add any special notes about your pet..."
                                    rows={4}
                                    className="w-full"
                                />
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button variant="outline" onClick={handleBack}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleComplete}
                                    disabled={isGenerating}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating Insights...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Complete Quiz
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}