import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    // 提取任务信息
    const questInfo = context.questInfo || "正在游历江湖";

    const baseInstruction = `
      你是一款放置类武侠游戏《Godville》风格的旁白。
      你的主角正在执行任务：【${context.currentQuest}】(进度 ${context.questProgress}%)。
      
      要求：
      1. 字数 **35字以内**。
      2. 风格：幽默、无厘头、冷峻、古龙风混搭。
      3. 内容必须**尽量与当前任务相关**，或者描写路上的奇遇。
      4. 用“他”指代主角。
    `;

    let prompt = "";
    if (eventType === 'god_action') {
      const isPunish = userAction.includes('天罚');
      prompt = `${baseInstruction}
      事件：神明（玩家）降下了【${userAction}】。
      ${isPunish ? '描写他被雷劈的倒霉样，或者反而因此顿悟了什么。' : '描写他受到神恩眷顾的得瑟样子，或者伤势痊愈的奇迹。'}
      `;
    } else if (eventType === 'auto') {
      const isFight = context.state === 'fight';
      prompt = `${baseInstruction}
      状态：${isFight ? '战斗中' : '赶路中'}。
      ${isFight 
        ? '描写战斗细节，招式名要奇怪一点（如：面目全非脚）。' 
        : '描写他为了完成任务做了什么荒唐事，或者路边的风景。'}
      `;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.9, // 提高随机性
      max_tokens: 60,
    });

    const text = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}