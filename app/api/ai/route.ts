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

    // 基础人设
    const baseInstruction = `
      你是一位精通古龙风格的武侠小说旁白。
      请生成一段**极简短**的游戏日志。
      要求：
      1. 字数严格控制在 **35字以内**。
      2. 风格：冷峻、留白、画面感强，或带黑色幽默。
      3. 用“他”代替主角名字，不要出现“少侠”。
      4. 绝对不要写“接下来的故事”、“未完待续”。
    `;

    let prompt = "";
    if (eventType === 'god_action') {
      // 区分赐福与天罚
      const isPunish = userAction.includes('天罚');
      prompt = `${baseInstruction}
      情境：主角${context.name}正在江湖游历。
      事件：${isPunish ? '天降惊雷（玩家使用了天罚）' : '天降甘霖（玩家使用了赐福）'}。
      ${isPunish 
        ? '任务：描写他被雷劈后的狼狈，或者被迫加快赶路/练功的搞笑样子。（Godville风格：神用雷电鞭策英雄）' 
        : '任务：描写他伤势痊愈，或者感到一股暖流的温馨瞬间。'}
      `;
    } else if (eventType === 'auto') {
      const isFight = context.state === 'fight';
      prompt = `${baseInstruction}
      情境：主角${context.name}（Lv.${context.level}）在${context.location}。
      状态：${isFight ? '激战中' : '独行中'}。
      ${isFight 
        ? '任务：描写一个精彩绝伦的攻防瞬间。' 
        : '任务：描写环境氛围或内心瞬间的感悟。'}
      `;
    }

    console.log(`🤖 [Groq] 正在请求 Llama 3.3 ...`);

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.8,
      max_tokens: 60,
    });

    const text = completion.choices[0]?.message?.content || "";
    console.log("✅ [Groq] 生成成功:", text);

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("❌ [Groq Error]:", error.message);
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}