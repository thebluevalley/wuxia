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

    // ⚠️ 核心调整：根据状态严格控制字数和语气
    const isDanger = context.isDanger;
    let lengthLimit = "50字以内";
    let styleInstruction = "【日记风格】：短句。碎片化。不要写作文。";

    if (isDanger) {
        lengthLimit = "20字以内";
        styleInstruction = "【紧急状态】：极短。急促。只有动作和痛感。像是在奔跑中写下的。";
    } else if (['start_game', 'quest_start', 'quest_end'].includes(eventType)) {
        lengthLimit = "80-120字"; // 关键剧情稍长一点点，但也不要太长
        styleInstruction = "【叙事风格】：冷静、客观、记录关键信息。";
    }

    const baseInstruction = `
      你是一个荒野求生游戏的文字引擎。
      语言：简体中文。
      
      【绝对指令】：
      1. 字数严格限制在 **${lengthLimit}**。
      2. **禁止废话**。不要写"原本...但是..."的复杂从句。
      3. 用词粗粝、真实。多用动词和名词。
      
      当前背景：
      - 状态：${context.hp < 30 ? "濒死" : "存活"}。
      - 地点：${context.location}。
      - 氛围：${envFlavor}。
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `
          任务：写第一篇日记。
          内容：我醒了。疼。这是哪？
          要求：简短有力，交代环境荒凉。100字左右。
        `;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        事件：决定前往 "${context.questScript?.title}"。
        指令：一句话记录出发前的准备。检查装备，深吸一口气。
        `;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        事件：赶路中。
        指令：${isDanger ? "听到异响。心跳加速。有什么东西在靠近。" : "记录一个路途细节。脚泡、荆棘、或者远处的鸟叫。"}
        `;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        事件：遭遇【${context.questScript?.antagonist}】！
        指令：${context.questScript?.twist || "战斗爆发！"}
        要求：极短！如："它扑过来了！闪避！匕首刺入！"
        `;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        事件：活下来了。目标达成。
        指令：一句话总结。累。但是值得。
        `;
        break;
        
      case 'idle_event':
        prompt = `${baseInstruction} 
        事件：原地休整。
        指令：写一个极小的生存动作。比如：挤干衣服的水、挑出指甲里的泥、嚼一根草根。
        `;
        break;

      case 'recruit_companion':
        prompt = `${baseInstruction} 
        事件：遇到幸存者。
        指令：一句话描述他的惨状和眼神。
        `;
        break;

      case 'god_action':
        prompt = `${baseInstruction} 
        事件：意外。
        指令：突然发生的幸事或倒霉事。一句话带过。
        `;
        break;
        
      case 'generate_rumor':
        prompt = `写一句简短的求生信号或涂鸦（如“北方有水”、“别去山洞”）。15字以内。`;
        break;

      case 'generate_description':
        prompt = `用一句话形容主角现在的狼狈模样。30字以内。`;
        break;

      case 'generate_equip_desc':
        prompt = `一句话描述身上的装备。20字以内。`;
        break;

      default:
        prompt = `${baseInstruction} 记录这一刻。`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.8, // 稍微降低随机性，让回答更受控
      max_tokens: 300,  // ⚠️ 物理限制 Token 上限，防止话痨
    });

    let text = completion.choices[0]?.message?.content || "";
    text = text.replace(/^(Task:|Context:|Response:|Here is|Scene:|Day 1|日记|【.*?】).*/gi, '').trim();
    text = text.replace(/^["']|["']$/g, ''); 
    // 再次暴力截断，防止 AI 真的写作文
    if (text.length > 150 && !['start_game'].includes(eventType)) {
        text = text.substring(0, 140) + "...";
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}