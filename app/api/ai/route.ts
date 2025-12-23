import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    // 提取上下文
    const questInfo = context.questInfo || "游历";
    const companionInfo = context.companionInfo || "独行"; 
    const skillInfo = context.skillInfo || "乱拳";
    const stage = context.storyStage || "初出茅庐";
    const recentLogs = context.recentLogs ? context.recentLogs.join(" | ") : "无";
    const lastLen = context.lastLogLen || 0;
    
    // 节奏控制
    const lengthInstruction = lastLen > 50 
      ? "上一段很长，这段**简短有力**，30字以内，古龙风格。" 
      : "上一段很短，这段**细腻描写**，50-70字，金庸风格。";

    // 基础指令
    const baseInstruction = `
      你是一位武侠小说家。为《云游江湖》主角"${context.name}"写剧情。
      【设定】
      - 境界:${stage}, 性格:${context.personality}
      - 伙伴:${companionInfo}
      - 当前任务:${questInfo}
      - 历史记录:${recentLogs} (不要重复历史内容)
      【要求】
      1. ${lengthInstruction}
      2. 拒绝流水账，写出画面感。
      3. 用“他”指代主角。
      4. 只输出剧情文本，不要带任何解释。
    `;

    let prompt = "";
    let maxTokens = 150;
    
    // ⚠️ 核心修复：完善所有事件类型的 Prompt 构建
    switch (eventType) {
      case 'start_game':
        prompt = `${baseInstruction} 【任务】开场白。描写身世、天气、初入江湖的心境。字数80-120。`;
        maxTokens = 200;
        break;
        
      case 'resume_game':
        prompt = `${baseInstruction} 【任务】回归游戏。描写休息后的状态，准备继续旅程。字数40-60。`;
        break;
        
      case 'recruit_companion':
        // ⚠️ 修复点：专门处理招募事件
        prompt = `${baseInstruction} 
        【事件】主角刚刚在酒馆豪掷千金，招募了新伙伴。
        【任务】描写两人初次见面的互动，或者伙伴的一句开场白（体现其性格）。
        不要重复系统日志里的“豪掷多少文”等数字信息，侧重描写神态和语言。`;
        break;
        
      case 'quest_update':
        prompt = `${baseInstruction}
        【任务】任务推进。写具体的行动细节。
        如果【有伙伴】，必须描写伙伴是如何帮忙（或捣乱/吐槽）的，体现伙伴的存在感。`;
        break;
        
      case 'generate_rumor':
        prompt = `${baseInstruction} 【任务】写一段“江湖传闻”。格式：【标题】：内容。内容要虚无缥缈，关于宝藏、神兵或绝世高手。`;
        maxTokens = 100;
        break;
        
      case 'god_action':
        const isPunish = userAction && userAction.includes('天罚');
        prompt = `${baseInstruction} 【事件】天降异象。
        ${isPunish ? '主角遭遇天罚（雷劈、跌倒等），狼狈不堪。' : '主角获得赐福（金光、顿悟等），精神焕发。'}
        描写这个瞬间的画面。`;
        break;
        
      case 'auto':
      default:
        // 默认为自动游历/战斗
        const isFight = context.state === 'fight' || context.state === 'arena';
        prompt = `${baseInstruction}
        【状态】${isFight ? '激战中' : '游历中'}。
        ${isFight 
          ? `描写战斗场面。使用武功【${skillInfo}】。如果有伙伴，描写伙伴如何助攻？` 
          : '描写旅途风景、内心感悟。如果有伙伴，描写两人的对话或互动。'}
        `;
        break;
    }

    // 双重保险：如果 Prompt 依然为空（理论上不可能），给一个兜底
    if (!prompt) {
      prompt = `${baseInstruction} 写一段主角正在江湖游历的简短描写。`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 1.0, 
      max_tokens: maxTokens,
    });

    const text = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}