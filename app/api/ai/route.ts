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
    // 任务类型判断
    const questCategory = context.questCategory || 'none';
    const isMainQuest = questCategory === 'main';
    const isSideTask = questCategory === 'side' || questCategory === 'auto';
    const isExpedition = questCategory === 'expedition' || eventType.includes('expedition');

    const taskTarget = context.taskObjective || "生存"; 
    // 仅在主线时使用策略目标，支线时屏蔽
    const strategy = context.strategy || { longTermGoal: "活着", currentFocus: "生存" };
    const questDesc = context.questScript?.description || "";
    
    const seedEvent = context.seedEvent || "";
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");
    const location = context.location || "荒野";
    const envFlavor = FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];

    // ⚠️ 核心：动态风格指令 (叙事隔离)
    let styleInstruction = "";
    
    if (isDanger) {
        styleInstruction = "【生死时刻】：极度紧迫。短句。只关注当下的生存动作（逃跑、反击、包扎）。";
    } else if (isExpedition) {
        styleInstruction = `【探险模式】：
        1. **聚焦环境**：描写${location}的阴森、未知和细节。
        2. **悬疑感**：强调“发现”和“未知的恐惧”。
        3. **隔离主线**：不要提及主角的身世或长远目标，只关注眼前的探索。`;
    } else if (isSideTask) {
        // ⚠️ 支线强力隔离：禁止升华主题
        styleInstruction = `【特写模式 (Side Quest)】：
        1. **绝对聚焦**：只描写执行【${taskTarget}】的具体过程。
        2. **物理反馈**：描写手部的触感、工具的阻力、肌肉的酸痛。
        3. **禁止升华**：**严禁**提及“为了${strategy.longTermGoal}”或“为了生存”这种大道理。只写干活！
        4. **禁止回忆**：不要写过去，只写现在。`;
    } else if (isMainQuest) {
        styleInstruction = "【剧情模式 (Main Quest)】：允许描写心理活动、回忆、以及当前行动对长远目标（" + strategy.longTermGoal + "）的意义。";
    } else {
        styleInstruction = "【生存日记】：充满画面感和文学性的微型小说片段。";
    }

    const baseInstruction = `
      你是一个硬核荒野求生游戏的叙事引擎。
      
      【全局约束】：
      1. **字数**：50-160字 (长短结合，拒绝流水账)。
      2. **拒绝重复**：避开以下内容：[${recentLogsText}]。
      3. **风格**：${styleInstruction}
      
      背景：${location} | ${envFlavor}
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `${baseInstruction} 任务：写第一篇日记。内容：刚醒来。感官细节（沙子的粗糙、剧痛）。迷茫。目标：${strategy.longTermGoal}。`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        事件：开始任务【${context.questTitle}】。
        任务描述：${questDesc}。
        指令：写一句具体的准备动作。检查装备或观察目标。`;
        break;

      case 'quest_journey':
        // 根据任务类型分流 Prompt
        if (isSideTask) {
            prompt = `${baseInstruction} 
            当前动作：【${taskTarget}】。
            微观事件："${seedEvent}"。
            指令：**扩写这个微观动作**。
            要求：
            1. 就像摄影机的特写镜头，聚焦于手部动作和物品细节。
            2. 描写具体的物理阻碍（滑脱、卡住、沉重）。
            3. 结尾只写生理反馈（手疼、喘气、流汗）。
            示例："手中的撬棍卡在岩石缝隙里，锈迹摩擦发出刺耳的声响。我咬牙用力一扳，指关节因为用力而发白，岩石终于松动了。"`;
        } else {
            prompt = `${baseInstruction} 
            当前主线：【${context.questTitle}】。
            微观事件："${seedEvent}"。
            指令：描写任务过程，并将其与主线目标【${strategy.currentFocus}】联系起来。描写心理活动。`;
        }
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 事件：执行【${taskTarget}】时遭遇突发阻碍！指令：描写这个具体的物理危机（断裂、坍塌、袭击）。`;
        break;

      case 'quest_end':
        if (isSideTask) {
            prompt = `${baseInstruction} 事件：任务【${context.questTitle}】完成。指令：看着手中的具体成果（物资），描写单纯的收获感或身体的放松。不要写人生感悟。`;
        } else {
            prompt = `${baseInstruction} 事件：主线【${context.questTitle}】完成。指令：回顾过程，感到离【${strategy.longTermGoal}】更近了一步。`;
        }
        break;
      
      case 'expedition_start':
        prompt = `${baseInstruction} 整理行囊，毅然踏入【${location}】的阴影中。空气中弥漫着危险的气息。`;
        break;
      
      case 'expedition_event':
        prompt = `${baseInstruction} 探险发现：${seedEvent}。描写这个发现的细节（外观、气味、位置），以及它带来的惊悚或神秘感。`;
        break;
      
      case 'expedition_end':
        prompt = `${baseInstruction} 探险结束。描写满身泥泞、伤痕累累但活着回来的狼狈模样。`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 状态：短暂休息。指令：利用这片刻时间整理装备，或者处理伤口。描写一个静态的生存细节。`;
        break;
        
      default:
        prompt = `${baseInstruction} 记录这一刻。`;
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: PROVIDER_CONFIG.model,
      temperature: 0.9, 
      max_tokens: 250, 
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