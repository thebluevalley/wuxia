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
    
    // 基础人设：乔治·R·R·马丁
    const baseInstruction = `
      You are George R.R. Martin writing the "Game of Thrones".
      Language: SIMPLIFIED CHINESE ONLY.
      Style: Grimdark, Realistic, Political, Detailed.
      
      CORE RULES:
      1. LENGTH: Write a RICH, LONG paragraph (120-180 Chinese characters). No short summaries.
      2. DETAILS: Describe the mud on the boots, the rust on the mail, the smell of sour wine, the biting cold.
      3. INTERACTION: Mention specific House names (Stark, Lannister, etc.) and their banners.
      4. ATMOSPHERE: The world is dying. Winter is coming.
      
      Context: Hero ${context.name} (${stage}). Tags: [${tags}].
      Location: ${context.location}.
      Lore: ${loreSnippet}.
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'generate_description':
        prompt = `
          Task: Write a character portrait based strictly on tags: [${tags}].
          STRICT RULES: CHINESE ONLY. Max 80 chars. 
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
          Example: "他身披兰尼斯特的金甲，手持瓦雷利亚钢剑，宛如一头准备噬人的雄狮，盔甲上的红宝石在火光下如血般猩红。"
          Your Description:
        `;
        break;

      case 'start_game':
        // ⚠️ 核心：开局定场诗 - 极长文本 + 强剧情互动
        prompt = `
          Task: Write the OPENING CHAPTER of a new Game of Thrones story.
          
          Situation: The hero ${context.name} is a ${stage} in ${context.location}.
          
          REQUIREMENTS:
          1. LENGTH: 150-200 Chinese characters. Do not stop until the scene is set.
          2. SCENE: Describe the sensory details of ${context.location}. (e.g. Winterfell's hot springs steam, King's Landing's stench).
          3. CAMEO: Include a brief interaction or sighting of a major character (e.g. Ned Stark passing by, Tyrion drinking).
          4. MOOD: Ominous. The hero feels small in the game of thrones.
          
          Start directly with the scene description.
        `;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        Event: Starting Quest "${context.questScript?.title}". 
        Details: ${context.questScript?.description}.
        Instruction: Describe the hero preparing for this task. The weight of the armor, the cold wind, the fear of death.
        `;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        Event: Traveling on the road.
        Instruction: Describe a vivid scene. A hanged man on a tree? A direwolf howling? A Lannister patrol?
        Mandatory: Incorporate "${envFlavor}".
        `;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        Event: Idling in ${context.location}.
        Instruction: Describe a small, realistic moment. Eating a stale piece of bread? Watching a blacksmith forge a sword? Hearing a rumor about the King?
        `;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        Event: Battle vs ${context.questScript?.antagonist}. Twist: ${context.questScript?.twist}.
        Instruction: Write a brutal fight scene. Steel clashes, blood sprays, bones break. No magic, just cold steel.
        `;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        Event: Quest Completed. Objective: ${context.questScript?.objective}.
        Instruction: The adrenaline fades. The hero is exhausted, bleeding, or looking at the gold with cynicism.
        `;
        break;
        
      case 'recruit_companion':
        prompt = `${baseInstruction} 
        Event: Meeting a new companion. 
        Instruction: Describe them in detail. A scarred sellsword? A mysterious red priestess? Why do they join?
        `;
        break;
        
      case 'god_action':
        prompt = `${baseInstruction} 
        Event: Divine Intervention.
        Instruction: A moment of strange luck. Was it the Seven? The Old Gods? Or just chance?
        `;
        break;
        
      case 'generate_rumor':
        prompt = `Write a dark rumor from Westeros (e.g. Joffrey is a bastard, Dragons in the East). Format: "【Title】Content". Chinese Only.`;
        break;

      default:
        prompt = `${baseInstruction} Describe a brief moment in the life of the hero.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.9, 
      max_tokens: 1024, // ⚠️ 允许生成更长的文本
    });

    let text = completion.choices[0]?.message?.content || "";
    
    // 清洗多余的前缀
    if (eventType.includes('generate')) {
        text = text.replace(/^(Based on|The hero|Here is|Scene:|Chapter 1).*:[\s\n]*/i, '');
        text = text.replace(/^["']|["']$/g, ''); 
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}