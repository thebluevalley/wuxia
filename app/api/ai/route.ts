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
        toneInstruction = "Tone: Gritty, Harsh, Survivalist. You are mud under the feet of lords.";
    } else if (stage === "侍从") {
        toneInstruction = "Tone: Cynical, Observant. You see the ugliness behind the knight's shining armor.";
    } else if (stage === "骑士") {
        toneInstruction = "Tone: Honorable but conflicted. Duty vs. Survival. Blood and rust.";
    } else if (stage === "领主" || stage === "王者") {
        toneInstruction = "Tone: Grand, Heavy, Machiavellian. Heavy is the head that wears the crown.";
    }

    // ⚠️ 核心调整：极大幅度增加长文概率和字数要求
    const isLong = Math.random() > 0.1; // 90% 概率写长文 (之前是 30%)
    const lengthInstruction = isLong 
        ? "Length: A rich, detailed paragraph (100-150 Chinese characters). Describe the weather, the smell of the air, the hero's inner thoughts, specific food/drink, and the texture of objects." 
        : "Length: A punchy, atmospheric sentence (30-50 Chinese characters).";

    const baseInstruction = `
      You are George R.R. Martin writing a Grimdark Wuxia/Fantasy novel. 
      Language: SIMPLIFIED CHINESE ONLY.
      ${toneInstruction}
      ${lengthInstruction}
      Lore Context: ${loreSnippet}
      
      CRITICAL RULES:
      1. IMMERSION: Don't just say "he walked". Say "his boots crunched on the frozen mud, breaking the thin crust of ice."
      2. SENSORY DETAILS: Mention specific smells (sour wine, roasting meat, old blood), feelings (numb fingers, aching scar), and sounds.
      3. NO FILLER: Every sentence must build the world or character. Avoid generic phrases.
      4. SHOW, DON'T TELL.
      
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
          Example: "他裹着满是污泥的守夜人黑衣，眼神像临冬城的雪一样冷，手中紧握着那枚无面者的硬币，仿佛那是世上最后的余温。"
          Your Description:
        `;
        break;

      case 'generate_equip_desc':
        const weapon = context.equipment?.weapon?.name || "空手";
        const body = context.equipment?.body?.name || "布衣";
        prompt = `
          Task: Describe appearance based on gear: Weapon [${weapon}], Armor [${body}].
          STRICT RULES: CHINESE ONLY. Max 60 chars. Grimdark style.
          Example: "他身披兰尼斯特的金甲，手持瓦雷利亚钢剑，宛如一头准备噬人的雄狮，盔甲上的狮子纹章在火光下熠熠生辉。"
          Your Description:
        `;
        break;

      case 'start_game':
        prompt = `${baseInstruction} Write an opening scene. The hero stands in ${context.location}. The atmosphere is ominous and heavy. Describe the setting in detail.`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} Event: Start "${context.questScript?.title}". Details: ${context.questScript?.description}. Action: The hero prepares to leave. Describe the weight of the mission and the hero's preparation (checking gear, mounting horse).`;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        Event: A scene on the road. 
        Action: Describe the harsh landscape, a fleeting encounter, or a moment of reflection. Maybe a meal by the fire.
        Mandatory: Use flavor text "${envFlavor}".`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        Event: Wandering in ${context.location}. 
        Action: Describe a detailed interaction with the world (e.g., eavesdropping in a tavern, suffering from the cold, observing a hanging). Reflect tags [${tags}].`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} Event: Climax vs ${context.questScript?.antagonist}. Twist: ${context.questScript?.twist}. Action: A brutal, realistic fight scene. Focus on the physical struggle, the clang of steel, the mud and blood.`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} Event: Conclusion. Objective: ${context.questScript?.objective}. Action: The aftermath. The hero is tired but alive. Describe the physical toll.`;
        break;
        
      case 'recruit_companion':
        prompt = `${baseInstruction} Hero meets a new companion. Describe their appearance, their smell, and the tension in the air.`;
        break;
        
      case 'god_action':
        prompt = `${baseInstruction} A moment of inexplicable fate or a sign from the Old Gods. A rustle in the weirwood leaves.`;
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
      temperature: 0.9, // 保持高随机性，增加词汇丰富度
      max_tokens: 800,  // ⚠️ 核心调整：增加 Token 上限，允许长文
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