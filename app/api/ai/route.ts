import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    // 提取信息
    const questInfo = context.questInfo || "游历";
    const petInfo = context.petInfo || "无";
    const skillInfo = context.skillInfo || "乱拳";
    const stage = context.storyStage || "初出茅庐";
    const lore = context.worldLore || "江湖";
    
    // Prompt 设计：强调文学性，融入技能和物品
    const baseInstruction = `
      你是一位武侠小说家（古龙/金庸风格）。为游戏《云游江湖》的主角"${context.name}"撰写实时日志。
      
      【设定】
      - 阶段：${stage} (请符合此阶段的心境)
      - 性格：${context.personality}
      - 武功：${skillInfo} (战斗时务必描写具体招式)
      - 随从：${petInfo}
      - 所在：${context.location}
      - 任务：${questInfo}
      - 世界观：${lore}

      【要求】
      1. 字数：30-55字。
      2. 风格：**拒绝流水账**。使用环境渲染（风、雨、残阳）、心理独白、动作留白。
      3. **不要**出现"玩家"、"系统"、"灵感"等词，这是小说正文。
      4. 用“他”指代主角。
    `;

    let prompt = "";
    
    if (eventType === 'god_action') {
      const isPunish = userAction.includes('天罚');
      prompt = `${baseInstruction}
      【事件】天降异象【${userAction}】。
      ${isPunish 
        ? '写一段他遭遇挫折、被雷劈或走火入魔的狼狈描写。' 
        : '写一段他福至心灵、伤势痊愈或顿悟的喜悦描写。'}
      `;
    } else if (eventType === 'auto') {
      const isFight = context.state === 'fight' || context.state === 'arena';
      prompt = `${baseInstruction}
      【状态】${isFight ? '激战' : '游历/生活'}。
      ${isFight 
        ? '描写战斗瞬间。使用他的武功招式。如果带着宠物，宠物如何助攻？' 
        : '描写旅途见闻、风景、内心感悟，或者在城镇中的烟火气（喝酒、买卖）。'}
      `;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 1.0, 
      max_tokens: 100,
    });

    const text = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}