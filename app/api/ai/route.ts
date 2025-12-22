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
    // ⚠️ 历史记录
    const recentLogs = context.recentLogs ? context.recentLogs.join(" | ") : "无";
    
    // Prompt 设计
    const baseInstruction = `
      你是一位精通金庸古龙风格的武侠小说家。为《云游江湖》的主角"${context.name}"撰写实时剧情。
      
      【设定】
      - 阶段：${stage} (请符合此阶段心境)
      - 性格：${context.personality}
      - 所在：${context.location}
      - 任务：${questInfo}
      - 历史：${recentLogs} (⚠️绝对不要重复这些内容！)

      【写作要求】
      1. 拒绝流水账。写出画面感、环境氛围、心理活动。
      2. 这是一个连续的故事，请根据[历史]推动剧情发展。
      3. 除非是"开场"，否则字数控制在35-60字。
      4. 用“他”指代主角。
    `;

    let prompt = "";
    let maxTokens = 100;
    
    // ⚠️ 1. 开场白 (长文本)
    if (eventType === 'start_game') {
      prompt = `${baseInstruction}
      【任务】游戏刚开始。写一段精彩的开场白。
      【内容】描写他为何踏入江湖（是身负血仇、为了梦想、还是被迫下山？），描写当时的天气和他的心境。
      【要求】字数 80-120 字。文笔要极好，引人入胜。`;
      maxTokens = 200;
    }
    // ⚠️ 2. 任务推进 (具体行动)
    else if (eventType === 'quest_update') {
      prompt = `${baseInstruction}
      【任务】任务进度更新了。请写一段具体的**行动描写**。
      【内容】不要只说“正在做任务”。要写具体的细节。
      例如：如果是"寻找宝藏"，写"他拨开杂草，发现了一个隐蔽的树洞..."
      例如：如果是"讨伐土匪"，写"他屏住呼吸，潜伏在寨门后的阴影里..."
      `;
    }
    // 3. 江湖传闻
    else if (eventType === 'generate_rumor') {
      prompt = `${baseInstruction}
      【任务】写一段“江湖传闻”。不要写主角。写江湖大事（门派被灭、神兵出世）。
      格式：【标题】：内容。`;
      maxTokens = 150;
    } 
    // 4. 普通/战斗
    else if (eventType === 'auto') {
      const isFight = context.state === 'fight' || context.state === 'arena';
      prompt = `${baseInstruction}
      【状态】${isFight ? '激战' : '游历'}。
      ${isFight 
        ? `描写战斗招式。使用武功【${skillInfo}】。随从【${petInfo}】助攻。` 
        : '描写旅途风景、内心感悟、或城镇烟火气。'}
      `;
    }
    // 5. 神力
    else if (eventType === 'god_action') {
      const isPunish = userAction.includes('天罚');
      prompt = `${baseInstruction}
      【事件】天降异象【${userAction}】。
      ${isPunish ? '写他遭遇挫折、被雷劈的狼狈。' : '写他福至心灵、伤势痊愈的喜悦。'}
      `;
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