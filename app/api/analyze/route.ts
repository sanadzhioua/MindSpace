import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

export async function POST(req: Request) {
  try {
    const { text, date, stressLevel } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const systemPrompt = `
      You are an AI mental health assistant. Analyze the user's journal entry and return a JSON object with the following structure:
      {
        "date": "${date}",
        "emotions": {
          "joie": 0-10,
          "tristesse": 0-10,
          "anxiété": 0-10,
          "colère": 0-10,
          "fatigue": 0-10,
          "motivation": 0-10
        },
        "stress_score": 0-10 (global assessment based on text and user input of ${stressLevel}),
        "suggestions": [
          {
            "type": "micro-exercice",
            "name": "string",
            "duration_min": number,
            "instructions": "string"
          },
          {
            "type": "to-do",
            "task": "string",
            "priority": "Haute" | "Moyenne" | "Basse"
          }
        ],
        "summary": "Short motivating summary",
        "alerts": ["string"] (optional, if high stress)
      }
      
      Constraints:
      - Be benevolent and motivating.
      - Do not give dangerous advice.
      - Adapt to the user's stress level (${stressLevel}/10).
      - Return ONLY valid JSON.
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(completion.choices[0].message.content || "{}");
      return NextResponse.json(analysis);

    } catch (apiError) {
      console.error('OpenAI API Error (using mock fallback):', apiError);

      // Mock Fallback for Demo Mode
      return NextResponse.json({
        date: date || new Date().toISOString().split('T')[0],
        emotions: {
          joie: 5,
          tristesse: 3,
          anxiété: 4,
          colère: 2,
          fatigue: 4,
          motivation: 6
        },
        stress_score: stressLevel || 5,
        suggestions: [
          {
            type: "micro-exercice",
            name: "Respiration 4-7-8",
            duration_min: 3,
            instructions: "Inspirez 4 sec, retenez 7 sec, expirez 8 sec. Répétez 4 fois."
          },
          {
            type: "micro-exercice",
            name: "Pause gratitude",
            duration_min: 2,
            instructions: "Écrivez 3 choses pour lesquelles vous êtes reconnaissant aujourd'hui."
          },
          {
            type: "to-do",
            task: "Faire une courte marche de 10 minutes",
            priority: "Haute"
          }
        ],
        summary: "Vous avez pris le temps de réfléchir à vos émotions, c'est déjà un grand pas ! Continuez à prendre soin de vous. (Mode Démo)"
      });
    }
  } catch (error) {
    console.error('Error analyzing entry:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
