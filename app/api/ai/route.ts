import OpenAI from "openai";
import { NextResponse } from "next/server";
import { FLAVOR_TEXTS } from "@/app/lib/constants";

// 🔧 配置 SiliconFlow
const PROVIDER_CONFIG = {
  baseURL: "https://api.siliconflow.cn/v1",
  apiKey: process.env.SILICONFLOW_API_KEY, 
  // ⚠️ 修正：使用免费版 7B 模型
  model: "Qwen/Qwen2.5-7B-Instruct", 
};

export async function POST(req: Request) {
  // 1. 检查 Key 是否配置
  if (!PROVIDER_CONFIG.apiKey) {
      console.error("Error: Missing SILICONFLOW_API_KEY in .env.local");
      return NextResponse.json({ text: null, error: "Server Config Error: Missing API Key" }, { status: 500 });
  }

  try {
    const { context, eventType } = await req.json();

    // 2. 初始化 OpenAI 客户端 (连接到 SiliconFlow)
    const openai = new OpenAI({
      baseURL: PROVIDER_CONFIG.baseURL,
      apiKey: PROVIDER_CONFIG.apiKey,
    });

    // 3. 解构上下文
    const isDanger = context.isDanger;
    const isMainQuest = context.questCategory === 'main';
    const isSideTask = context.questCategory === 'side' || context.questCategory === 'auto';
    const taskTarget = context.taskObjective || "生存"; 
    const strategy = context.strategy || { longTermGoal: "活着", currentFocus: "生存" };
    const seedEvent = context.seedEvent || "";
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");
    const location = context.location || "荒野";
    
    // 随机环境氛围
    const envFlavor = FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];

    // 4. 构建风格指令
    let styleInstruction = "";
    if (isDanger) {
        styleInstruction = "【生死时刻】：极度紧迫。短句为主。描写肾上腺素、疼痛、本能反应。";
    } else if (isSideTask) {
        styleInstruction = `【以小见大】：描写具体的物理动作【${taskTarget}】。同时，在潜台词中透露出这个动作是为了实现长期目标【${strategy.longTermGoal}】。`;
    } else {
        styleInstruction = "【生存日记】：充满画面感和文学性的微型小说片段。";
    }

    // 5. 构建 System Prompt
    const systemPrompt = `
      你是一个硬核荒野求生游戏的叙事引擎。
      你的任务是根据玩家的状态和行为，实时生成一段简短但极具沉浸感的中文日记。
      
      【核心规则】：
      1. **字数控制**：30-80字。保持精炼。
      2. **拒绝重复**：绝对不要写和以下内容相似的句子：[${recentLogsText}]。
      3. **拒绝废话**：不要写"我正在努力"、"这很难"这种空洞的心理描写。每一句话都要有实质的物理反馈（触觉、听觉、视觉）。
      4. **逻辑连贯**：主角当前专注于【${strategy.currentFocus}】。
      5. **种子扩写**：必须基于给定的【事件种子】进行文学润色，不要生硬地翻译种子。
    `;

    // 6. 构建 User Prompt
    let userPrompt = "";
    const baseInfo = `当前地点：${location}。环境氛围：${envFlavor}。`;

    switch (eventType) {
      case 'start_game':
        userPrompt = `${baseInfo} 任务：写第一篇日记。内容：我刚醒来。感官细节（沙子的粗糙、海水的咸腥、身体的剧痛）。迷茫与恐惧。目标：${strategy.longTermGoal}。`;
        break;
      
      case 'quest_start':
        userPrompt = `${baseInfo} 事件：开始任务【${context.questTitle}】。指令：写一句准备动作。比如检查工具，或者深呼吸确认目标。`;
        break;

      case 'quest_journey':
        userPrompt = `${baseInfo} 当前动作：【${taskTarget}】。事件种子："${seedEvent}"。指令：详细描写这个动作的过程。强调物理反馈（重量、质感、疼痛）。`;
        break;

      case 'quest_climax':
        userPrompt = `${baseInfo} 事件：任务遭遇小意外！指令：极短的危机描写！例如工具断裂、毒虫叮咬、脚下游动。`;
        break;

      case 'quest_end':
        userPrompt = `${baseInfo} 事件：任务【${context.questTitle}】完成。指令：描写看着成果的瞬间。感到离【${strategy.longTermGoal}】又近了一步。`;
        break;
      
      case 'expedition_start':
        userPrompt = `${baseInfo} 整理好行囊，为了寻找${strategy.longTermGoal}的线索，毅然踏入【${location}】。`;
        break;
      
      case 'expedition_event':
        userPrompt = `${baseInfo} 探险中发现了一个惊人的东西。事件种子："${seedEvent}"。描写它的外观和给主角带来的震撼。`;
        break;
      
      case 'expedition_end':
        userPrompt = `${baseInfo} 探险结束。虽然满身泥泞，但收获颇丰。`;
        break;

      case 'idle_event':
        userPrompt = `${baseInfo} 状态：短暂休息。事件种子："${seedEvent}"。指令：写一个放松的细节。但在内心深处，依然挂念着【${strategy.longTermGoal}】。`;
        break;
        
      case 'recruit_companion':
        userPrompt = `${baseInfo} 遇到幸存者。描写他衣衫褴褛的细节和警惕的眼神。`;
        break;
        
      case 'god_action':
        userPrompt = `${baseInfo} 突发意外。描写运气好或坏的具体表现。`;
        break;
        
      default:
        userPrompt = `${baseInfo} 记录这一刻的生存状态。`;
    }

    // 7. 发送请求
    const completion = await openai.chat.completions.create({
      messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
      ],
      model: PROVIDER_CONFIG.model,
      temperature: 0.8, 
      max_tokens: 150, 
    });

    let text = completion.choices[0]?.message?.content || "";
    
    // 8. 后处理
    text = text.replace(/^(Task:|Context:|Response:|Here is|Scene:|Day 1|日记|【.*?】).*/gi, '').trim();
    text = text.replace(/^["']|["']$/g, ''); 
    text = text.replace(/\*\*/g, ''); 

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("AI API Error:", error);
    let msg = error.message;
    if (error.status === 401) msg = "API Key 无效，请检查配置。";
    if (error.status === 429) msg = "请求太快了 (429)，请稍候。";
    if (error.status === 500) msg = "SiliconFlow 服务器繁忙。";
    
    return NextResponse.json({ text: null, error: msg }, { status: 500 });
  }
}