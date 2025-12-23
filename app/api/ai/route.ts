import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS } from "@/app/lib/constants";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    // 随机抽取风味文本
    const envFlavor = FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];
    const actionFlavor = FLAVOR_TEXTS.action[Math.floor(Math.random() * FLAVOR_TEXTS.action.length)];

    const stage = context.storyStage || "初出茅庐";
    // 决定叙事基调
    let tone = "witty and fast-paced";
    if (stage.includes("宗师")) tone = "philosophical and solemn";
    else if (stage.includes("名动")) tone = "heroic and intense";

    const baseInstruction = `
      You are a Dungeon Master for a Wuxia RPG. Write in CHINESE.
      Tone: ${tone}.
      Style: Show, Don't Tell. Use imagery.
      Mandatory: Incorporate the flavor text "${envFlavor}" or "${actionFlavor}" naturally.
      
      Hero: ${context.name} (${stage}).
      Quest: ${context.questScript?.title || "Wandering"} - ${context.questInfo}.
      History: ${context.narrativeHistory.slice(-200)} (Keep continuity).
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `${baseInstruction} Write an opening scene. Describe the hero standing in ${context.location}, looking at the horizon. 80 words.`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        Event: Hero accepts the quest "${context.questScript?.title}".
        Details: ${context.questScript?.description}.
        Action: Describe the hero setting off or investigating the first clue. Establish the atmosphere.`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        Event: The Climax of "${context.questScript?.title}".
        Antagonist: ${context.questScript?.antagonist}.
        Twist: ${context.questScript?.twist}.
        Action: Describe the intense confrontation or the revelation of the twist. High tension!`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        Event: Conclusion of "${context.questScript?.title}".
        Objective: ${context.questScript?.objective}.
        Action: Describe the aftermath. Did the hero succeed? How does the hero feel? Wrap up the story arc.`;
        break;
        
      case 'recruit_companion':
        prompt = `${baseInstruction} Hero meets a new companion. Describe their first interaction based on the companion's gender and personality. No generic greetings.`;
        break;
        
      case 'god_action':
        prompt = `${baseInstruction} A supernatural event occurs (Blessing/Punishment). Describe it with awe.`;
        break;
        
      case 'generate_rumor':
        prompt = `Write a mysterious Wuxia rumor. Format: "【Title】Content". Short and intriguing.`;
        break;

      default:
        // 如果是普通战斗或状态，仅在有具体动作时描写
        prompt = `${baseInstruction} Describe a brief moment of the hero's journey.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.8, // 稍微降低随机性，提高连贯性
      max_tokens: 200,
    });

    const text = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}