import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        const systemPrompt = `Tu es un psychologue virtuel interactif, empathique et bienveillant. Tu t'appelles MindSpace.

RÈGLES IMPORTANTES :
- Écoute attentivement CHAQUE MOT de l'utilisateur
- Reformule SPÉCIFIQUEMENT ce qu'il a dit (pas de phrases génériques)
- Pose des questions qui montrent que tu as COMPRIS sa situation unique
- Propose des actions ADAPTÉES à son contexte précis
- Sois chaleureux, jamais jugeant

À chaque message :
1. Analyse les émotions exprimées dans CE message précis
2. Reformule avec empathie ce que l'utilisateur a dit (en reprenant SES mots)
3. Propose 2-3 micro-actions CONCRÈTES et SPÉCIFIQUES à sa situation
4. Pose 1-2 questions ouvertes pour approfondir SON vécu
5. Termine par un résumé motivant PERSONNALISÉ

Format JSON obligatoire :
{
  "reformulation": "Reformulation empathique SPÉCIFIQUE (reprends ses mots)",
  "emotion_detected": "Émotion principale détectée",
  "suggested_actions": ["Action spécifique 1", "Action spécifique 2"],
  "open_questions": ["Question personnalisée basée sur ce qu'il a dit"],
  "motivational_summary": "Message d'encouragement personnalisé",
  "emotions": {
    "joie": 0-10,
    "anxiété": 0-10,
    "motivation": 0-10
  },
  "stress_score": 0-10
}

IMPORTANT : Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.`;

        if (!process.env.GROQ_API_KEY) {
            console.log("No GROQ_API_KEY found, using mock fallback");
            return generateMockResponse(messages);
        }

        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 1024,
            });

            const content = completion.choices[0].message.content || "{}";
            const data = JSON.parse(content);
            return NextResponse.json(data);

        } catch (apiError) {
            console.error("Groq API Error:", apiError);
            return generateMockResponse(messages);
        }
    } catch (error) {
        console.error('Error in chat:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function generateMockResponse(messages: any[]) {
    const rawContent = messages[messages.length - 1]?.content || "";
    // Normalize text: lowercase and remove accents
    const lastUserMessage = rawContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let emotion = "Neutre";
    let joie = 5, anxiete = 5, motivation = 5, stress = 5;
    let reformulation = "";
    let actions: string[] = [];
    let questions: string[] = [];
    let summary = "";

    // ===== SALUTATIONS =====
    if (lastUserMessage.includes("bonjour") || lastUserMessage.includes("salut") || lastUserMessage.includes("hello") || lastUserMessage.includes("coucou") || lastUserMessage.includes("hey")) {
        emotion = "Accueillant";
        joie = 6; anxiete = 3; motivation = 6; stress = 3;
        reformulation = "Bonjour ! Je suis ravi de vous retrouver. Je suis MindSpace, votre espace d'écoute.";
        actions = ["Prenez une position confortable", "Prenez une grande inspiration", "Dites-moi simplement comment vous vous sentez"];
        questions = ["Comment vous sentez-vous en ce moment ?", "Qu'est-ce qui occupe vos pensées aujourd'hui ?"];
        summary = "Je suis là pour vous écouter sans jugement. Prenez votre temps.";
    }
    // ===== IDENTITÉ / LGBTQ+ =====
    else if (lastUserMessage.includes("gay") || lastUserMessage.includes("lesbienne") || lastUserMessage.includes("bi") || lastUserMessage.includes("trans") || lastUserMessage.includes("lgbt") || lastUserMessage.includes("homo") || lastUserMessage.includes("coming out")) {
        emotion = "Identité";
        joie = 5; anxiete = 4; motivation = 6; stress = 4;
        reformulation = "Merci de me faire confiance pour partager cela. Votre identité est une part précieuse de qui vous êtes, et elle mérite d'être accueillie avec respect et bienveillance.";
        actions = [
            "Rappelez-vous que vous avez le droit d'être vous-même",
            "Entourez-vous de personnes qui vous soutiennent inconditionnellement",
            "Prenez un moment pour apprécier votre authenticité"
        ];
        questions = ["Comment vous sentez-vous par rapport à cela aujourd'hui ?", "Avez-vous le soutien dont vous avez besoin autour de vous ?"];
        summary = "Être soi-même est un acte de courage et de liberté. Vous êtes valide exactement tel que vous êtes.";
    }
    // ===== SYMPTÔMES PHYSIQUES (ANXIÉTÉ/SOMATISATION) =====
    else if (lastUserMessage.includes("nausee") || lastUserMessage.includes("ventre") || lastUserMessage.includes("tete") || lastUserMessage.includes("tremble") || lastUserMessage.includes("coeur") || lastUserMessage.includes("palpitation") || lastUserMessage.includes("respir") || lastUserMessage.includes("etouffe")) {
        emotion = "Inconfort physique";
        joie = 2; anxiete = 8; motivation = 3; stress = 8;
        reformulation = "Je comprends que vous ressentiez des symptômes physiques désagréables. C'est souvent la façon dont notre corps exprime un stress ou une émotion intense.";
        actions = [
            "Asseyez-vous et posez les pieds bien à plat au sol",
            "Buvez de l'eau par petites gorgées",
            "Respirez lentement : inspirez par le nez, soufflez doucement par la bouche comme dans une paille"
        ];
        questions = ["Depuis combien de temps ressentez-vous cela ?", "Est-ce lié à une situation stressante récente ?"];
        summary = "Votre corps vous parle. En l'écoutant et en le calmant, vous apaisez aussi votre esprit.";
    }
    // ===== DEUIL / PERTE =====
    else if (lastUserMessage.includes("mort") || lastUserMessage.includes("decede") || (lastUserMessage.includes("perdu") && (lastUserMessage.includes("proche") || lastUserMessage.includes("parent") || lastUserMessage.includes("ami") || lastUserMessage.includes("pere") || lastUserMessage.includes("mere") || lastUserMessage.includes("grand")))) {
        emotion = "Deuil";
        joie = 1; anxiete = 6; motivation = 2; stress = 8;
        reformulation = "Je suis profondément touché par ce que vous partagez. Perdre quelqu'un qu'on aime est une des épreuves les plus difficiles. Votre douleur est légitime.";
        actions = [
            "Autorisez-vous à pleurer, c'est nécessaire",
            "Ne restez pas seul(e) avec votre peine",
            "Écrivez ce que vous ressentez pour cette personne"
        ];
        questions = ["Quel est votre plus beau souvenir avec cette personne ?", "Comment puis-je vous soutenir dans cette épreuve ?"];
        summary = "Le deuil est un chemin unique. Prenez tout le temps dont vous avez besoin.";
    }
    // ===== DÉPRESSION =====
    else if (lastUserMessage.includes("deprim") || lastUserMessage.includes("depression") || lastUserMessage.includes("plus envie") || lastUserMessage.includes("quoi bon") || lastUserMessage.includes("vide") || lastUserMessage.includes("noir") || lastUserMessage.includes("sens")) {
        emotion = "Dépression";
        joie = 1; anxiete = 5; motivation = 1; stress = 7;
        reformulation = "Je sens un grand poids dans vos mots. Ce sentiment de vide ou de lassitude est très difficile à porter seul.";
        actions = [
            "Faites une toute petite action (boire un verre d'eau, ouvrir les volets)",
            "Ne restez pas isolé(e), envoyez un message à un proche",
            "Si c'est trop lourd, appelez le 3114 (écoute 24/7)"
        ];
        questions = ["Depuis quand vous sentez-vous comme ça ?", "Y a-t-il un moment de la journée où ça va un peu mieux ?"];
        summary = "Vous n'êtes pas vos pensées sombres. C'est une tempête, et vous êtes le ciel qui reste derrière.";
    }
    // ===== DISPUTE COUPLE =====
    else if (lastUserMessage.includes("copine") || lastUserMessage.includes("copain") || lastUserMessage.includes("ami") || lastUserMessage.includes("conjoint") || lastUserMessage.includes("mari") || lastUserMessage.includes("femme") || lastUserMessage.includes("couple") || lastUserMessage.includes("relation")) {
        if (lastUserMessage.includes("disput") || lastUserMessage.includes("conflit") || lastUserMessage.includes("engueul") || lastUserMessage.includes("fache") || lastUserMessage.includes("probleme") || lastUserMessage.includes("crise")) {
            emotion = "Conflit relationnel";
            joie = 2; anxiete = 7; motivation = 4; stress = 7;
            reformulation = "Les tensions dans le couple sont éprouvantes. On se sent souvent incompris ou blessé quand on tient à l'autre.";
            actions = [
                "Laissez retomber la pression avant de reparler",
                "Écrivez vos ressentis pour y voir plus clair",
                "Faites quelque chose pour vous changer les idées"
            ];
            questions = ["Qu'est-ce qui vous a le plus touché dans cette situation ?", "Qu'aimeriez-vous pouvoir dire calmement ?"];
            summary = "Les conflits peuvent aussi permettre de mieux se comprendre, une fois l'orage passé.";
        } else if (lastUserMessage.includes("rupture") || lastUserMessage.includes("quitte") || lastUserMessage.includes("separ") || lastUserMessage.includes("fini")) {
            emotion = "Rupture";
            joie = 1; anxiete = 6; motivation = 2; stress = 8;
            reformulation = "Une séparation est un véritable choc émotionnel. C'est normal de se sentir perdu ou d'avoir mal.";
            actions = [
                "Soyez doux avec vous-même aujourd'hui",
                "Coupez les réseaux sociaux si ça vous fait mal",
                "Appelez un(e) ami(e) bienveillant(e)"
            ];
            questions = ["Qu'est-ce qui est le plus difficile pour vous en ce moment ?", "De quoi auriez-vous besoin pour vous apaiser un peu ?"];
            summary = "Cette douleur finira par s'atténuer. Vous méritez d'être aimé(e) et respecté(e).";
        } else {
            emotion = "Relationnel";
            joie = 4; anxiete = 5; motivation = 5; stress = 5;
            reformulation = "Les relations amoureuses occupent beaucoup de place dans nos pensées. C'est un sujet important.";
            actions = [
                "Prenez du recul pour analyser la situation",
                "Identifiez vos besoins dans cette relation",
                "Communiquez avec votre partenaire"
            ];
            questions = ["Comment vous sentez-vous globalement dans cette relation ?", "Qu'est-ce qui est important pour vous ?"];
            summary = "Écoutez votre intuition, elle est souvent de bon conseil.";
        }
    }
    // ===== ANXIÉTÉ / STRESS (Normalisé) =====
    else if (lastUserMessage.includes("stress") || lastUserMessage.includes("anxieux") || lastUserMessage.includes("angoisse") || lastUserMessage.includes("panique") || lastUserMessage.includes("peur") || lastUserMessage.includes("inquiet")) {
        emotion = "Anxiété";
        joie = 3; anxiete = 8; motivation = 4; stress = 8;
        reformulation = "Je perçois beaucoup de tension. Le stress et l'anxiété peuvent être très envahissants, mais ils ne sont pas dangereux.";
        actions = [
            "Technique 4-7-8 : Inspirez 4s, bloquez 7s, soufflez 8s",
            "Regardez autour de vous et nommez 3 objets bleus",
            "Secouez vos mains pour évacuer le surplus d'énergie"
        ];
        questions = ["Qu'est-ce qui a déclenché ce stress ?", "Où ressentez-vous cette tension dans votre corps ?"];
        summary = "C'est une vague. Elle monte, mais elle finit toujours par redescendre. Respirez.";
    }
    // ===== TRISTESSE / SOLITUDE =====
    else if (lastUserMessage.includes("triste") || lastUserMessage.includes("seul") || lastUserMessage.includes("pleur") || lastUserMessage.includes("malheur") || lastUserMessage.includes("mal")) {
        emotion = "Tristesse";
        joie = 2; anxiete = 4; motivation = 3; stress = 6;
        reformulation = "Je sens une grande tristesse. Se sentir seul ou abattu est une émotion lourde, mais vous avez le droit de la ressentir.";
        actions = [
            "Préparez-vous une boisson chaude réconfortante",
            "Enroulez-vous dans un plaid ou quelque chose de doux",
            "Écoutez une musique qui vous apaise ou regardez un film doudou"
        ];
        questions = ["Qu'est-ce qui vous ferait un tout petit peu de bien maintenant ?", "Voulez-vous me raconter ce qui vous rend triste ?"];
        summary = "La tristesse est là pour nous dire qu'on a besoin de réconfort. Soyez votre meilleur ami aujourd'hui.";
    }
    // ===== FATIGUE =====
    else if (lastUserMessage.includes("fatigu") || lastUserMessage.includes("epuis") || lastUserMessage.includes("dormir") || lastUserMessage.includes("creve") || lastUserMessage.includes("hs")) {
        emotion = "Fatigue";
        joie = 3; anxiete = 4; motivation = 2; stress = 6;
        reformulation = "Vous semblez vraiment à bout de forces. Votre corps vous réclame du repos, c'est important de l'écouter.";
        actions = [
            "Fermez les yeux 5 minutes, juste pour déconnecter",
            "Éloignez votre téléphone",
            "Prévoyez de vous coucher tôt ce soir"
        ];
        questions = ["Votre sommeil est-il réparateur en ce moment ?", "Qu'est-ce qui vous prend le plus d'énergie ?"];
        summary = "Le repos n'est pas une perte de temps, c'est une nécessité biologique. Prenez soin de vous.";
    }
    // ===== COLÈRE =====
    else if (lastUserMessage.includes("colere") || lastUserMessage.includes("enerv") || lastUserMessage.includes("frustr") || lastUserMessage.includes("rage") || lastUserMessage.includes("agac") || lastUserMessage.includes("furi")) {
        emotion = "Colère";
        joie = 2; anxiete = 6; motivation = 5; stress = 7;
        reformulation = "Je sens beaucoup d'irritation ou de colère. C'est une émotion légitime qui signale souvent une injustice ou une limite franchie.";
        actions = [
            "Expulsez l'air fort par la bouche plusieurs fois",
            "Gribouillez frénétiquement sur une feuille de papier",
            "Marchez d'un pas rapide pour évacuer l'adrénaline"
        ];
        questions = ["Qu'est-ce qui vous a mis dans cet état ?", "Quelle limite a été dépassée selon vous ?"];
        summary = "La colère est une énergie. Une fois exprimée sainement, elle peut servir à changer les choses.";
    }
    // ===== TRAVAIL =====
    else if (lastUserMessage.includes("travail") || lastUserMessage.includes("boulot") || lastUserMessage.includes("patron") || lastUserMessage.includes("collegue") || lastUserMessage.includes("bureau") || lastUserMessage.includes("job")) {
        emotion = "Professionnel";
        joie = 4; anxiete = 6; motivation = 4; stress = 6;
        reformulation = "Les soucis professionnels semblent vous peser. C'est difficile de déconnecter quand le travail prend le dessus.";
        actions = [
            "Notez ce qui doit être fait pour demain et fermez le carnet",
            "Changez de pièce ou sortez pour marquer la fin de la journée",
            "Faites une activité qui n'a rien à voir avec le travail"
        ];
        questions = ["Qu'est-ce qui est le plus stressant dans votre travail actuellement ?", "Arrivez-vous à faire des pauses ?"];
        summary = "Vous êtes bien plus que votre travail. Votre santé mentale est la priorité.";
    }
    // ===== DÉFAUT (Randomisé) =====
    else {
        const random = Math.floor(Math.random() * 3);
        emotion = "Écoute";
        joie = 5; anxiete = 4; motivation = 5; stress = 4;

        if (random === 0) {
            reformulation = "Je vous écoute attentivement. Parfois, c'est difficile de mettre des mots exacts sur ce qu'on ressent, mais je suis là.";
            actions = ["Prenez juste un moment pour respirer calmement", "Observez comment vous vous sentez dans votre corps", "Soyez bienveillant(e) avec vous-même"];
            questions = ["Si vous deviez décrire votre humeur par une météo, quelle serait-elle ?", "Qu'est-ce qui vous ferait du bien là, tout de suite ?"];
            summary = "L'important est d'être à l'écoute de soi. Vous faites la bonne démarche.";
        } else if (random === 1) {
            reformulation = "Je suis là avec vous. Chaque émotion a le droit d'exister. Prenez le temps de l'accueillir.";
            actions = ["Posez une main sur votre ventre et respirez", "Regardez quelque chose d'apaisant autour de vous", "Détendez vos épaules"];
            questions = ["Qu'est-ce qui occupe le plus votre esprit en ce moment ?", "De quoi avez-vous besoin ?"];
            summary = "Vous n'êtes pas seul(e). Je suis là pour vous accompagner.";
        } else {
            reformulation = "Merci de me parler. C'est courageux de s'ouvrir. Je suis là pour vous soutenir.";
            actions = ["Faites une petite pause dans votre journée", "Buvez un peu d'eau", "Rappelez-vous que ce moment va passer"];
            questions = ["Comment vous sentez-vous physiquement ?", "Y a-t-il quelque chose qui vous préoccupe particulièrement ?"];
            summary = "Prenez les choses une par une. Respirez.";
        }
    }

    return NextResponse.json({
        reformulation,
        emotion_detected: emotion,
        suggested_actions: actions,
        open_questions: questions,
        motivational_summary: summary + " (Mode Démo)",
        emotions: {
            joie,
            anxiété: anxiete,
            motivation
        },
        stress_score: stress
    });
}
