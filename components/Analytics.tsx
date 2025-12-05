'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AnalyticsProps {
    data: any[];
}

export function Analytics({ data }: AnalyticsProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-[300px] flex items-center justify-center text-slate-400">
                Pas assez de données pour afficher les tendances.
            </Card>
        );
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Évolution de vos émotions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 10]} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="emotions.joie" name="Joie" stroke="#fbbf24" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="emotions.anxiété" name="Anxiété" stroke="#f43f5e" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="emotions.motivation" name="Motivation" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="stress_score" name="Stress" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
