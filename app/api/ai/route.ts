import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. 检查 Key 是否存在
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ [API Error] GOOGLE_API_KEY 未在环境变量中配置");
    return NextResponse.json({ text: null });
  }

  try {
    const { context, eventType, userAction } = await req.json();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // ⚠️ 强制切换为 Gemini 2.0 Flash (实验版)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // --- Prompt (提示词) ---
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
      任务：描写该现象对他的影响。
      范例：“一道惊雷落下，他手中的剑竟隐隐泛起蓝光，整个人杀气更盛。”`;
    } else if (eventType === 'auto') {
      const isFight = context.state === 'fight';
      prompt = `${baseInstruction}
      情境：主角${context.name}（Lv.${context.level}）在${context.location}。
      状态：${isFight ? '激战中' : '独行中'}。
      ${isFight 
        ? '任务：描写一个精彩绝伦的攻防瞬间。范例：“刀锋擦着鼻尖掠过，他连眼皮都没眨，反手一剑刺入对方衣袖。”' 
        : '任务：描写环境氛围或内心瞬间的感悟。范例：“风停了，残阳如血，他忽然觉得手中的酒壶有些空荡。”'}
      `;
    }

    console.log(`🤖 [Gemini 2.0] 正在生成 (${eventType})...`);
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    console.log("✅ [Gemini 2.0] 生成成功:", text);

    return NextResponse.json({ text });

  } catch (error: any) {
    // 打印详细错误信息到终端，方便排查
    console.error("❌ [Gemini 2.0 Error]:", error.message);
    return NextResponse.json({ text: null });
  }
}