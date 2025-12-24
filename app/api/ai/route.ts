import OpenAI from "openai";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS } from "@/app/lib/constants";

// 🔧 配置 SiliconFlow
const PROVIDER_CONFIG = {
  baseURL: "https://api.siliconflow.cn/v1",
  apiKey: process.env.SILICONFLOW_API_KEY, 
  model: "Qwen/Qwen2.5-7B-Instruct", 
};

export async function POST(req: Request) {
  if (!PROVIDER_CONFIG.apiKey) {
      return NextResponse.json({ text: null, error: "Server Config Error: Missing API Key" }, { status: 500 });
  }

  try {
    const { context, eventType } = await req.json();

    const openai = new OpenAI({
      baseURL: PROVIDER_CONFIG.baseURL,
      apiKey: PROVIDER_CONFIG.apiKey,
    });

    const isDanger = context.isDanger;
    const isMainQuest = context.questCategory === 'main';
    const isSideTask = context.questCategory === 'side' || context.questCategory === 'auto';
    
    // ⚠️ 增强：任务目标描述
    const taskTarget = context.taskObjective || "生存"; 
    
    // ⚠️ 增强：策略与动机
    const strategy = context.strategy || { longTermGoal: "活下去", currentFocus: "维持生命体征" };
    
    const seedEvent = context.seedEvent || "";
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");
    const location = context.location || "荒野";
    const envFlavor = FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];

    let styleInstruction = "";
    if (isDanger) {
        styleInstruction = "【生死时刻】：极度紧迫。必须描写具体的应对动作（躲闪、反击、逃跑），而不仅仅是描写恐惧。";
    } else if (isSideTask) {
        // ⚠️ 核心修正：强制动作与结果
        styleInstruction = `【剧情推进】：禁止只描写环境（如风沙、天气）。必须描写主角为了【${strategy.currentFocus}】而执行【${taskTarget}】的具体过程。动作 -> 阻碍 -> 结果。`;
    } else {
        styleInstruction = "【生存日记】：记录关键的生存决策。";
    }

    // 5. 构建 System Prompt
    const systemPrompt = `
      你是一个硬核荒野求生游戏的叙事引擎。
      你的任务是推动剧情，而不是单纯描写风景。
      
      【绝对禁令】：
      1. **禁止**重复描写"风"、"沙"、"痛"、"冷"，除非它们直接阻碍了当前的行动。
      2. **禁止**写无意义的心理活动（如"我希望能活下去"）。
      3. **禁止**重复以下内容：[${recentLogsText}]。

      【写作公式】：
      1. **动作 (Action)**：主角具体在做什么？(例如：弯腰挖掘、用力拉扯、打磨)
      2. **目的 (Goal)**：为什么要做这个？(为了${strategy.longTermGoal})
      3. **反馈 (Result)**：环境或物品给了什么反馈？(木头断了、发现水珠、工具磨损)
      
      请用简练、冷峻的笔触（30-80字）生成一段内容。
    `;

    // 6. 构建 User Prompt
    let userPrompt = "";
    const baseInfo = `地点：${location}。环境：${envFlavor}。`;

    switch (eventType) {
      case 'start_game':
        userPrompt = `${baseInfo} 任务：写第一篇日记。内容：刚醒来。身体的剧痛让我意识到这不是梦。我必须立刻检查伤势并寻找水源。`;
        break;
      
      case 'quest_start':
        userPrompt = `${baseInfo} 事件：决定开始任务【${context.questTitle}】。
        指令：写一句具体的准备动作。例如："整理好行囊，确认匕首还在腰间，我向${location}深处走去，为了${strategy.currentFocus}。"`;
        break;

      case 'quest_journey':
        // ⚠️ 核心修正：强制关联任务
        userPrompt = `${baseInfo} 
        当前状态：正在执行【${taskTarget}】。
        微观事件："${seedEvent}"。
        指令：**扩写这个微观事件**。
        要求：
        1. 必须体现主角的主观能动性（是我在做，不是风在吹）。
        2. 必须体现这个动作对【${strategy.currentFocus}】的微小贡献。
        示例（如果任务是找水）："扒开潮湿的苔藓，手指触碰到了冰凉的泥土，虽然只有几滴浑浊的水渗出，但这至少是活下去的希望。"`;
        break;

      case 'quest_climax':
        userPrompt = `${baseInfo} 事件：执行【${taskTarget}】时遭遇突发阻碍！指令：描写这个具体的物理阻碍（如工具断裂、脚下踏空）。`;
        break;

      case 'quest_end':
        userPrompt = `${baseInfo} 事件：任务【${context.questTitle}】完成。指令：看着手中的成果（${context.questTitle}的产物），虽然身体疲惫，但离【${strategy.longTermGoal}】又近了一步。`;
        break;
      
      case 'expedition_start':
        userPrompt = `${baseInfo} 毅然踏入【${location}】。虽然前路未卜，但为了寻找${strategy.longTermGoal}的线索，别无选择。`;
        break;
      
      case 'expedition_event':
        userPrompt = `${baseInfo} 探险发现：${seedEvent}。描写这个发现的细节，以及它对生存的潜在价值。`;
        break;
      
      case 'expedition_end':
        userPrompt = `${baseInfo} 探险结束。满载而归。`;
        break;

      case 'idle_event':
        userPrompt = `${baseInfo} 状态：短暂休息。指令：利用这片刻时间整理装备或规划下一步，哪怕在休息，脑子里想的也是${strategy.currentFocus}。`;
        break;
        
      default:
        userPrompt = `${baseInfo} 记录当下的生存状态。`;
    }

    const completion = await openai.chat.completions.create({
      messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
      ],
      model: PROVIDER_CONFIG.model,
      temperature: 0.85, 
      max_tokens: 150, 
    });

    let text = completion.choices[0]?.message?.content || "";
    text = text.replace(/^(Task:|Context:|Response:|Here is|Scene:|Day 1|日记|【.*?】).*/gi, '').trim();
    text = text.replace(/^["']|["']$/g, ''); 
    text = text.replace(/\*\*/g, ''); 

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("AI API Error:", error);
    let msg = error.message;
    if (error.status === 401) msg = "API Key 无效。";
    if (error.status === 429) msg = "请求过快，AI 正在思考...";
    return NextResponse.json({ text: null, error: msg }, { status: 500 });
  }
}