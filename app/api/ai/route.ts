import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ text: null, error: "No Key" }, { status: 500 });

  try {
    const { context, eventType, userAction } = await req.json();
    const groq = new Groq({ apiKey });

    const questInfo = context.questInfo || "游历";
    const companionInfo = context.companionInfo || "独行"; 
    const skillInfo = context.skillInfo || "乱拳";
    const stage = context.storyStage || "初出茅庐";
    const recentLogs = context.recentLogs ? context.recentLogs.join(" | ") : "无";
    const lastLen = context.lastLogLen || 0;
    
    const lengthInstruction = lastLen > 50 
      ? "上一段很长，这段**简短有力**，30字以内，古龙风格。" 
      : "上一段很短，这段**细腻描写**，50-70字，金庸风格。";

    // ⚠️ 基础指令：强调不啰嗦
    const baseInstruction = `
      你是一位武侠小说家。为《云游江湖》主角"${context.name}"写剧情。
      【设定】
      - 境界:${stage}, 性格:${context.personality}
      - 伙伴:${companionInfo} (⚠️ 注意：如果伙伴信息显示"暂不描写"，请不要在文中提及伙伴。如果显示具体信息，请根据其【性别】和【性格】决定其语气，例如男性豪迈，女性婉约，或反差)
      - 当前任务:${questInfo}
      - 历史:${recentLogs} (不要重复)
      【要求】
      1. ${lengthInstruction}
      2. 拒绝流水账，写出画面感。
      3. 用“他”指代主角。
      4. 只输出剧情文本，不要带任何解释。
    `;

    let prompt = "";
    let maxTokens = 150;
    
    switch (eventType) {
      case 'start_game':
        prompt = `${baseInstruction} 【任务】开场白。描写身世、天气、初入江湖的心境。字数80-120。`;
        maxTokens = 200;
        break;
        
      case 'resume_game':
        prompt = `${baseInstruction} 【任务】回归游戏。描写休息后的状态，准备继续旅程。字数40-60。`;
        break;
        
      case 'recruit_companion':
        prompt = `${baseInstruction} 
        【事件】主角刚刚在酒馆招募了新伙伴。
        【任务】描写两人初次见面的互动，或者伙伴的一句开场白。
        ⚠️ 重点：体现伙伴的性别特征和性格。例如女性伙伴可能行万福礼或豪爽抱拳，男性伙伴可能敬酒或冷酷点头。`;
        break;
        
      case 'quest_update':
        prompt = `${baseInstruction}
        【任务】任务推进。写具体的行动细节。
        如果【有伙伴且未被隐藏】，可以描写伙伴的一句点评或一个动作（如：${companionInfo}）。`;
        break;
        
      case 'generate_rumor':
        prompt = `${baseInstruction} 【任务】写一段“江湖传闻”。格式：【标题】：内容。`;
        maxTokens = 100;
        break;
        
      case 'god_action':
        const isPunish = userAction && userAction.includes('天罚');
        prompt = `${baseInstruction} 【事件】天降异象。
        ${isPunish ? '主角遭遇天罚（雷劈、跌倒等），狼狈不堪。' : '主角获得赐福（金光、顿悟等），精神焕发。'}
        描写这个瞬间的画面。`;
        break;
        
      case 'auto':
      default:
        const isFight = context.state === 'fight' || context.state === 'arena';
        prompt = `${baseInstruction}
        【状态】${isFight ? '激战中' : '游历中'}。
        ${isFight 
          ? `描写战斗场面。使用武功【${skillInfo}】。` 
          : '描写旅途风景、内心感悟。'}
        `;
        break;
    }

    if (!prompt) {
      prompt = `${baseInstruction} 写一段主角正在江湖游历的简短描写。`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile", 
      temperature: 1.0, 
      max_tokens: maxTokens,
    });

    const text = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ text });

  } catch (error: any) {
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}