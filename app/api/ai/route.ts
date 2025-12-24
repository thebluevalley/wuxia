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
    const isMainQuest = context.questCategory === 'main';
    const isSideTask = context.questCategory === 'side' || context.questCategory === 'auto';
    const taskTarget = context.taskObjective || "生存"; 
    
    // ⚠️ 防重核心：获取最近日志
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");

    const envFlavorText = isSideTask ? "专注手头工作，无视环境" : envFlavor;
    
    let styleInstruction = "";
    if (context.isDanger) {
        styleInstruction = "【危急】：极短句。只有动作。心跳感。";
    } else if (isSideTask) {
        styleInstruction = `【物理动作模式】：只描写执行【${taskTarget}】的**具体微观动作**。例如手的触感、工具的声音。`;
    } else if (isMainQuest) {
        styleInstruction = "【剧情日记】：可以包含心理活动和世界观。";
    } else {
        styleInstruction = "【生存快照】：记录当下的状态。";
    }

    const baseInstruction = `
      你是一个荒野求生文字游戏引擎。
      语言：简体中文。
      风格：${styleInstruction}
      字数限制：40字以内。
      
      【绝对禁令】：
      1. **严禁重复**：绝对不要写和以下内容相似的句子：[${recentLogsText}]。
      2. 严禁废话：不要写"我正在努力工作"、"这很难"这种空话。
      3. 必须写新的细节。
      
      背景：
      - 地点：${context.location}。
      - 氛围：${envFlavorText}。
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
        prompt = `${baseInstruction} 
        当前任务：【${taskTarget}】。
        指令：写一个**此前没写过的**具体动作细节。
        比如：如果任务是砍树，这次写"木屑溅到了眼睛里"或者"手掌被树皮磨破了"。
        不要写重复的动作！`;
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
        prompt = `${baseInstruction} 
        事件：在【${context.location}】探险中。
        指令：描写一个惊险的片段或发现。
        `;
        break;
      
      case 'expedition_end':
        prompt = `${baseInstruction} 探险结束。满载而归。`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        状态：正在休息。
        指令：写一个从未写过的放松细节。禁止写哼歌、打盹（如果最近写过）。
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
      temperature: 0.9, // 提高随机性以避免重复
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