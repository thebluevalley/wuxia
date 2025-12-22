import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. 检查 Key
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ [API Error] GROQ_API_KEY 未配置");
    return NextResponse.json({ text: null, error: "后端未找到 GROQ_API_KEY" }, { status: 500 });
  }

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    // --- Prompt (保持不变) ---
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
      prompt = `${baseInstruction}
      情境：主角${context.name}遭遇突发事件。
      事件：天降异象，【${userAction}】。
      任务：描写该现象对他的影响。`;
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
      // ⚠️ 修复点：更新为最新的 Llama 3.3 版本
      // 这是目前 Groq 上最智能且免费的模型
      model: "llama-3.3-70b-versatile", 
      temperature: 0.8,
      max_tokens: 60,
    });

    const text = completion.choices[0]?.message?.content || "";
    console.log("✅ [Groq] 生成成功:", text);

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("❌ [Groq Error]:", error.message);
    // 返回具体错误给前端显示
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}