import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ text: null, error: "后端未找到 GROQ_API_KEY" }, { status: 500 });
  }

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    // 提取上下文信息
    const questInfo = context.questInfo || "游历江湖";
    const petInfo = context.petInfo || "孤身一人";
    
    // 基础人设
    const baseInstruction = `
      你是一款放置类武侠游戏《云游江湖》的旁白，风格模仿古龙。
      
      当前主角状态：
      - 任务：${questInfo}
      - 随从：${petInfo}
      - 地点：${context.location}
      - 状态：${context.state}
      
      要求：
      1. 字数严格控制在 **35字以内**。
      2. 风格：冷峻、简练、画面感强，偶尔带点黑色幽默（Godville风格）。
      3. **必须**根据主角当前的[状态]和[随从]来描写。
      4. 用“他”指代主角。
    `;

    let prompt = "";
    
    if (eventType === 'god_action') {
      const isPunish = userAction.includes('天罚');
      prompt = `${baseInstruction}
      事件：神明（玩家）降下了【${userAction}】。
      ${isPunish 
        ? '任务：描写他被雷劈的狼狈样，或者被神力强制鞭策去练功。' 
        : '任务：描写他伤势痊愈，或者感受到一股暖流，甚至有点飘飘然。'}
      `;
    } else if (eventType === 'auto') {
      const isFight = context.state === 'fight' || context.state === 'arena';
      prompt = `${baseInstruction}
      ${isFight 
        ? '任务：描写战斗瞬间，招式名要像武侠小说（如：黑虎掏心、亢龙有悔）。如果有宠物，让宠物也参与攻击。' 
        : '任务：描写赶路、发呆或做任务的过程。如果有宠物，描写他和宠物的互动。'}
      `;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.9, 
      max_tokens: 60,
    });

    const text = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Groq Error:", error);
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}