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

    // ⚠️ 极简主义模式
    const isDanger = context.isDanger;
    let styleInstruction = "【极简】：短句。像推特。";
    let maxTokens = 150;

    if (isDanger) {
        styleInstruction = "【危急】：极短！急促！只有动作。";
        maxTokens = 100;
    }

    const baseInstruction = `
      你是一个荒野求生游戏的文字引擎。
      语言：简体中文。
      风格：${styleInstruction}
      限制：不要超过 50 个字。
      
      背景：
      - 状态：${context.hp < 30 ? "重伤" : "健康"}。
      - 地点：${context.location}。
      - 氛围：${envFlavor}。
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `写第一篇日记。我醒了。疼。这是哪？(100字左右)`;
        break;
      case 'quest_start':
        prompt = `${baseInstruction} 决定去 "${context.questScript?.title}"。一句话记录出发前的准备。`;
        break;
      case 'quest_journey':
        prompt = `${baseInstruction} 赶路中。${isDanger ? "听到异响。心跳加速。" : "记录路上的一个细节。"}`;
        break;
      case 'quest_climax':
        prompt = `${baseInstruction} 遭遇【${context.questScript?.antagonist}】！战斗！极短！`;
        break;
      case 'quest_end':
        prompt = `${baseInstruction} 活下来了。目标达成。累。`;
        break;
      case 'idle_event':
        prompt = `${baseInstruction} 原地休整。写一个极小的生存动作（磨刀、喝水）。`;
        break;
      case 'recruit_companion':
        prompt = `${baseInstruction} 遇到幸存者。一句话描述。`;
        break;
      case 'god_action':
        prompt = `${baseInstruction} 意外发生。运气好或坏。`;
        break;
      case 'generate_rumor':
        prompt = `写一句求生信号（如“别去西边”）。15字以内。`;
        break;
      case 'generate_description':
        prompt = `一句话形容主角现在的狼狈模样。30字以内。`;
        break;
      case 'generate_equip_desc':
        prompt = `一句话形容身上的装备。20字以内。`;
        break;
      default:
        prompt = `${baseInstruction} 记录这一刻。`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.8, 
      max_tokens: maxTokens, 
    });

    let text = completion.choices[0]?.message?.content || "";
    text = text.replace(/^(Task:|Context:|Response:|Here is|Scene:|Day 1|日记|【.*?】).*/gi, '').trim();
    text = text.replace(/^["']|["']$/g, ''); 

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}