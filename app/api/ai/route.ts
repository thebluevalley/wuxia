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

    // ⚠️ 核心：动态节奏控制 (Pacing Control)
    const isDanger = context.isDanger;
    // 20% 概率触发长文（深度观察），80% 是短文（日记碎片）
    const isLongMoment = Math.random() < 0.2; 

    let lengthLimit = "30-50字以内";
    let styleInstruction = "【碎片日记】：极简。像推特一样短。记录一个瞬间。";

    if (isDanger) {
        lengthLimit = "20字以内";
        styleInstruction = "【危急时刻】：极短！急促！心跳感！只有动作和本能。";
    } else if (['start_game', 'quest_start', 'quest_end'].includes(eventType) || isLongMoment) {
        lengthLimit = "80-120字"; 
        styleInstruction = "【深度记录】：稍微详细的观察。描写环境的细节、内心的波动或身体的具体感受。";
    }

    const baseInstruction = `
      你是一个求生游戏的文字引擎。
      语言：简体中文。
      
      【绝对指令】：
      1. 字数限制：**${lengthLimit}**。
      2. 风格：${styleInstruction}
      3. 禁止废话。禁止翻译腔。用词粗糙、真实。
      
      当前状态：
      - 生命：${context.hp}%。精力：${context.stamina}%。
      - 地点：${context.location}。
      - 氛围：${envFlavor}。
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `
          任务：第一篇日记。
          场景：刚刚醒来。浑身是伤。
          内容：我在哪？发生了什么？必须活下去。
          要求：100字左右。建立悬疑感和生存压力。
        `;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        事件：决定去 "${context.questScript?.title}"。
        指令：记录出发前的心理。检查装备，深呼吸，踏入未知。
        `;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        事件：赶路中。
        指令：${isDanger ? "听到草丛里的动静。手心出汗。" : "记录路上的一个细节。奇怪的脚印？风的声音？"}
        `;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        事件：遭遇【${context.questScript?.antagonist}】！
        指令：战斗！躲避、攻击、受伤！
        要求：极短的短句。节奏极快。
        `;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        事件：活下来了。目标达成。
        指令：记录劫后余生的感觉。累，但值得。
        `;
        break;
        
      case 'idle_event':
        prompt = `${baseInstruction} 
        事件：原地休息/生存琐事。
        指令：写一个具体的生存动作。比如：用石头磨刀、挤干衣服、处理伤口。
        `;
        break;

      case 'recruit_companion':
        prompt = `${baseInstruction} 
        事件：遇到幸存者。
        指令：描述他的狼狈样。眼神是敌意还是恐惧？
        `;
        break;

      case 'god_action':
        prompt = `${baseInstruction} 
        事件：突发状况。
        指令：运气好（捡到东西）或运气差（摔了一跤）。一句话。
        `;
        break;
        
      case 'generate_rumor':
        prompt = `写一句求生信号（如“别去西边”、“水里有毒”）。15字以内。`;
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
      temperature: 0.85, 
      max_tokens: 300, 
    });

    let text = completion.choices[0]?.message?.content || "";
    text = text.replace(/^(Task:|Context:|Response:|Here is|Scene:|Day 1|日记|【.*?】).*/gi, '').trim();
    text = text.replace(/^["']|["']$/g, ''); 
    
    // 二次截断，防止 AI 失控
    const limit = isLongMoment || ['start_game', 'quest_start'].includes(eventType) ? 150 : 60;
    if (text.length > limit) text = text.substring(0, limit) + "...";

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}