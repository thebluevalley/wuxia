import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS, WORLD_ARCHIVE } from "@/app/lib/constants";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "Missing Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    const isDanger = context.isDanger;
    const isMainQuest = context.questCategory === 'main';
    const isSideTask = context.questCategory === 'side' || context.questCategory === 'auto';
    const taskTarget = context.taskObjective || "生存"; 
    
    const strategy = context.strategy || { longTermGoal: "活着", currentFocus: "生存" };
    const seedEvent = context.seedEvent || "";
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");

    let styleInstruction = "";
    if (isDanger) {
        styleInstruction = "【生死时刻】：极度紧迫。肾上腺素飙升。短促有力。";
    } else if (isSideTask) {
        styleInstruction = `【以小见大】：描写具体的物理动作【${taskTarget}】。同时，在潜台词中透露出这个动作是为了实现长期目标【${strategy.longTermGoal}】。`;
    } else {
        styleInstruction = "【生存日记】：充满画面感和文学性的微型小说片段。";
    }

    // ⚠️ 核心升级：弹性字数限制
    const baseInstruction = `
      你是一个硬核荒野求生游戏的叙事引擎。
      语言：简体中文。
      风格：${styleInstruction}
      字数：30-90字 (弹性区间)。
      
      【核心规则】：
      1. **拒绝重复**：绝对不要写以下内容：[${recentLogsText}]。
      2. **拒绝废话**：每一句话都要有实质内容。
      3. **长短结合**：如果是重要发现，可以写长一点（80字左右）；如果是日常琐事，简洁有力即可（30-50字）。不要每次都写小作文。
      4. **逻辑连贯**：主角当前专注于【${strategy.currentFocus}】。
      5. **种子扩写**：如果有事件种子，请基于它进行文学润色。
      
      背景：
      - 地点：${context.location}。
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `任务：写第一篇日记。
        内容：我醒了。感官细节（沙子的粗糙、海水的咸腥、身体的剧痛）。
        目标：${strategy.longTermGoal}。
        要求：100字左右，极具代入感。`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        事件：开始任务【${context.questTitle}】。
        指令：写一句准备动作。比如检查工具。`;
        break;

      case 'quest_journey':
        prompt = `${baseInstruction} 
        当前动作：【${taskTarget}】。
        事件种子："${seedEvent}"。
        指令：详细描写这个动作的过程。强调物理反馈（重量、质感、疼痛）。
        示例：如果是"收集木材"，写"拖着湿重的浮木在沙滩上留下深深的痕迹，肩膀被磨得生疼，但为了${strategy.longTermGoal}，我不能停下。"`;
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 
        事件：任务遭遇小意外！
        指令：极短的危机描写！例如工具断裂、毒虫叮咬。`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 
        事件：任务【${context.questTitle}】完成。
        指令：描写看着成果的瞬间。感到离【${strategy.longTermGoal}】又近了一步。`;
        break;
      
      case 'expedition_start':
        prompt = `${baseInstruction} 整理好行囊，为了寻找${strategy.longTermGoal}的线索，毅然踏入【${context.location}】。`;
        break;
      
      case 'expedition_event':
        prompt = `${baseInstruction} 探险中发现了一个惊人的东西。描写它的外观和给主角带来的震撼。`;
        break;
      
      case 'expedition_end':
        prompt = `${baseInstruction} 探险结束。虽然满身泥泞，但收获颇丰。`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 
        状态：短暂休息。
        指令：写一个放松的细节。但在内心深处，依然挂念着【${strategy.longTermGoal}】。`;
        break;

      default:
        prompt = `${baseInstruction} 记录这一刻。`;
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
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}