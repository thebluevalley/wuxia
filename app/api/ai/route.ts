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

    // ⚠️ 关键：根据危险程度调整输出风格
    const isDanger = context.isDanger;
    let styleInstruction = "";
    if (isDanger) {
        styleInstruction = "【紧急状态】：句子必须极其简短、急促。像是一个人在奔跑时喘着气写下的。强调心跳、疼痛、恐惧。禁止长篇大论。";
    } else {
        styleInstruction = "【日记风格】：第一人称沉浸式写作。记录身体的感受（饥饿、寒冷）、对周围环境的细腻观察。";
    }

    const baseInstruction = `
      你是一个荒野求生文字游戏的 AI 叙事者。
      语言：简体中文。
      视角：【第一人称】 ("我")。
      ${styleInstruction}
      
      背景：
      - 主角状态：${context.hp < 30 ? "重伤流血" : "健康"}，${context.stamina < 30 ? "极度饥饿" : "精力充沛"}。
      - 地点：${context.location}。
      - 环境氛围：${envFlavor}。
      
      规则：
      1. 严禁出现英文。
      2. 像写日记一样真实。不要上帝视角。
      3. 如果是战斗，描写动作的凶险。如果是闲逛，描写生存的艰难。
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `
          任务：写下【第一篇日记】。
          场景：我刚刚在 ${context.location} 醒来。
          内容：描写我身体的疼痛、嘴里的沙子、迷茫感。我是谁？这是哪里？我要活下去。
          字数：100-150字。
        `;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        事件：决定去 "${context.questScript?.title}"。
        目标：${context.questScript?.objective}。
        指令：写下我出发前的心理活动。检查装备，深吸一口气，踏入未知。
        `;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        事件：前往目标的路上。
        指令：写一段路途遭遇。也许是发现了野兽的粪便，也许是踩到了尖锐的石头，或者只是单纯的累。
        ${isDanger ? "强调危机感，草丛里好像有动静。" : "描写环境的荒凉。"}
        `;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        事件：遭遇强敌【${context.questScript?.antagonist}】。
        指令：战斗爆发！描写肾上腺素飙升的感觉。躲避、攻击、受伤的痛感。
        要求：极短的句子。节奏极快。
        `;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        事件：活下来了。任务完成。
        指令：描写劫后余生的虚脱感。虽然完成了目标，但身体已经透支。
        `;
        break;
        
      case 'idle_event':
        prompt = `${baseInstruction} 
        事件：在 ${context.location} 休息/生存。
        指令：写一个生存细节。比如挑破脚上的水泡，整理收集来的露水，或者看着天空发呆。
        `;
        break;

      case 'recruit_companion':
        prompt = `${baseInstruction} 
        事件：遇到了一个幸存者。
        指令：描写这个人的惨状。他/她为什么能活到现在？眼神里是疯狂还是希望？
        `;
        break;

      case 'god_action':
        prompt = `${baseInstruction} 
        事件：意外发生。
        指令：也许是好运（捡到食物），也许是厄运（伤口裂开）。
        `;
        break;
        
      case 'generate_rumor':
        prompt = `写一条在幸存者之间流传的传闻（如“北方有军队”、“海里有怪物”）。格式：“【信号】...”。`;
        break;

      default:
        prompt = `${baseInstruction} 记录这一刻的生存状态。`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.9, 
      max_tokens: 800, 
    });

    let text = completion.choices[0]?.message?.content || "";
    text = text.replace(/^(Task:|Context:|Response:|Here is|Scene:|Day 1).*:[\s\n]*/i, '').trim();
    text = text.replace(/^["']|["']$/g, ''); 

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}