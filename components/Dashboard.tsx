'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, Sun } from 'lucide-react';

interface Suggestion {
    type: string;
    name: string;
    duration_min?: number;
    instructions?: string;
    task?: string;
    priority?: string;
}

interface DashboardProps {
    stressScore: number;
    suggestions: Suggestion[];
    summary: string;
}

export function Dashboard({ stressScore, suggestions, summary }: DashboardProps) {
    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Bonjour, User 👋</h1>
                <p className="text-slate-600">Voici votre bilan bien-être du jour.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stress Score Card */}
                <Card className="bg-white shadow-lg border-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Niveau de Stress</CardTitle>
                        <Activity className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{stressScore}/10</div>
                        <p className="text-xs text-slate-500 mt-1">
                            {stressScore < 4 ? "Niveau sain" : stressScore < 7 ? "Modéré" : "Élevé"}
                        </p>
                    </CardContent>
                </Card>

                {/* Summary Card */}
                <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg border-none">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Brain className="h-5 w-5" /> Résumé du jour
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-indigo-100 leading-relaxed">{summary || "En attente de votre journal..."}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Suggestions Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Sun className="h-5 w-5 text-amber-500" /> Suggestions pour vous
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.map((s, i) => (
                        <Card key={i} className="bg-white border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold uppercase text-indigo-500 tracking-wider">{s.type}</span>
                                    {s.duration_min && <span className="text-xs text-slate-400">{s.duration_min} min</span>}
                                </div>
                                <h3 className="font-semibold text-slate-800 mb-1">{s.name || s.task}</h3>
                                <p className="text-sm text-slate-600">{s.instructions || `Priorité: ${s.priority}`}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
