'use client';

import React, { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { ChatInterface } from '@/components/ChatInterface';
import { Analytics } from '@/components/Analytics';

const stressTips = [
    {
        icon: "🧘",
        title: "Respiration 4-7-8",
        description: "Inspirez 4s, retenez 7s, expirez 8s. Répétez 4 fois pour calmer le système nerveux.",
        color: "from-blue-500 to-cyan-500"
    },
    {
        icon: "🚶",
        title: "Micro-pause active",
        description: "5 minutes de marche suffisent à réduire le cortisol et clarifier l'esprit.",
        color: "from-green-500 to-emerald-500"
    },
    {
        icon: "📝",
        title: "Journal de décharge",
        description: "Écrivez 3 choses qui vous stressent. Les externaliser réduit leur emprise mentale.",
        color: "from-purple-500 to-pink-500"
    },
    {
        icon: "💧",
        title: "Hydratation",
        description: "La déshydratation amplifie l'anxiété. Buvez un grand verre d'eau maintenant.",
        color: "from-cyan-500 to-blue-500"
    },
    {
        icon: "🎵",
        title: "Musique apaisante",
        description: "60-80 BPM synchronise le cœur et réduit la tension. Essayez le lo-fi ou le classique.",
        color: "from-orange-500 to-red-500"
    },
    {
        icon: "🌿",
        title: "Ancrage 5-4-3-2-1",
        description: "5 choses à voir, 4 à toucher, 3 à entendre, 2 à sentir, 1 à goûter. Recentrage immédiat.",
        color: "from-teal-500 to-green-500"
    }
];

export default function Home() {
    const [analysis, setAnalysis] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [liveEmotions, setLiveEmotions] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleEmotionUpdate = (data: any) => {
        setLiveEmotions(prev => [...prev, data]);
    };

    const handleAnalyze = async (text: string) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    date: new Date().toISOString().split('T')[0],
                    stressLevel: 5
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setAnalysis(data);
                setHistory(prev => [...prev, data]);
            } else {
                console.error("Analysis failed:", data.error);
            }
        } catch (error) {
            console.error("Error submitting entry:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const displayData = liveEmotions.length > 0 ? liveEmotions : (history.length > 0 ? history : [
        { date: 'Start', emotions: { joie: 5, anxiété: 5, motivation: 5 }, stress_score: 5 },
    ]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Header */}
            <header className="py-6 px-4 border-b border-white/50 bg-white/30 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-white text-xl">🧠</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                MindSpace
                            </h1>
                            <p className="text-xs text-slate-500">Votre psychologue IA</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            ● En ligne
                        </span>
                    </div>
                </div>
            </header>

            {!analysis ? (
                <div className="container mx-auto py-8 px-4 space-y-10">
                    {/* Hero Section */}
                    <div className="text-center space-y-4 py-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-slate-600 shadow-sm">
                            <span>💬</span>
                            <span>Conversation confidentielle et bienveillante</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                            Comment vous sentez-vous <span className="text-indigo-600">aujourd'hui</span> ?
                        </h2>
                        <p className="text-slate-600 max-w-lg mx-auto">
                            Partagez vos pensées en toute liberté. Je suis là pour vous écouter, vous comprendre et vous accompagner.
                        </p>
                    </div>

                    {/* Chat Interface */}
                    <ChatInterface
                        onAnalysisRequest={handleAnalyze}
                        onEmotionUpdate={handleEmotionUpdate}
                    />

                    {/* Loading indicator for analysis */}
                    {isAnalyzing && (
                        <div className="text-center py-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full">
                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-indigo-700">Analyse en cours...</span>
                            </div>
                        </div>
                    )}

                    {/* Analytics Section */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <span>📊</span> Suivi émotionnel en temps réel
                            </h3>
                            <Analytics data={displayData} />
                        </div>
                    </div>

                    {/* Stress Tips Section */}
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                💡 Conseils anti-stress
                            </h3>
                            <p className="text-slate-600">Techniques simples et efficaces pour retrouver votre calme</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stressTips.map((tip, index) => (
                                <div
                                    key={index}
                                    className="group bg-white/70 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                                        <span className="text-2xl">{tip.icon}</span>
                                    </div>
                                    <h4 className="font-semibold text-slate-800 mb-2">{tip.title}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">{tip.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4 pt-4">
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-white/50">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-3">
                                <span className="text-xl">🎯</span>
                            </div>
                            <h4 className="font-semibold text-slate-800">Analyse en temps réel</h4>
                            <p className="text-sm text-slate-600 mt-1">Vos émotions sont analysées à chaque message</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-white/50">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                                <span className="text-xl">💡</span>
                            </div>
                            <h4 className="font-semibold text-slate-800">Conseils personnalisés</h4>
                            <p className="text-sm text-slate-600 mt-1">Des micro-actions adaptées à votre état</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-white/50">
                            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center mb-3">
                                <span className="text-xl">🔒</span>
                            </div>
                            <h4 className="font-semibold text-slate-800">100% confidentiel</h4>
                            <p className="text-sm text-slate-600 mt-1">Vos données restent privées</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container mx-auto px-4 py-8">
                    <Dashboard
                        stressScore={analysis.stress_score}
                        suggestions={analysis.suggestions}
                        summary={analysis.summary}
                    />
                    <div className="max-w-4xl mx-auto mt-8">
                        <button
                            onClick={() => setAnalysis(null)}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-4"
                        >
                            <span>←</span> Retour à la discussion
                        </button>
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">📈 Historique émotionnel</h3>
                            <Analytics data={[...displayData, analysis]} />
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="py-6 px-4 border-t border-white/50 bg-white/20 mt-8">
                <div className="container mx-auto text-center text-sm text-slate-500">
                    <p>MindSpace ne remplace pas un professionnel de santé mentale.</p>
                    <p className="mt-1">En cas d'urgence, contactez le <strong>3114</strong> (numéro national de prévention du suicide).</p>
                </div>
            </footer>
        </main>
    );
}
