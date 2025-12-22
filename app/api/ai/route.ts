import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!process.env.GOOGLE_API_KEY) return NextResponse.json({ text: null });

  try {
    const { context, eventType, userAction } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // 速度优先

    let prompt = "";
    
    // 1. 玩家干预 (天罚/赐福)
    if (eventType === 'god_action') {
      prompt = `你是一个古代武侠小说的旁白。主角${context.name}正在${context.location}。
      突然，天上传来一股神秘力量（玩家操作：${userAction}）。
      请用古龙风格，描写这个超自然现象对主角的影响（如：被雷劈后头发竖起，或者伤口神奇愈合）。
      字数50字以内，幽默一点。`;
    } 
    // 2. 自动挂机 (环境/战斗)
    else if (eventType === 'auto') {
      const isFight = context.state === 'fight';
      prompt = `你是一个古代武侠小说的旁白。主角${context.name}（Lv.${context.level}）当前在${context.location}。
      ${isFight ? '他正在遭遇一场战斗。' : '他正在赶路或发呆。'}
      请写一句简短的日志（50字内）。
      风格要求：${isFight ? '动作描写精彩，招式名字花以此' : '环境描写唯美，或者体现主角的内心独白'}。
      不要重复之前的套路。`;
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json({ text });

  } catch (error) {
    return NextResponse.json({ text: null });
  }
}