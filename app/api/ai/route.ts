import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS, WORLD_ARCHIVE } from "@/app/lib/constants";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    // ⚠️ 任务模式下，忽略环境氛围，专注于动作
    const isTaskActive = eventType === 'quest_journey' || eventType === 'quest_start' || eventType === 'quest_climax';
    const envFlavor = isTaskActive ? "忽略环境，专注动作" : FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];
    
    // 获取具体的任务动作 (例如 "收集漂流木")
    const taskTarget = context.taskObjective || "生存"; 

    let styleInstruction = "";
    if (context.isDanger) {
        styleInstruction = "【危急状态】：极短句。只有动作。心跳感。";
    } else if (isTaskActive) {
        styleInstruction = "【特写镜头】：只描写手部动作和物品细节。禁止描写风景和心情。";
    } else {
        styleInstruction = "【第一人称日记】：描写环境、身体感受和心理活动。";
    }

    const baseInstruction = `
      你是一个求生游戏的文字引擎。
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
        指令：写一句准备动作。比如拿起工具，或者确认方向。`;
        break;

      case 'quest_journey':
        // ⚠️ 核心修改：特写镜头模式
        prompt = `${baseInstruction} 
        【绝对指令】：
        1. 主角正在全神贯注地做：【${taskTarget}】。
        2. 只写动作细节！比如手的触感、工具的声音、物品的重量。
        3. **严禁**写"我正在做任务"、"风景很美"、"心情很沉重"。
        4. 示例：(任务是砍树) -> "石斧一次次砍在树干上，震得虎口发麻，木屑飞溅。"
        5. 示例：(任务是找水) -> "扒开腐烂的落叶，下面湿润的泥土里渗出了一点水。"
        6. 当前任务是：${taskTarget}。请写一个具体的动作画面。`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        事件：任务遭遇阻碍！
        指令：极短的动作描写！例如工具断了、脚滑了、被虫子咬了。`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        事件：任务【${context.questTitle}】完成。
        指令：描写看着成果的瞬间。`;
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
      temperature: 0.7, // 降低随机性，让 AI 更听话
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