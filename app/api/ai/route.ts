import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS, WORLD_ARCHIVE } from "@/app/lib/constants";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    const isDanger = context.isDanger;
    const isMainQuest = context.questCategory === 'main';
    const isSideTask = context.questCategory === 'side' || context.questCategory === 'auto';
    const taskTarget = context.taskObjective || "生存"; 
    
    // ⚠️ 核心：获取具体的事件种子 (如 "斧头卡住了")
    const seedEvent = context.seedEvent || "";

    let styleInstruction = "";
    let actionInstruction = "";

    if (context.isDanger) {
        styleInstruction = "【危急】：极短句。只有动作。心跳感。";
    } else if (isSideTask) {
        styleInstruction = "【扩写模式】：基于给定的物理微事件进行扩写。";
        // 如果有种子，强制使用种子
        if (seedEvent) {
            actionInstruction = `当前发生的具体事件是："${seedEvent}"。请用第一人称日记体描述这个瞬间。不要直接照抄，要改写得更有代入感。`;
        } else {
            actionInstruction = `描写执行【${taskTarget}】时的一个微小阻碍或发现。`;
        }
    } else if (isMainQuest) {
        styleInstruction = "【剧情日记】：可以包含心理活动。";
    } else {
        styleInstruction = "【生存快照】：记录状态。";
        if (seedEvent) {
            actionInstruction = `休息时发生了这件事："${seedEvent}"。请改写它。`;
        }
    }

    const baseInstruction = `
      你是一个荒野求生文字游戏引擎。
      语言：简体中文。
      风格：${styleInstruction}
      字数限制：40字以内。
      
      【绝对禁令】：
      1. 严禁重复废话。
      2. ${actionInstruction}
      
      背景：
      - 地点：${context.location}。
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `写第一篇日记。我醒了。浑身疼。这是哪？(100字左右)`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 事件：开始任务【${context.questTitle}】。写一句准备动作。`;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction}`; // 依靠上面的 actionInstruction
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 任务遭遇小意外！极短动作描写！`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 任务【${context.questTitle}】完成。描写成果。`;
        break;
      
      case 'expedition_start':
        prompt = `${baseInstruction} 带上装备，踏入【${context.location}】。`;
        break;
      
      case 'expedition_event':
        prompt = `${baseInstruction} 探险中发现了一个惊人的东西。`;
        break;
      
      case 'expedition_end':
        prompt = `${baseInstruction} 探险结束。满载而归。`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction}`; // 依靠上面的 actionInstruction
        break;

      case 'recruit_companion':
        prompt = `${baseInstruction} 遇到幸存者。一句话外貌描写。`;
        break;
      case 'god_action':
        prompt = `${baseInstruction} 突发意外。运气好或坏。`;
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