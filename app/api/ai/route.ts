import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS, WORLD_ARCHIVE } from "@/app/lib/constants";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    const envFlavor = FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];
    // 随机抽取一个典故，增加历史厚重感
    const loreSnippet = WORLD_ARCHIVE[Math.floor(Math.random() * WORLD_ARCHIVE.length)];

    const stage = context.storyStage || "微尘";
    const tags = context.tags ? context.tags.join(", ") : "无";
    
    // 设定基调：生活流与史诗感的结合
    let toneInstruction = "";
    if (stage === "微尘") {
        toneInstruction = "Tone: Down-to-earth, Vibrant, Humorous. Focus on small struggles and joys of common people.";
    } else if (stage === "棋子") {
        toneInstruction = "Tone: Intriguing, Complex. The hero sees the dark web of Jianghu connections.";
    } else if (stage === "破局者") {
        toneInstruction = "Tone: Determined, Heroic. The hero challenges the status quo.";
    } else if (stage === "国士" || stage === "传说") {
        toneInstruction = "Tone: Epic, Melancholic, Grand. The hero bears the fate of the nation.";
    }

    const isLong = Math.random() > 0.6;
    const lengthInstruction = isLong 
        ? "Write a rich paragraph (60 words)." 
        : "Write a witty, short sentence (under 15 words).";

    const baseInstruction = `
      You are a Master Storyteller (Jin Yong style). Write in CHINESE.
      ${toneInstruction}
      Style: Show, Don't Tell. Mix everyday life details with grand historical context.
      Length: ${lengthInstruction}
      Use this Lore Snippet if relevant: "${loreSnippet}" (but don't force it).
      
      Hero: ${context.name} (${stage}).
      Hero Tags: [${tags}].
      Quest: ${context.questScript?.title || "Wandering"}.
      History: ${context.narrativeHistory?.slice(-200) || ""}.
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'generate_description':
        prompt = `Based on tags [${tags}] and stage [${stage}], describe the hero's current vibe. Is he a tired traveler or a shining hero?`;
        break;

      case 'start_game':
        prompt = `${baseInstruction} Write an opening scene. The hero stands in ${context.location}. Describe the bustling life around them.`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        Event: Quest Start "${context.questScript?.title}".
        Details: ${context.questScript?.description}.
        Action: The hero sets off. Keep it lively.`;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        Event: A moment on the road.
        Action: Describe a scene (e.g., sharing food with a stranger, seeing a beautiful sunset, or a sign of the looming war).
        Mandatory: Use flavor text "${envFlavor}".`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        Event: Wandering in ${context.location}.
        Action: A slice-of-life moment (eating, drinking, observing people). Reflect the hero's tags [${tags}].`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        Event: Climax vs ${context.questScript?.antagonist}.
        Twist: ${context.questScript?.twist}.
        Action: A confrontation. Focus on the dialogue or the meaning behind the fight, not just violence.`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        Event: Conclusion.
        Objective: ${context.questScript?.objective}.
        Action: The task is done. How does the hero feel? Relieved? Hungry?`;
        break;
        
      case 'recruit_companion':
        prompt = `${baseInstruction} Hero meets a new companion. They bond over a shared interest (wine, food, justice).`;
        break;
        
      case 'god_action':
        prompt = `${baseInstruction} A moment of serendipity or destiny.`;
        break;
        
      case 'generate_rumor':
        prompt = `Write a rumor about the Jianghu or the War. Format: "【Title】Content". Short, engaging.`;
        break;

      default:
        prompt = `${baseInstruction} Describe a brief moment of the hero's journey.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.9, 
      max_tokens: 300,
    });

    const text = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}