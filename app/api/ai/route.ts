import OpenAI from "openai";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS } from "@/app/lib/constants";

// 🔧 配置 SiliconFlow
const PROVIDER_CONFIG = {
  baseURL: "https://api.siliconflow.cn/v1",
  apiKey: process.env.SILICONFLOW_API_KEY, 
  model: "deepseek-ai/DeepSeek-V3", 
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
    const taskTarget = context.taskObjective || "生存"; 
    const strategy = context.strategy || { longTermGoal: "活着", currentFocus: "生存" };
    const seedEvent = context.seedEvent || "";
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");
    const location = context.location || "荒野";
    const envFlavor = FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];

    let styleInstruction = "";
    if (isDanger) {
        styleInstruction = "【生死时刻】：极度紧迫。必须描写具体的应对动作（躲闪、反击、逃跑），而不仅仅是描写恐惧。";
    } else if (isSideTask) {
        // ⚠️ 核心修正：强调动作细节和情感反馈
        styleInstruction = `【紧扣主题】：必须围绕【${taskTarget}】这个具体任务展开。
        1. **过程描写**：如何执行动作？(例如：弯腰、挖掘、追逐)
        2. **遇到阻碍**：发生了什么困难？(例如：猎物逃跑、工具卡住、身体疲惫)
        3. **情感反馈**：主角的感受如何？(例如：气喘吁吁但很兴奋、失望、肌肉酸痛)
        禁止写与任务无关的环境描写。`;
    } else {
        styleInstruction = "【生存日记】：记录关键的生存决策。";
    }

    const baseInstruction = `
      你是一个硬核荒野求生游戏的叙事引擎。
      你的任务是推动剧情，确保每一句话都与主角当前的行动紧密相关。
      
      【绝对禁令】：
      1. **禁止**单纯描写风景（如"风很冷"），除非它直接阻碍了行动。
      2. **禁止**重复以下内容：[${recentLogsText}]。

      请用简练、冷峻但充满细节的笔触（30-90字）生成一段内容。
    `;

    let prompt = "";
    const baseInfo = `地点：${location}。环境：${envFlavor}。`;

    switch (eventType) {
      case 'start_game':
        prompt = `${baseInfo} ${baseInstruction} 任务：写第一篇日记。内容：刚醒来。剧痛。迷茫。检查伤势。`;
        break;
      
      case 'quest_start':
        prompt = `${baseInfo} ${baseInstruction} 
        事件：开始任务【${context.questTitle}】。
        指令：写一句具体的准备动作。
        潜台词：为了${strategy.currentFocus}，我必须完成它。`;
        break;

      case 'quest_journey':
        prompt = `${baseInfo} ${baseInstruction} 
        当前专注：正在全力【${taskTarget}】。
        微观事件："${seedEvent}"。
        指令：**扩写这个过程**。
        要求：
        1. 描写具体的动作细节（手部动作、身体姿态）。
        2. 描写任务带来的生理感受（累、痛、饿）。
        3. 如果成功了一小步，描写那种微小的成就感；如果受阻，描写沮丧。
        示例（任务是抓蟹）："手指刚触碰到沙蟹冰凉的外壳，它猛地夹住了我的虎口，钻心的疼让我差点叫出声，但我死死按住了它。"`;
        break;

      case 'quest_climax':
        prompt = `${baseInfo} ${baseInstruction} 事件：执行【${taskTarget}】时遭遇突发阻碍！指令：描写这个具体的物理危机。`;
        break;

      case 'quest_end':
        prompt = `${baseInfo} ${baseInstruction} 事件：任务【${context.questTitle}】完成。指令：看着手中的成果，描写身体的疲惫感散去，取而代之的是生存下去的希望。`;
        break;
      
      case 'expedition_start':
        prompt = `${baseInfo} ${baseInstruction} 整理行囊，为了寻找${strategy.longTermGoal}，毅然踏入未知。`;
        break;
      
      case 'expedition_event':
        prompt = `${baseInfo} ${baseInstruction} 探险发现：${seedEvent}。描写这个发现的细节和给主角带来的震撼。`;
        break;
      
      case 'expedition_end':
        prompt = `${baseInfo} ${baseInstruction} 探险结束。满身泥泞但满载而归。`;
        break;

      case 'idle_event':
        prompt = `${baseInfo} ${baseInstruction} 状态：短暂休息。指令：利用这片刻时间整理装备，脑子里盘算着下一步计划。`;
        break;
        
      default:
        prompt = `${baseInfo} ${baseInstruction} 记录这一刻。`;
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
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