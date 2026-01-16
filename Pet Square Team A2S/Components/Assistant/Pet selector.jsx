import React from "react";
import { motion } from "framer-motion";
import { PawPrint, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const speciesEmojis = {
    dog: '🐕',
    cat: '🐱',
    bird: '🐦',
    rabbit: '🐰',
    fish: '🐠',
    hamster: '🐹',
    reptile: '🦎',
    other: '🐾'
};

export default function PetSelector({ pets, selectedPet, onSelectPet }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="rounded-full border-2 border-emerald-200 hover:border-emerald-400 transition-colors"
                >
                    <PawPrint className="w-4 h-4 mr-2" />
                    {selectedPet ? (
                        <span className="flex items-center gap-2">
                            <span>{speciesEmojis[selectedPet.species]}</span>
                            <span>{selectedPet.name}</span>
                        </span>
                    ) : (
                        'Select a pet'
                    )}
                    <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => onSelectPet(null)}>
                    <PawPrint className="w-4 h-4 mr-2" />
                    General Pet Care
                </DropdownMenuItem>
                {pets.map((pet) => (
                    <DropdownMenuItem
                        key={pet.id}
                        onClick={() => onSelectPet(pet)}
                        className="cursor-pointer"
                    >
                        <span className="mr-2">{speciesEmojis[pet.species]}</span>
                        <span className="font-medium">{pet.name}</span>
                        {pet.breed && (
                            <span className="text-xs text-gray-500 ml-2">({pet.breed})</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}