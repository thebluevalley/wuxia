import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    const questInfo = context.questInfo || "游历";
    const petInfo = context.petInfo || "无";
    const skillInfo = context.skillInfo || "乱拳";
    const stage = context.storyStage || "初出茅庐";
    const lore = context.worldLore || "江湖";
    const recentLogs = context.recentLogs ? context.recentLogs.join(" | ") : "无";
    // 获取上一条日志长度
    const lastLen = context.lastLogLen || 0;
    
    // 节奏控制：如果上一条很长(>50)，这次就短(<30)；反之则长。
    const lengthInstruction = lastLen > 50 
      ? "上一段文字很长。**这一段必须简短有力**，30字以内，像古龙的风格，留白，冷峻。" 
      : "上一段文字很短。**这一段可以细腻描写**，50-70字，像金庸的风格，描写环境、心理、招式细节。";

    const baseInstruction = `
      你是一位武侠小说家。为《云游江湖》的主角"${context.name}"撰写实时剧情。
      【设定】阶段:${stage}, 性格:${context.personality}, 所在:${context.location}, 任务:${questInfo}, 历史:${recentLogs}
      【核心要求】
      1. ${lengthInstruction}
      2. 拒绝重复。不要重复上一条历史记录的内容。
      3. 用“他”指代主角。不要显示数值变化（数值由系统添加）。
    `;

    let prompt = "";
    let maxTokens = 120;
    
    if (eventType === 'start_game') {
      prompt = `${baseInstruction} 【任务】开场白。描写身世、天气、初入江湖的心境。字数80-120。`;
      maxTokens = 200;
    }
    else if (eventType === 'resume_game') {
      prompt = `${baseInstruction} 【任务】回归游戏。描写休息后的状态。字数40-60。`;
    }
    else if (eventType === 'quest_update') {
      prompt = `${baseInstruction}
      【任务】任务推进。写具体的行动细节（侦查、对话、潜入）。
      例如"寻找宝藏"：不要说"正在找"，要说"他拨开枯藤，发现石壁上刻着一行模糊的小字..."`;
    }
    else if (eventType === 'generate_rumor') {
      prompt = `${baseInstruction}
      【任务】写一段“江湖传闻”。不要写主角。写江湖大事。
      格式：【标题】：内容。`;
      maxTokens = 150;
    } 
    else if (eventType === 'auto') {
      const isFight = context.state === 'fight' || context.state === 'arena';
      prompt = `${baseInstruction}
      【状态】${isFight ? '激战' : '游历'}。
      ${isFight 
        ? `描写战斗。使用武功【${skillInfo}】。随从【${petInfo}】助攻。` 
        : '描写旅途风景、内心感悟。'}
      `;
    }
    else if (eventType === 'god_action') {
      const isPunish = userAction.includes('天罚');
      prompt = `${baseInstruction} 【事件】天降异象【${userAction}】。${isPunish?'描写狼狈':'描写喜悦'}。`;
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
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}