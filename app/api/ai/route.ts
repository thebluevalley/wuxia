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
    
    const isDanger = context.isDanger;
    // 获取当前任务的“动词”和“名词”，用于强制 AI 聚焦
    const taskInfo = context.taskInfo || "探索";
    
    let styleInstruction = "";
    if (isDanger) {
        styleInstruction = "【危机】：极短。急促。只有动作。禁止形容词。";
    } else {
        styleInstruction = `
        【关键指令】：
        1. 必须描写与任务【${taskInfo}】相关的具体动作。
        2. 例如：如果任务是'找水'，写'扒开阔叶植物寻找露水'。
        3. **绝对禁止**写'整理背包'、'检查物资'、'发呆'、'看风景'等通用废话。
        4. 每次生成的动作必须不同。
        `;
    }

    const baseInstruction = `
      你是一个求生游戏的文字引擎。
      语言：简体中文。
      风格：${styleInstruction}
      限制：50字以内。
      
      背景：
      - 状态：${context.hp < 30 ? "重伤" : "健康"}。
      - 地点：${context.location}。
      - 氛围：${envFlavor}。
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `写第一篇日记。我醒了。浑身疼。这是哪？(100字左右)`;
        break;
      case 'quest_start':
        prompt = `${baseInstruction} 刚开始任务：${taskInfo}。写一句具体的准备动作。`;
        break;
      case 'quest_journey':
        prompt = `${baseInstruction} 正在进行任务：${taskInfo}。写一个过程中的细节动作（如弯腰捡起、用力拉扯、仔细观察）。`;
        break;
      case 'quest_climax':
        prompt = `${baseInstruction} 任务高潮！遭遇阻碍！极短的动作描写！`;
        break;
      case 'quest_end':
        prompt = `${baseInstruction} 任务完成。写出成果（如：手里的贝壳沉甸甸的）。`;
        break;
      case 'idle_event':
        prompt = `${baseInstruction} 原地生存动作。写一个极小的细节（如：挑出指甲里的泥）。禁止写整理背包。`;
        break;
      case 'recruit_companion':
        prompt = `${baseInstruction} 遇到幸存者。一句话外貌。`;
        break;
      case 'god_action':
        prompt = `${baseInstruction} 意外发生。运气好或坏。`;
        break;
      case 'generate_rumor':
        prompt = `写一句求生涂鸦（如“别去西边”）。15字以内。`;
        break;
      case 'generate_description':
        prompt = `一句话形容主角现在的狼狈模样。`;
        break;
      case 'generate_equip_desc':
        prompt = `一句话形容身上的装备。`;
        break;
      default:
        prompt = `${baseInstruction} 记录这一刻。`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.9, // 提高随机性
      max_tokens: 150, 
    });

    let text = completion.choices[0]?.message?.content || "";
    text = text.replace(/^(Task:|Context:|Response:|Here is|Scene:|Day 1|日记|【.*?】).*/gi, '').trim();
    text = text.replace(/^["']|["']$/g, ''); 

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}