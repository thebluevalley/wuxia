import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS, WORLD_ARCHIVE } from "@/app/lib/constants";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  
  // ⚠️ 明确返回 500 错误，前端将捕获并显示
  if (!apiKey) {
      return NextResponse.json({ text: null, error: "Missing GROQ_API_KEY" }, { status: 500 });
  }

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    // ... (Prompt 保持上一版的文学风格，无需改动) ...
    const isDanger = context.isDanger;
    const isMainQuest = context.questCategory === 'main';
    const isSideTask = context.questCategory === 'side' || context.questCategory === 'auto';
    const taskTarget = context.taskObjective || "生存"; 
    const seedEvent = context.seedEvent || "";
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");

    let styleInstruction = "";
    if (isDanger) {
        styleInstruction = "【生死时刻】：极度紧迫。描写肾上腺素、疼痛、本能反应。";
    } else if (isSideTask) {
        styleInstruction = "【沉浸式动作】：基于物理现实的描写。强调物品的质感（粗糙、湿滑）、重量、以及身体的反馈（肌肉酸痛、手掌磨破）。";
    } else {
        styleInstruction = "【生存快照】：充满画面感的微型小说片段。";
    }

    const baseInstruction = `
      你是一个硬核荒野求生游戏的叙事引擎。
      语言：简体中文。
      风格：${styleInstruction}
      字数：60-90字 (不要太短，要有细节)。
      
      【核心规则】：
      1. **拒绝废话**：不要写"我正在努力"、"这很难"、"希望能活下去"这种虚词。
      2. **拒绝重复**：绝对不要写以下内容或类似的句式：[${recentLogsText}]。
      3. **信息增量**：每一句话都要提供新的环境细节或动作反馈。
      4. **种子扩写**：必须基于给定的【事件种子】进行润色和扩写，使其更具文学性。
      
      背景：
      - 地点：${context.location}。
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `任务：写第一篇日记。
        内容：我醒了。感官细节（沙子的粗糙、海水的咸腥、身体的剧痛）。迷茫与恐惧。
        要求：100字左右，极具代入感。`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        事件：开始任务【${context.questTitle}】。
        指令：写一段出发前的准备。检查装备的细节，或者观察目标地点的险恶。`;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        当前任务：【${taskTarget}】。
        事件种子："${seedEvent}"。
        指令：**扩写这个种子**。加入感官描写（触觉、听觉、嗅觉）。
        例如：如果种子是"被刺扎了"，扩写为"一根带倒钩的荆棘刺穿了掌心，鲜血瞬间渗了出来，钻心的疼让我倒吸一口凉气。"`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        事件：任务遭遇突发危机！
        指令：具体的危险描写！不仅仅是"遇到危险"，而是"岩石崩塌"、"毒蛇攻击"的具体画面。`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        事件：任务【${context.questTitle}】完成。
        指令：描写成果的物质细节。比如物资的重量、手上的伤痕、或者完成后的虚脱感。`;
        break;
      
      case 'expedition_start':
        prompt = `${baseInstruction} 整理好行囊，最后回头看了一眼营地，然后一头钻进了【${context.location}】的阴影中。`;
        break;
      
      case 'expedition_event':
        prompt = `${baseInstruction} 
        事件：探险中发现了"${seedEvent}"。
        指令：详细描写这个发现。它的外观、气味、以及给主角带来的心理压迫感。`;
        break;
      
      case 'expedition_end':
        prompt = `${baseInstruction} 探险结束。描写满身泥泞、伤痕累累但满载而归的狼狈样。`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        状态：短暂的休息。
        事件种子："${seedEvent}"。
        指令：扩写这个种子。描写在残酷环境下的片刻喘息。`;
        break;

      case 'recruit_companion':
        prompt = `${baseInstruction} 遇到幸存者。描写他衣衫褴褛的细节和警惕的眼神。`;
        break;
      case 'god_action':
        prompt = `${baseInstruction} 突发意外。描写运气好或坏的具体表现。`;
        break;
      case 'generate_rumor':
        prompt = `写一句刻在树干或石头上的求生留言（如"别喝河水"）。15字以内，带惊悚感。`;
        break;
      case 'generate_description':
        prompt = `一句话形容主角现在的狼狈模样。强调脏乱和伤痕。`;
        break;
      case 'generate_equip_desc':
        prompt = `一句话形容身上的装备。强调磨损和简陋。`;
        break;
      default:
        prompt = `${baseInstruction} 记录这一刻的生存状态。`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.9, 
      max_tokens: 200, 
    });

    let text = completion.choices[0]?.message?.content || "";
    text = text.replace(/^(Task:|Context:|Response:|Here is|Scene:|Day 1|日记|【.*?】).*/gi, '').trim();
    text = text.replace(/^["']|["']$/g, ''); 

    return NextResponse.json({ text });

  } catch (error: any) {
    // ⚠️ 捕获所有错误并返回 500，让前端看到具体原因
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}