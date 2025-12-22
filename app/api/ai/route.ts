import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. 检查 Key 是否配置
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ 错误: GOOGLE_API_KEY 未配置");
    return NextResponse.json({ text: null });
  }

  try {
    const { context, eventType, userAction } = await req.json();
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 使用 gemini-1.5-flash，它通常比 2.0 更稳定
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // --- 强化的 Prompt (提示词) ---
    const baseInstruction = `
      你是一位精通古龙和金庸风格的武侠小说家。
      请为一款文字游戏生成一段**极简短**的日志。
      要求：
      1. 字数严格控制在 **35字以内**。
      2. 风格：冷峻、简洁、意境深远，或者带一点点黑色幽默。
      3. 不要重复废话，不要出现“少侠”二字（用“他”代替或省略主语）。
      4. 绝对不要写“接下来的故事”、“未完待续”这种话。
    `;

    let prompt = "";

    if (eventType === 'god_action') {
      // 玩家干预 (赐福/天罚)
      prompt = `${baseInstruction}
      当前情境：主角${context.name}在${context.location}。
      突发事件：天降异象，对他进行了【${userAction}】。
      任务：描写这个超自然现象对他的影响。
      范例：“一道惊雷劈下，他手中的剑竟隐隐有了雷光。”`;
    } 
    else if (eventType === 'auto') {
      // 自动挂机
      const isFight = context.state === 'fight';
      prompt = `${baseInstruction}
      当前情境：主角${context.name}（Lv.${context.level}）身处${context.location}。
      状态：${isFight ? '激战中' : '独行中'}。
      ${isFight 
        ? '任务：描写一个精彩绝伦的攻防瞬间。范例：“刀光一闪，他已收剑入鞘，那人的袖口多了一道裂痕。”' 
        : '任务：描写环境氛围或内心独白。范例：“风停了，他忽然觉得手中的剑有些沉重。”'}
      `;
    }

    console.log("🤖 正在呼叫 Gemini AI...");
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("✅ AI 生成:", text);

    return NextResponse.json({ text });

  } catch (error) {
    console.error("❌ AI 调用失败:", error);
    return NextResponse.json({ text: null }); // 失败则返回 null，前端会用静态文案兜底
  }
}