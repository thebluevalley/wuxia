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
    
    // 获取具体的任务目标字符串，例如 "钻木取火" 或 "寻找水源"
    const currentAction = context.taskObjective || "生存"; 

    let styleInstruction = "";
    if (isDanger) {
        styleInstruction = "【危急状态】：极短句。动词为主。强调紧迫感。";
    } else {
        styleInstruction = "【沉浸动作】：第一人称日记。专注于描写“我”正在做的具体动作细节。";
    }

    const baseInstruction = `
      你是一个荒野求生文字游戏引擎。
      语言：简体中文。
      风格：${styleInstruction}
      字数限制：50字以内。
      
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
        prompt = `${baseInstruction} 
        事件：决定开始任务【${context.questTitle}】。
        指令：写一句准备工作的描述。例如检查工具、深呼吸、或是观察目标。`;
        break;

      case 'quest_journey':
        // ⚠️ 核心修改：强制绑定任务内容
        prompt = `${baseInstruction} 
        当前专注：正在进行【${currentAction}】。
        指令：写一个**正在执行该动作**的具体细节。
        正确示例（如果任务是找水）："舔舐叶片上的露珠"、"挖开潮湿的泥土"。
        正确示例（如果任务是伐木）："石斧砍在树干上震得虎口发麻"、"收集散落的树枝"。
        **绝对禁止**：写与【${currentAction}】无关的风景描写或发呆。不要写"我在路上"。`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        事件：任务【${context.questTitle}】遭遇阻碍/高潮！
        指令：${context.questScript?.antagonist ? `与【${context.questScript.antagonist}】对抗！` : "最后的冲刺！"}
        要求：极短的动作描写。`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        事件：任务【${context.questTitle}】完成。
        指令：描写成果带来的满足感或身体的疲惫感。`;
        break;
      
      case 'expedition_start':
        prompt = `${baseInstruction} 带上装备，踏入【${context.location}】。充满了未知的恐惧。`;
        break;
      
      case 'expedition_event':
        prompt = `${baseInstruction} 
        事件：在【${context.location}】探险中。
        指令：描写一个惊险的片段或发现。比如：发现旧时代的遗物、听到奇怪的嘶吼、险些跌落深渊。
        `;
        break;
      
      case 'expedition_end':
        prompt = `${baseInstruction} 探险结束。满载而归，活着真好。`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        状态：暂时没有任务，正在休息。
        指令：写一个放松的瞬间。比如：看着海浪发呆、在沙滩上画画、打盹、按摩酸痛的肌肉。
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
      temperature: 0.8, 
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