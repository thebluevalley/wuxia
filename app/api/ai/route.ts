import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 如果没配 Key，返回空，前端会自动用本地文案
  if (!process.env.GOOGLE_API_KEY) return NextResponse.json({ text: null });

  try {
    const { context, eventType } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt = "";
    // 根据事件类型生成不同的 Prompt
    if (eventType === 'idle') {
      prompt = `你是一个武侠旁白。主角${context.name}（Lv.${context.level}）当前在${context.location}。请用古龙或金庸的笔触，写一句简短的环境描写或内心独白（50字内）。要有江湖的沧桑感，或者一点点黑色幽默。`;
    } else if (eventType === 'fight') {
      prompt = `武侠战斗旁白。主角${context.name}正在战斗。请描写一个精彩的招式瞬间（如“白虹贯日”或“黑虎掏心”），50字内。`;
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ text: null }); // 出错也降级为本地
  }
}