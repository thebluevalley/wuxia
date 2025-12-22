// app/api/ai/route.ts (Groq 版本)
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) return NextResponse.json({ text: null });

  try {
    const { context, eventType, userAction } = await req.json();
    
    // --- Prompt 构建逻辑同上 ---
    const baseInstruction = "...(同上)..."; 
    // ...构建 prompt 变量...
    let prompt = ""; 
    // (此处省略 Prompt 拼接逻辑，请复制上面的 Prompt 部分)
    if (eventType === 'god_action') {
       prompt = `${baseInstruction} 情境：主角${context.name}遭遇突发事件...`; // 请补全
    } else {
       prompt = `${baseInstruction} 情境：主角${context.name}...`; // 请补全
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-70b-8192", // 免费且强大的模型
      temperature: 0.8,
      max_tokens: 50,
    });

    const text = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ text });
  } catch (error) {
    console.error("Groq Error:", error);
    return NextResponse.json({ text: null });
  }
}