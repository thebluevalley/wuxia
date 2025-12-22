import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ text: null, error: "后端未找到 GROQ_API_KEY" }, { status: 500 });
  }

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    // 基础信息
    const questInfo = context.questInfo || "游历江湖";
    const petInfo = context.petInfo || "孤身一人";
    const stage = context.storyStage || "初出茅庐";
    const lore = context.worldLore || "江湖动荡";
    
    // 🔥 核心 Prompt：赋予 AI 文学灵魂
    const baseInstruction = `
      你是一位精通金庸、古龙风格的武侠小说家。正在为放置游戏《云游江湖》实时撰写剧情日志。
      
      【当前主角设定】
      - 称号：${context.name} (Lv.${context.level})
      - 人生阶段：【${stage}】 (请根据阶段调整语气，初出茅庐要青涩，一代宗师要孤傲)
      - 性格：${context.personality} (行为要符合性格)
      - 随从：${petInfo}
      - 所在：${context.location}
      - 任务：${questInfo}
      - 世界观：${lore}

      【写作要求】
      1. 字数：30-50字，短小精悍。
      2. 风格：**极具文学性**。多用四字成语，多写环境氛围（风、雪、酒、剑），多写心理活动。
      3. 拒绝流水账（如“他打了一下怪”），要写出画面感（如“剑光一闪，那厮的衣角已然碎裂”）。
      4. 必须用“他”指代主角。
      5. 结合当前[状态]和[任务]进行描写。
    `;

    let prompt = "";
    
    if (eventType === 'god_action') {
      const isPunish = userAction.includes('天罚');
      prompt = `${baseInstruction}
      【事件】天降异象，主角遭遇了【${userAction}】。
      【任务】
      ${isPunish 
        ? '写一段他遭受挫折、被雷劈或运功岔气的狼狈描写。体现出“天将降大任于斯人也”的磨砺感。' 
        : '写一段他福至心灵、伤势痊愈或顿悟的描写。体现出天道眷顾的喜悦。'}
      `;
    } else if (eventType === 'auto') {
      const isFight = context.state === 'fight' || context.state === 'arena';
      prompt = `${baseInstruction}
      【状态】${isFight ? '激战中' : '游历/任务中'}。
      【任务】
      ${isFight 
        ? '描写战斗的惊险瞬间。使用武侠招式名称（如：黑虎掏心、白鹤亮翅）。如果有宠物，描写宠物如何协助攻击。' 
        : '描写他在执行任务途中的见闻、风景、内心独白，或者与路人/NPC的简短互动。要体现出江湖的烟火气或肃杀气。'}
      `;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 1.0, // 提高创造性，避免重复
      max_tokens: 100,  // 稍微放宽字数限制，允许更优美的句子
    });

    const text = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Groq Error:", error);
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}