'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Mic, Send, Loader2 } from 'lucide-react';

interface JournalEntryProps {
    onSubmit: (text: string, stress: number) => Promise<void>;
    isAnalyzing: boolean;
}

export function JournalEntry({ onSubmit, isAnalyzing }: JournalEntryProps) {
    const [text, setText] = useState("");
    const [stress, setStress] = useState([5]);
    const [isRecording, setIsRecording] = useState(false);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        await onSubmit(text, stress[0]);
        setText("");
        setStress([5]);
    };

    const toggleRecording = () => {
        // Placeholder for Web Audio API implementation
        setIsRecording(!isRecording);
        if (!isRecording) {
            setTimeout(() => {
                setText((prev) => prev + " (Transcription de l'audio...)");
                setIsRecording(false);
            }, 2000);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader>
                <CardTitle>Comment vous sentez-vous aujourd'hui ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="journal">Exprimez-vous librement</Label>
                    <div className="relative">
                        <Textarea
                            id="journal"
                            placeholder="Racontez votre journée, vos pensées..."
                            className="min-h-[150px] pr-12 resize-none"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <Button
                            size="icon"
                            variant={isRecording ? "destructive" : "ghost"}
                            className="absolute bottom-2 right-2"
                            onClick={toggleRecording}
                        >
                            <Mic className={`h-5 w-5 ${isRecording ? "animate-pulse" : ""}`} />
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label>Niveau de Stress</Label>
                        <span className="font-bold text-lg text-indigo-600">{stress[0]}/10</span>
                    </div>
                    <Slider
                        value={stress}
                        onValueChange={setStress}
                        max={10}
                        step={1}
                        className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Zen</span>
                        <span>Modéré</span>
                        <span>Intense</span>
                    </div>
                </div>

                <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleSubmit}
                    disabled={isAnalyzing || !text.trim()}
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyse en cours...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" /> Analyser mes émotions
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
