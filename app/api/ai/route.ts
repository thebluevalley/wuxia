import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    // 基础信息
    const questInfo = context.questInfo || "游历";
    const petInfo = context.petInfo || "无";
    const skillInfo = context.skillInfo || "乱拳";
    const stage = context.storyStage || "初出茅庐";
    const lore = context.worldLore || "江湖";
    
    // Prompt 基础
    const baseInstruction = `
      你是一位精通金庸古龙风格的武侠小说家。
      主角：${context.name} (${stage}, 性格:${context.personality})
      世界观：${lore}
    `;

    let prompt = "";
    
    // ⚠️ 新增：江湖传闻 Prompt
    if (eventType === 'generate_rumor') {
      prompt = `${baseInstruction}
      【任务】写一段“江湖传闻”或“武林快报”。
      【要求】
      1. 字数：60-100字。
      2. 内容：不要写主角！写江湖上发生的大事。比如某门派被灭、某神兵出世、某高手决战、朝廷动态等。
      3. 格式：必须以“【标题】：内容”的格式返回。
      例如：“【少林惊变】：听说少林寺藏经阁昨夜失窃，十八铜人被打伤，方丈大怒，下令封山追查。”
      `;
    } 
    else if (eventType === 'god_action') {
      const isPunish = userAction.includes('天罚');
      prompt = `${baseInstruction}
      【事件】天降异象【${userAction}】。
      ${isPunish 
        ? '写一段他遭遇挫折、被雷劈或走火入魔的狼狈描写。字数30-50。' 
        : '写一段他福至心灵、伤势痊愈或顿悟的喜悦描写。字数30-50。'}
      `;
    } else if (eventType === 'auto') {
      const isFight = context.state === 'fight' || context.state === 'arena';
      prompt = `${baseInstruction}
      【状态】${isFight ? '激战' : '游历/生活'}。
      【任务】${questInfo}
      ${isFight 
        ? `描写战斗瞬间。使用武功【${skillInfo}】。随从【${petInfo}】如何助攻？字数30-50。` 
        : '描写旅途见闻、风景、内心感悟，或者在城镇中的烟火气。字数30-50。'}
      `;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 1.0, 
      max_tokens: 150, // 增加 token 以支持长传闻
    });

    const text = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}