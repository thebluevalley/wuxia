import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS, WORLD_ARCHIVE } from "@/app/lib/constants";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    // ⚠️ 任务类型判断
    const isMainQuest = context.questCategory === 'main';
    const isSideTask = context.questCategory === 'side' || context.questCategory === 'auto';
    const taskTarget = context.taskObjective || "生存"; 

    // 环境氛围：如果是做支线/自动任务，忽略环境，专注动作
    const envFlavor = isSideTask ? "专注手头工作，无视环境" : FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];
    
    let styleInstruction = "";
    if (context.isDanger) {
        styleInstruction = "【危急】：极短句。只有动作。心跳感。";
    } else if (isSideTask) {
        // ⚠️ 核心：支线任务屏蔽主线剧情
        styleInstruction = "【物理动作模式】：主线剧情已暂停。禁止提及回忆、未来或世界观。只描写执行【" + taskTarget + "】的具体物理动作。";
    } else if (isMainQuest) {
        styleInstruction = "【主线剧情】：第一人称日记。可以包含心理活动、回忆和对未来的思考。";
    } else {
        styleInstruction = "【生存日记】：记录当下的状态。";
    }

    const baseInstruction = `
      你是一个荒野求生文字游戏引擎。
      语言：简体中文。
      风格：${styleInstruction}
      字数限制：40字以内。
      
      背景：
      - 地点：${context.location}。
      - 氛围：${envFlavor}。
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `写第一篇日记。我醒了。浑身疼。这是哪？(100字左右)`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        事件：开始任务【${context.questTitle}】。
        指令：${isSideTask ? "写一句准备工具的动作。" : "写下决心和出发前的心理。"}
        `;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        当前专注：正在进行【${taskTarget}】。
        ${isSideTask ? 
            `指令：写一个**具体的物理动作**。例如"弯腰捡起..."、"用力拉扯..."。禁止写"我正在做任务"。` : 
            `指令：描写路途中的发现、心理变化或环境细节。`
        }
        `;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        事件：遭遇阻碍！
        指令：极短的动作描写！例如工具断了、脚滑了、被虫子咬了。`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        事件：任务【${context.questTitle}】完成。
        指令：${isSideTask ? "描写看着劳动成果的满足感。" : "描写这对生存意味着什么。"}
        `;
        break;
      
      case 'expedition_start':
        prompt = `${baseInstruction} 带上装备，踏入【${context.location}】。`;
        break;
      
      case 'expedition_event':
        prompt = `${baseInstruction} 
        事件：在【${context.location}】探险中。
        指令：描写一个惊险的片段或发现。比如：发现旧时代的遗物、听到奇怪的嘶吼。
        `;
        break;
      
      case 'expedition_end':
        prompt = `${baseInstruction} 探险结束。满载而归。`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        状态：没有任务，正在休息。
        指令：写一个放松的瞬间。比如：看着海浪发呆、在沙滩上画画、打盹、清理指甲。
        `;
        break;

      case 'recruit_companion':
        prompt = `${baseInstruction} 遇到幸存者。一句话外貌描写。`;
        break;
      case 'god_action':
        prompt = `${baseInstruction} 突发意外。运气好或坏。`;
        break;
      case 'generate_rumor':
        prompt = `写一句求生涂鸦（如“北方有水”）。15字以内。`;
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
      temperature: 0.7, 
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