import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. 调试：先看 Key 到底有没有读到
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error("❌ [API Error] GROQ_API_KEY is missing");
    // 直接把错误返回给前端
    return NextResponse.json({ text: null, error: "错误：服务器端未找到 GROQ_API_KEY。请检查 .env.local 文件。" }, { status: 500 });
  }

  try {
    const { context, eventType, userAction } = await req.json();
    
    // 初始化 Groq
    const groq = new Groq({ apiKey });

    // 简单 Prompt
    const prompt = `你是一个武侠游戏旁白。请用古龙风格，写一句关于${context.location}的简短描写（30字内）。`;

    console.log(`🤖 [Groq] 正在请求...`);

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192",
      temperature: 0.8,
      max_tokens: 60,
    });

    const text = completion.choices[0]?.message?.content || "";
    console.log("✅ [Groq] 成功:", text);

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("❌ [Groq Error]:", error.message);
    // 把具体报错返回给前端
    return NextResponse.json({ text: null, error: `Groq报错: ${error.message}` }, { status: 500 });
  }
}