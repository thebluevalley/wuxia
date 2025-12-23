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
    const loreSnippet = WORLD_ARCHIVE[Math.floor(Math.random() * WORLD_ARCHIVE.length)];

    // 识别任务类型：主线还是支线
    const isMainQuest = context.questScript?.title && context.questScript.title.includes("【主线】");
    const npcName = context.questScript?.npc || "Mysterious Stranger";

    const baseInstruction = `
      You are George R.R. Martin writing "A Song of Ice and Fire".
      Language: SIMPLIFIED CHINESE ONLY.
      Style: Grimdark, Detailed, Sensory (Smell, Touch, Taste), Political.
      
      Context: 
      - Hero: ${context.name}.
      - Location: ${context.location}.
      - Current Saga Chapter: ${context.mainSaga}.
      
      RULES:
      1. REALISM: No high magic sparkles. Use mud, rust, blood, cold, and wine.
      2. LENGTH: ${isMainQuest ? 'VERY LONG (180-250 chars). Detailed scene.' : 'Medium (100-150 chars). Atmospheric.'}
      3. NPC: If a Main Quest, mention the key NPC (${npcName}) explicitly and their demeanor.
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `
          Task: Write the OPENING PARAGRAPH of the hero's saga in ${context.location}.
          Mood: Ominous. The calm before the storm.
          Content: Describe the sensory details of the location. Establish the hero's lowly status in the grand game of thrones.
        `;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        Event: Accepting Quest "${context.questScript?.title}".
        Details: ${context.questScript?.description}.
        Action: The hero meets ${npcName}. Describe the interaction. The NPC gives the order. The hero feels the weight of destiny (or just the weight of gold).
        `;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        Event: Journeying through Westeros.
        Prompt: Describe a scene on the road. A hanged man? A direwolf track? A Lannister patrol?
        Mandatory: Incorporate "${envFlavor}".
        `;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        Event: Climax vs ${context.questScript?.antagonist}. Twist: ${context.questScript?.twist}.
        Instruction: A brutal, gritty combat scene. Describe the impact of steel on steel/flesh.
        `;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        Event: Quest Completion.
        Instruction: The aftermath. The hero returns to ${npcName} (if applicable) or looks at the reward with cynicism.
        `;
        break;
        
      case 'idle_event':
        prompt = `${baseInstruction} 
        Event: Idle in ${context.location}.
        Prompt: A slice-of-life moment in Westeros. Drinking in a tavern? Watching the city watch? shivering in the cold?
        `;
        break;

      default:
        prompt = `${baseInstruction} Describe a brief moment.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.9, 
      max_tokens: 1024, 
    });

    let text = completion.choices[0]?.message?.content || "";
    if (eventType.includes('generate')) {
        text = text.replace(/^(Based on|The hero|Here is|Scene:|Chapter 1).*:[\s\n]*/i, '');
        text = text.replace(/^["']|["']$/g, ''); 
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}