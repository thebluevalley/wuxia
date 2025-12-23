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
    const tags = context.tags ? context.tags.join("、") : "无";
    
    let toneInstruction = "";
    if (stage === "微尘") {
        toneInstruction = "Tone: Down-to-earth, Vibrant, Humorous.";
    } else if (stage === "棋子") {
        toneInstruction = "Tone: Suspenseful, Intriguing.";
    } else if (stage === "破局者") {
        toneInstruction = "Tone: Determined, Heroic.";
    } else if (stage === "国士" || stage === "传说") {
        toneInstruction = "Tone: Epic, Melancholic.";
    }

    // ⚠️ 核心调整：长短句分布调整 (70% 概率为短句，创造呼吸感)
    const isLong = Math.random() > 0.7; 
    const lengthInstruction = isLong 
        ? "Length: A descriptive paragraph (40-60 words). Paint a scene." 
        : "Length: A single, punchy sentence (5-15 words). A fleeting thought or action.";

    const baseInstruction = `
      You are a Wuxia Storyteller (Jin Yong style). 
      Language: SIMPLIFIED CHINESE ONLY.
      ${toneInstruction}
      ${lengthInstruction}
      Lore Context: ${loreSnippet}
      
      CRITICAL RULES:
      1. COMPLETENESS: Every output must be a COMPLETE thought. No trailing sentences. No "and then...".
      2. INDEPENDENCE: The text must make sense on its own.
      3. SHOW, DON'T TELL: Use sensory details (smell, sound, temperature).
      
      Hero: ${context.name} (${stage}).
      Tags: [${tags}].
      Quest: ${context.questScript?.title || "Wandering"}.
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'generate_description':
        prompt = `
          Task: Write a character portrait based strictly on tags: [${tags}].
          STRICT RULES: CHINESE ONLY. Max 50 chars. Combine tags into a visual image.
          Example: "他斜倚在墙角，腹部的伤口还在渗血，却仍举着酒壶狂饮。"
          Your Description:
        `;
        break;

      case 'generate_equip_desc':
        const weapon = context.equipment?.weapon?.name || "空手";
        const body = context.equipment?.body?.name || "布衣";
        prompt = `
          Task: Describe appearance based on gear: Weapon [${weapon}], Armor [${body}].
          STRICT RULES: CHINESE ONLY. Max 40 chars. Visual & Cool.
          Your Description:
        `;
        break;

      case 'start_game':
        prompt = `${baseInstruction} Write an opening scene. The hero stands in ${context.location}. Atmosphere is key.`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} Event: Start "${context.questScript?.title}". Details: ${context.questScript?.description}. Action: The hero sets off.`;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        Event: A moment on the road. 
        Action: A slice-of-life scene or scenery description. 
        Mandatory: Use flavor text "${envFlavor}".`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        Event: Wandering in ${context.location}. 
        Action: A small interaction (drinking, observing, resting). Reflect tags [${tags}].`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} Event: Climax vs ${context.questScript?.antagonist}. Action: A decisive moment. Focus on the clash of wills.`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} Event: Conclusion. Objective: ${context.questScript?.objective}. Action: The dust settles. How does the hero feel?`;
        break;
        
      case 'recruit_companion':
        prompt = `${baseInstruction} Hero meets a new companion. A shared glance or words.`;
        break;
        
      case 'god_action':
        prompt = `${baseInstruction} A moment of serendipity.`;
        break;
        
      case 'generate_rumor':
        prompt = `Write a rumor about the Jianghu. Format: "【Title】Content". Chinese Only.`;
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
    
    // 清洗：移除可能的英文解释或引号
    if (eventType.includes('generate')) {
        text = text.replace(/^(Based on|The hero|Here is).*:[\s\n]*/i, '');
        text = text.replace(/^["']|["']$/g, ''); 
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}