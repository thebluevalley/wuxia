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
    
    // 1. 确定叙事节奏 (Pacing)
    // 默认随机，但关键事件强制长文
    let pacing = Math.random() > 0.4 ? 'scene' : 'snapshot'; // 60% 场景(长)，40% 快照(短)
    
    if (['start_game', 'quest_start', 'quest_end', 'quest_climax', 'recruit_companion'].includes(eventType)) {
        pacing = 'scene'; // 关键节点必须详写
    }

    // 2. 动态指令构建
    let lengthInstruction = "";
    let styleInstruction = "";

    if (pacing === 'scene') {
        lengthInstruction = "LENGTH: Write a DETAILED PARAGRAPH (100-160 Chinese characters).";
        styleInstruction = "FOCUS: Atmosphere, sensory details (smell, temperature, texture), inner monologue, and world-building.";
    } else {
        lengthInstruction = "LENGTH: Write 1-2 SHORT, PUNCHY sentences (30-50 Chinese characters).";
        styleInstruction = "FOCUS: A fleeting action, a sudden sound, a brief dialogue fragment, or a sharp observation.";
    }

    // 3. 基础 Prompt
    const baseInstruction = `
      You are George R.R. Martin writing a Grimdark Fantasy novel (Game of Thrones style).
      Language: SIMPLIFIED CHINESE ONLY.
      
      ${lengthInstruction}
      ${styleInstruction}
      
      Context:
      - Hero: ${context.name} (${stage}). Tags: [${tags}].
      - Location: ${context.location}.
      - Lore: ${loreSnippet} (Weave this in subtly if fitting).
      - Flavor: ${envFlavor}.
      
      CRITICAL RULES:
      1. NO FILLER: Every word must carry weight.
      2. REALISM: Mud, blood, rust, cold, hunger. No high fantasy magic sparkles.
      3. COMPLETE: Do not leave sentences unfinished.
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'generate_description':
        prompt = `
          Task: Write a character portrait based on tags: [${tags}].
          Rule: Chinese only. Max 80 chars. 
          Style: Grimdark.
          Example: "他裹着满是污泥的守夜人黑衣，眼神像临冬城的雪一样冷，手中紧握着那枚无面者的硬币。"
          Your Description:
        `;
        break;

      case 'generate_equip_desc':
        const weapon = context.equipment?.weapon?.name || "空手";
        const body = context.equipment?.body?.name || "布衣";
        prompt = `
          Task: Describe appearance based on: Weapon [${weapon}], Armor [${body}].
          Rule: Chinese only. Max 60 chars.
          Example: "身披兰尼斯特金甲，手持巨剑，宛如一头准备噬人的雄狮。"
          Your Description:
        `;
        break;

      case 'start_game':
        prompt = `
          Task: Write the OPENING PARAGRAPH of the story.
          Context: ${context.name} is standing in ${context.location}.
          Requirements: 
          - 150+ Chinese characters.
          - Describe the ominous atmosphere, the signs of war, and the biting cold.
          - Mention a specific detail about the location (e.g. the smell of the crypts, the noise of the market).
        `;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        Event: The hero accepts a mission: "${context.questScript?.title}".
        Details: ${context.questScript?.description}.
        Action: Preparation and departure. The weight of the task ahead.
        `;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        Event: A scene on the road during the journey.
        Scenario: ${pacing === 'scene' ? 'A breakdown of the wagon, a discovery of a corpse, or a conversation by the fire.' : 'A sudden gust of wind, a distant wolf howl, or the pain in the boots.'}
        `;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        Event: Killing time in ${context.location}.
        Scenario: ${pacing === 'scene' ? 'Observing a local lord, witnessing a crime, or reflecting on a past trauma.' : 'Drinking sour wine, sharpening a blade, or watching a raven fly.'}
        `;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        Event: The Climax Battle vs ${context.questScript?.antagonist}.
        Twist: ${context.questScript?.twist}.
        Instruction: Brutal, visceral combat. Focus on the physical struggle, the fear, and the violence.
        `;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        Event: Mission Accomplished.
        Instruction: The aftermath. Is the hero relieved? Or disgusted by what they had to do?
        `;
        break;
        
      case 'recruit_companion':
        prompt = `${baseInstruction} 
        Event: Meeting a new companion. 
        Instruction: Describe them vividly. Why are they dangerous or useful?
        `;
        break;
        
      case 'god_action':
        prompt = `${baseInstruction} 
        Event: A twist of fate (Divine Intervention).
        Instruction: Describe a sudden stroke of luck or misfortune that feels like the work of the Old Gods.
        `;
        break;
        
      case 'generate_rumor':
        prompt = `Write a dark rumor from the Seven Kingdoms. Format: "【Title】Content". Chinese Only. Max 30 words.`;
        break;

      default:
        prompt = `${baseInstruction} Describe a moment in the hero's life.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.85, 
      max_tokens: 1024, 
    });

    let text = completion.choices[0]?.message?.content || "";
    
    // 清洗
    if (eventType.includes('generate')) {
        text = text.replace(/^(Based on|The hero|Here is|Scene:|Chapter 1).*:[\s\n]*/i, '');
        text = text.replace(/^["']|["']$/g, ''); 
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}