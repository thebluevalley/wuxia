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

    const stage = context.storyStage || "微尘";
    const tags = context.tags && context.tags.length > 0 ? context.tags.join("、") : "初入江湖";
    
    let toneInstruction = "";
    if (stage === "微尘") {
        toneInstruction = "Tone: Down-to-earth, Vibrant, Humorous. Focus on small struggles.";
    } else if (stage === "棋子") {
        toneInstruction = "Tone: Suspenseful, Intriguing.";
    } else if (stage === "破局者") {
        toneInstruction = "Tone: Determined, Heroic.";
    } else if (stage === "国士" || stage === "传说") {
        toneInstruction = "Tone: Epic, Melancholic.";
    }

    const isLong = Math.random() > 0.6;
    const lengthInstruction = isLong 
        ? "Write a rich paragraph (max 60 words)." 
        : "Write a short sentence (max 15 words).";

    const baseInstruction = `
      You are a Wuxia Novelist (Jin Yong / Gu Long style). 
      Language: SIMPLIFIED CHINESE ONLY.
      ${toneInstruction}
      Lore Context: ${loreSnippet}
      
      Hero: ${context.name} (${stage}).
      Tags: [${tags}].
      Quest: ${context.questScript?.title || "Wandering"}.
      History: ${context.narrativeHistory?.slice(-200) || ""}.
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'generate_description':
        prompt = `
          Task: Write a character portrait based strictly on these visual tags: [${tags}].
          
          Rules:
          1. OUTPUT CHINESE ONLY. No English.
          2. Combine ALL tags into ONE fluid, descriptive sentence.
          3. Show, Don't Tell.
          4. Max 50 characters.
          
          Example: "他斜倚在墙角，腹部的伤口还在渗血，却仍举着酒壶狂饮，那柄生锈的铁剑被随意扔在脚边。"
          
          Your Description:
        `;
        break;

      case 'start_game':
        prompt = `${baseInstruction} Write an opening scene. The hero stands in ${context.location}. Describe the noise and smell of the surroundings.`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        Event: Quest Start "${context.questScript?.title}".
        Details: ${context.questScript?.description}.
        Action: The hero accepts the quest. Describe their demeanor based on tags [${tags}].`;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        Event: A moment on the road.
        Action: A slice-of-life scene. Mandatory: Use flavor text "${envFlavor}".`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        Event: Wandering in ${context.location}.
        Action: Describe a small interaction with the world based on tags [${tags}].`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        Event: Climax vs ${context.questScript?.antagonist}.
        Twist: ${context.questScript?.twist}.
        Action: A tense confrontation. Dialogue or Action.`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        Event: Conclusion.
        Objective: ${context.questScript?.objective}.
        Action: The task is done. How does the hero feel?`;
        break;
        
      case 'recruit_companion':
        prompt = `${baseInstruction} Hero recruits a companion. Describe the connection formed.`;
        break;
        
      case 'god_action':
        prompt = `${baseInstruction} A moment of destiny or luck.`;
        break;
        
      case 'generate_rumor':
        prompt = `Write a rumor about the war or a sect secret. Format: "【Title】Content". Max 25 words. Chinese Only.`;
        break;

      default:
        prompt = `${baseInstruction} Describe a brief moment of the hero's journey.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.8, 
      max_tokens: 300,
    });

    let text = completion.choices[0]?.message?.content || "";
    
    if (eventType === 'generate_description') {
        text = text.replace(/^(Based on|The hero|Here is).*:[\s\n]*/i, '');
        text = text.replace(/^["']|["']$/g, ''); 
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}