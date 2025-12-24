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
    let styleInstruction = "";
    
    if (isDanger) {
        styleInstruction = "【危机】：极短。急促。强调危险。";
    } else {
        styleInstruction = "【生存日记】：碎片化。第一人称。";
    }

    const baseInstruction = `
      你是一个荒野求生文字游戏引擎。
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
        prompt = `${baseInstruction} 刚开始任务：${context.taskInfo}。写一句准备动作。`;
        break;
      case 'quest_journey':
        prompt = `${baseInstruction} 正在进行：${context.taskInfo}。写一个过程细节。`;
        break;
      case 'quest_climax':
        prompt = `${baseInstruction} 遭遇【${context.questScript?.antagonist}】！战斗！极短！`;
        break;
      case 'quest_end':
        prompt = `${baseInstruction} 任务完成。成果。`;
        break;
      case 'idle_event':
        // ⚠️ 允许放松
        prompt = `${baseInstruction} 休息中。写一个放松的瞬间（看海、发呆、睡觉）。或者写一个小的生存动作（磨刀）。`;
        break;
      
      // ⚠️ 探险相关
      case 'expedition_start':
        prompt = `${baseInstruction} 带上所有装备，踏入【${context.location}】。充满了未知的恐惧和期待。`;
        break;
      case 'expedition_event':
        prompt = `${baseInstruction} 在【${context.location}】探险中。发现了一个惊人的旧时代遗迹或遇到了奇怪的生物。`;
        break;
      case 'expedition_end':
        prompt = `${baseInstruction} 探险结束。满载而归，但身心俱疲。`;
        break;

      case 'recruit_companion':
        prompt = `${baseInstruction} 遇到幸存者。一句话外貌。`;
        break;
      case 'god_action':
        prompt = `${baseInstruction} 意外发生。运气好或坏。`;
        break;
      case 'generate_rumor':
        prompt = `写一句求生涂鸦。15字以内。`;
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
      temperature: 0.9, 
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