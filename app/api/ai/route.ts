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
    // 随机抽取一个典故
    const loreSnippet = WORLD_ARCHIVE[Math.floor(Math.random() * WORLD_ARCHIVE.length)];

    const stage = context.storyStage || "微尘";
    const tags = context.tags ? context.tags.join("、") : "无"; // 用中文顿号连接
    
    // 设定基调
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

    // 通用指令
    const baseInstruction = `
      Role: Wuxia Storyteller (Jin Yong style).
      Language: SIMPLIFIED CHINESE ONLY (简体中文).
      Tone: ${toneInstruction}
      Lore Context: ${loreSnippet}
      
      Hero: ${context.name} (${stage}).
      Tags: [${tags}].
      Quest: ${context.questScript?.title || "Wandering"}.
      History: ${context.narrativeHistory?.slice(-200) || ""}.
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'generate_description':
        // ⚠️ 核心修复：强制中文，禁止废话，控制长度
        prompt = `
          Task: Write a short character profile description based on tags: [${tags}] and stage: [${stage}].
          
          STRICT RULES:
          1. Output ONLY Chinese (简体中文).
          2. NO English explanation. NO "Based on...". NO "Here is the description...".
          3. Max length: 40 Chinese characters.
          4. Style: Atmospheric, descriptive, like a character introduction in a novel.
          
          Example Output:
          "他背着一口锈剑，满身酒气，眼神中却透着一股不寻常的锐利。"
          
          Your Output:
        `;
        break;

      case 'start_game':
        prompt = `${baseInstruction} Write an opening scene. The hero stands in ${context.location}. Describe the atmosphere.`;
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
        Action: Describe a scene (e.g., sharing food, beautiful scenery, or signs of war).
        Mandatory: Use flavor text "${envFlavor}".`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        Event: Wandering in ${context.location}.
        Action: A slice-of-life moment (eating, drinking, observing). Reflect the hero's tags [${tags}].`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        Event: Climax vs ${context.questScript?.antagonist}.
        Twist: ${context.questScript?.twist}.
        Action: A confrontation. Focus on dialogue/meaning, not just violence.`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        Event: Conclusion.
        Objective: ${context.questScript?.objective}.
        Action: The task is done. How does the hero feel?`;
        break;
        
      case 'recruit_companion':
        prompt = `${baseInstruction} Hero meets a new companion. They bond over a shared interest.`;
        break;
        
      case 'god_action':
        prompt = `${baseInstruction} A moment of serendipity or destiny.`;
        break;
        
      case 'generate_rumor':
        prompt = `Write a short rumor about the Jianghu. Format: "【Title】Content". Chinese only. Max 20 words.`;
        break;

      default:
        prompt = `${baseInstruction} Describe a brief moment of the hero's journey.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.7, // 稍微降低随机性，确保遵循格式
      max_tokens: 300,
    });

    let text = completion.choices[0]?.message?.content || "";
    
    // 二次清洗：如果 AI 还是输出了英文解释（虽然概率很低），强制截断或清洗
    if (eventType === 'generate_description') {
        // 移除可能的英文前缀
        text = text.replace(/^(Based on|Here is|The hero).*:[\s\n]*/i, '');
        // 移除引号
        text = text.replace(/^["']|["']$/g, '');
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}