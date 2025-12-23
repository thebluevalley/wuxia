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
    
    // 设定基调：Grimdark, Political, Realistic
    let toneInstruction = "";
    if (stage === "私生子") {
        toneInstruction = "Tone: Gritty, Harsh, Survivalist. You are nothing in this world.";
    } else if (stage === "侍从") {
        toneInstruction = "Tone: Cynical, Observant. You see the ugliness behind the knight's armor.";
    } else if (stage === "骑士") {
        toneInstruction = "Tone: Honorable but conflicted. Duty vs. Survival.";
    } else if (stage === "领主" || stage === "王者") {
        toneInstruction = "Tone: Machiavellian, Grand, Heavy. Heavy is the head that wears the crown.";
    }

    const isLong = Math.random() > 0.7; 
    const lengthInstruction = isLong 
        ? "Length: A descriptive paragraph (40-60 words). Paint a dark, realistic scene." 
        : "Length: A single, punchy sentence (5-15 words). Cold and sharp.";

    const baseInstruction = `
      You are a Grimdark Fantasy Storyteller (Game of Thrones style). 
      Language: SIMPLIFIED CHINESE ONLY.
      ${toneInstruction}
      ${lengthInstruction}
      Lore Context: ${loreSnippet}
      
      CRITICAL RULES:
      1. STYLE: Realistic, brutal, low-magic. Focus on politics, betrayal, and the cold reality of war.
      2. COMPLETENESS: Every output must be a COMPLETE thought.
      3. SHOW, DON'T TELL: Describe the mud, the blood, the cold, the smell of wine and lies.
      
      Hero: ${context.name} (${stage}).
      Tags: [${tags}].
      Quest: ${context.questScript?.title || "Wandering"}.
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'generate_description':
        prompt = `
          Task: Write a character portrait based strictly on tags: [${tags}].
          STRICT RULES: CHINESE ONLY. Max 50 chars.
          Example: "他穿着染血的黑衣，眼神像临冬城的雪一样冷，手中紧握着那枚无面者的硬币。"
          Your Description:
        `;
        break;

      case 'generate_equip_desc':
        const weapon = context.equipment?.weapon?.name || "空手";
        const body = context.equipment?.body?.name || "布衣";
        prompt = `
          Task: Describe appearance based on gear: Weapon [${weapon}], Armor [${body}].
          STRICT RULES: CHINESE ONLY. Max 40 chars. Grimdark style.
          Example: "他身披兰尼斯特的金甲，手持瓦雷利亚钢剑，宛如一头准备噬人的雄狮。"
          Your Description:
        `;
        break;

      case 'start_game':
        prompt = `${baseInstruction} Write an opening scene. The hero stands in ${context.location}. The atmosphere is ominous.`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} Event: Start "${context.questScript?.title}". Details: ${context.questScript?.description}. Action: The hero accepts the burden.`;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        Event: A moment on the road. 
        Action: Describe a scene of the war-torn land or the beauty of the desolate north.
        Mandatory: Use flavor text "${envFlavor}".`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        Event: Wandering in ${context.location}. 
        Action: A moment of reflection on the chaos of the realm. Reflect tags [${tags}].`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} Event: Climax vs ${context.questScript?.antagonist}. Twist: ${context.questScript?.twist}. Action: A brutal, realistic fight. No flashy magic.`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} Event: Conclusion. Objective: ${context.questScript?.objective}. Action: The cost of victory.`;
        break;
        
      case 'recruit_companion':
        prompt = `${baseInstruction} Hero meets a new companion. A shared ambition or desperation.`;
        break;
        
      case 'god_action':
        prompt = `${baseInstruction} A rare moment of luck or a sign from the Old Gods.`;
        break;
        
      case 'generate_rumor':
        prompt = `Write a rumor about the War of the Five Kings or the White Walkers. Format: "【Title】Content". Chinese Only.`;
        break;

      default:
        prompt = `${baseInstruction} Describe a brief moment.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.85, 
      max_tokens: 300,
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