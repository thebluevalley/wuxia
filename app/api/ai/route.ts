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
    
    // ⚠️ 获取任务详细描述
    const questDesc = context.questScript?.description || "为了生存而行动";
    
    const strategy = context.strategy || { longTermGoal: "活着", currentFocus: "生存" };
    const seedEvent = context.seedEvent || "";
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");
    const location = context.location || "荒野";
    const envFlavor = FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];

    let styleInstruction = "";
    if (isDanger) {
        styleInstruction = "【生死时刻】：极度紧迫。必须描写具体的应对动作。";
    } else if (isSideTask) {
        styleInstruction = `【紧扣任务】：必须基于任务描述【${questDesc}】来展开。描写动作细节、遇到的物理阻碍以及主角的心理活动。`;
    } else {
        styleInstruction = "【生存日记】：充满画面感和文学性的微型小说片段。";
    }

    // ⚠️ 核心修正：字数控制在 50-160 字
    const baseInstruction = `
      你是一个硬核荒野求生游戏的叙事引擎。
      你的任务是根据玩家的任务目标和描述，实时生成一段极具沉浸感的中文日记。
      
      【核心规则】：
      1. **字数控制**：50-160字。请在这个区间内随机浮动，有时简练有力(50字)，有时细腻详尽(160字)，不要总是固定长度。
      2. **拒绝重复**：绝对不要写和以下内容相似的句子：[${recentLogsText}]。
      3. **拒绝废话**：不要写"我正在努力"这种空话。每一句话都要有实质的物理反馈（触觉、听觉、视觉）。
      4. **紧扣描述**：你的描写必须符合当前任务的具体描述："${questDesc}"。
      5. **种子扩写**：必须基于给定的【事件种子】进行文学润色。

      请用冷峻、真实、充满颗粒感的笔触生成内容。
    `;

    let prompt = "";
    const baseInfo = `地点：${location}。环境：${envFlavor}。`;

    switch (eventType) {
      case 'start_game':
        prompt = `${baseInfo} ${baseInstruction} 任务：写第一篇日记。内容：刚醒来。感官细节（沙子的粗糙、海水的咸腥、身体的剧痛）。迷茫与恐惧。目标：${strategy.longTermGoal}。`;
        break;
      
      case 'quest_start':
        prompt = `${baseInfo} ${baseInstruction} 
        事件：开始任务【${context.questTitle}】。
        任务描述：${questDesc}。
        指令：写一句具体的准备动作。比如检查装备、观察地形，或者深呼吸调整状态。`;
        break;

      case 'quest_journey':
        prompt = `${baseInfo} ${baseInstruction} 
        当前任务：【${context.questTitle}】。
        任务具体描述：${questDesc}。
        微观事件："${seedEvent}"。
        指令：**扩写这个过程**。
        要求：
        1. 结合任务描述中的背景，描写具体的动作细节。
        2. 描写任务带来的生理感受（累、痛、饿）。
        3. 情感反馈：成功时的微小庆幸，或受阻时的焦躁。
        示例（任务是抓蟹）："按照计划，我趴在潮湿的沙坑旁一动不动。手指刚触碰到沙蟹冰凉的外壳，它猛地夹住了我的虎口，钻心的疼让我差点叫出声，但我死死按住了它，为了晚餐。"`;
        break;

      case 'quest_climax':
        prompt = `${baseInfo} ${baseInstruction} 事件：执行任务【${context.questTitle}】时遭遇突发阻碍！指令：描写这个具体的物理危机。`;
        break;

      case 'quest_end':
        prompt = `${baseInfo} ${baseInstruction} 事件：任务【${context.questTitle}】完成。指令：看着手中的成果，回顾刚才${questDesc}的过程，虽然身体疲惫，但离【${strategy.longTermGoal}】又近了一步。`;
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
        prompt = `${baseInfo} ${baseInstruction} 状态：短暂休息。指令：利用这片刻时间整理装备，脑子里盘算着下一步计划（${strategy.currentFocus}）。`;
        break;
        
      default:
        prompt = `${baseInfo} ${baseInstruction} 记录这一刻。`;
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: PROVIDER_CONFIG.model,
      temperature: 0.9, // 提高一点随机性，让字数波动更自然
      max_tokens: 250, // 放宽 Token 限制以支持 160 字
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