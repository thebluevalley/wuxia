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

    const stage = context.storyStage || "私生子";
    const tags = context.tags ? context.tags.join("、") : "无";
    
    // 设定基调
    let toneInstruction = "";
    if (stage === "私生子") {
        toneInstruction = "Tone: Gritty, Harsh, Survivalist. You are mud under the feet of lords.";
    } else if (stage === "侍从") {
        toneInstruction = "Tone: Cynical, Observant. You see the ugliness behind the knight's shining armor.";
    } else if (stage === "骑士") {
        toneInstruction = "Tone: Honorable but conflicted. Duty vs. Survival. Blood and rust.";
    } else if (stage === "领主" || stage === "王者") {
        toneInstruction = "Tone: Grand, Heavy, Machiavellian. Heavy is the head that wears the crown.";
    }

    // 默认长度指令 (针对普通事件)
    const isLong = Math.random() > 0.1; // 90% 概率长文
    const lengthInstruction = isLong 
        ? "Length: A rich, detailed paragraph (100-150 Chinese characters)." 
        : "Length: A punchy, atmospheric sentence (30-50 Chinese characters).";

    const baseInstruction = `
      You are George R.R. Martin writing a Grimdark Wuxia/Fantasy novel. 
      Language: SIMPLIFIED CHINESE ONLY.
      ${toneInstruction}
      ${lengthInstruction}
      Lore Context: ${loreSnippet}
      
      CRITICAL RULES:
      1. IMMERSION: Use sensory details (smell, cold, pain).
      2. SHOW, DON'T TELL.
      
      Hero: ${context.name} (${stage}).
      Tags: [${tags}].
      Quest: ${context.questScript?.title || "Wandering"}.
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'generate_description':
        prompt = `
          Task: Write a character portrait based strictly on tags: [${tags}].
          STRICT RULES: CHINESE ONLY. Max 80 chars. Vivid imagery.
          Example: "他裹着满是污泥的守夜人黑衣，眼神像临冬城的雪一样冷，手中紧握着那枚无面者的硬币。"
          Your Description:
        `;
        break;

      case 'generate_equip_desc':
        const weapon = context.equipment?.weapon?.name || "空手";
        const body = context.equipment?.body?.name || "布衣";
        prompt = `
          Task: Describe appearance based on gear: Weapon [${weapon}], Armor [${body}].
          STRICT RULES: CHINESE ONLY. Max 60 chars. Grimdark style.
          Example: "他身披兰尼斯特的金甲，手持瓦雷利亚钢剑，宛如一头准备噬人的雄狮。"
          Your Description:
        `;
        break;

      case 'start_game':
        // ⚠️ 核心调整：开局特供版 Prompt (写序章)
        prompt = `
          Task: Write the OPENING PROLOGUE of a Grimdark Fantasy novel (Game of Thrones style).
          Language: SIMPLIFIED CHINESE ONLY.
          
          Context: The hero ${context.name} (${stage}) stands in ${context.location}.
          
          Requirements:
          1. LENGTH: LONG and IMMERSIVE (150-200 Chinese characters). 
          2. CONTENT: Establish the harsh setting (The Long Night is coming, the War of Five Kings has left scars). Describe the biting cold, the smell of rot or snow, and the hero's desperate physical state.
          3. ATMOSPHERE: Ominous, heavy, realistic.
          4. ACTION: End with the hero taking a small action (tightening a cloak, checking a rusty blade) to start their journey.
          
          Your Prologue:
        `;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} Event: Start "${context.questScript?.title}". Details: ${context.questScript?.description}. Action: The hero prepares to leave. Describe the weight of the mission.`;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        Event: A scene on the road. 
        Action: Describe the harsh landscape, a fleeting encounter, or a moment of reflection.
        Mandatory: Use flavor text "${envFlavor}".`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        Event: Wandering in ${context.location}. 
        Action: Describe a detailed interaction with the world (e.g., eavesdropping, feeling the cold). Reflect tags [${tags}].`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} Event: Climax vs ${context.questScript?.antagonist}. Twist: ${context.questScript?.twist}. Action: A brutal, realistic fight scene.`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} Event: Conclusion. Objective: ${context.questScript?.objective}. Action: The aftermath. The hero is tired but alive.`;
        break;
        
      case 'recruit_companion':
        prompt = `${baseInstruction} Hero meets a new companion. Describe their appearance and the tension.`;
        break;
        
      case 'god_action':
        prompt = `${baseInstruction} A moment of inexplicable fate or a sign from the Old Gods.`;
        break;
        
      case 'generate_rumor':
        prompt = `Write a dark rumor about the War or the White Walkers. Format: "【Title】Content". Chinese Only.`;
        break;

      default:
        prompt = `${baseInstruction} Describe a brief moment.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.9, 
      max_tokens: 800, 
    });

    let text = completion.choices[0]?.message?.content || "";
    
    if (eventType.includes('generate')) {
        text = text.replace(/^(Based on|The hero|Here is).*:[\s\n]*/i, '');
        text = text.replace(/^["']|["']$/g, ''); 
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}