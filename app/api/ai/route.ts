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
    const strategy = context.strategy || { longTermGoal: "活着", currentFocus: "生存" };
    const questDesc = context.questScript?.description || "";
    
    const seedEvent = context.seedEvent || "";
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");
    const location = context.location || "荒野";
    const envFlavor = FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];

    // ⚠️ 1. 随机字数分配 (20-100字区间)
    // 提前分配好具体的字数指令，确保 AI 不会偷懒只写中间值
    const rand = Math.random();
    let lengthInstruction = "";
    // Max tokens 稍微给多一点点缓冲，防止硬截断
    let maxTokens = 150; 

    if (rand < 0.35) {
        lengthInstruction = "【字数指令】：极短促。严格控制在 20-40 字。";
    } else if (rand < 0.7) {
        lengthInstruction = "【字数指令】：标准叙事。控制在 40-70 字。";
    } else {
        lengthInstruction = "【字数指令】：细腻描写。控制在 70-100 字。";
    }

    if (isDanger) {
        lengthInstruction = "【字数指令】：极短。20-40 字。"; // 危险时强制短句
    }

    // ⚠️ 2. 动态风格指令
    let styleInstruction = "";
    
    if (isDanger) {
        styleInstruction = "【生死时刻】：不要写环境了，只写生理本能（瞳孔放大、肌肉僵硬）和求生动作（翻滚、挥刺）。";
    } else if (isExpedition) {
        styleInstruction = `【探险小说】：侧重于环境的压抑感。描写光影、回声和气味，以及主角小心翼翼的动作。`;
    } else if (isSideTask) {
        styleInstruction = `【动作特写】：像电影分镜一样。聚焦于手部的动作细节和物品的物理质感。`;
    } else if (isMainQuest) {
        styleInstruction = "【剧情演绎】：像一本第一人称的生存小说。将当前的行动与剧本背景结合，体现宿命感。";
    } else {
        styleInstruction = "【生存快照】：客观记录。";
    }

    const baseInstruction = `
      你是一个硬核荒野求生小说《遗落群岛》的叙事引擎。
      请用第一人称"我"的视角，实时生成一段沉浸感极强的剧情片段。
      
      【绝对规则】：
      1. ${lengthInstruction} (必须严格遵守，宁缺毋滥)。
      2. **双重要素**：每一段文字必须同时包含【场景/环境描写】和【主角具体行动】。缺一不可。
      3. **口吻风格**：冷峻、真实、带一点对未知的敬畏。像是在写一本末世求生回忆录。
      4. **紧扣任务**：内容必须基于当前任务描述："${questDesc}"。
      5. **拒绝心理独白**：少写"我感到害怕"，多写"我的手在发抖"。用物理细节表现心理。
      6. 拒绝重复：避开：[${recentLogsText}]。

      背景：${location} | ${envFlavor}
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `${baseInstruction} 任务：写第一篇日记。内容：醒来。沙砾硌着皮肤的触感，海水的咸腥味，身上伤口的剧痛。检查四周。`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        事件：开始任务【${context.questTitle}】。
        指令：描写一句具体的准备动作。检查装备细节，或观察目标方位的地形。`;
        break;

      case 'quest_journey':
        if (isSideTask) {
            prompt = `${baseInstruction} 
            当前动作：【${taskTarget}】。
            微观事件："${seedEvent}"。
            指令：**扩写这个微观动作**。
            示例："海风裹挟着沙砾打在脸上(场景)。我眯起眼睛，手中的撬棍狠狠插入岩石缝隙，铁锈摩擦发出刺耳的尖啸(行动)。"`;
        } else {
            prompt = `${baseInstruction} 
            当前主线：【${context.questTitle}】。
            微观事件："${seedEvent}"。
            指令：推进剧情。描写你在执行剧本任务时的具体遭遇。环境是如何阻碍你的？你是如何克服的？`;
        }
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 事件：执行【${taskTarget}】时遭遇突发阻碍！指令：描写这个具体的物理危机（工具崩断、脚下塌陷）。`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 事件：任务【${context.questTitle}】完成。指令：描写看着手中具体成果（物资细节）的画面。描写呼吸慢慢平复的过程。`;
        break;
      
      case 'expedition_start':
        prompt = `${baseInstruction} 整理好行囊，勒紧鞋带，毅然踏入【${location}】的阴影中。空气中弥漫着未知的气味。`;
        break;
      
      case 'expedition_event':
        prompt = `${baseInstruction} 探险发现：${seedEvent}。描写这个发现的视觉细节（颜色、形状、材质），以及它周围的环境气氛。`;
        break;
      
      case 'expedition_end':
        prompt = `${baseInstruction} 探险结束。描写满身泥泞、伤痕累累但带着物资走回营地的狼狈画面。`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 状态：短暂休息。指令：利用这片刻时间处理装备细节（如擦拭刀锋、倒出鞋里的沙子）。`;
        break;
        
      default:
        prompt = `${baseInstruction} 记录这一刻。`;
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: PROVIDER_CONFIG.model,
      temperature: 0.9, 
      max_tokens: maxTokens, 
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
    if (error.status === 403) msg = "权限不足 (403)。";
    if (error.status === 429) msg = "请求过快。";
    return NextResponse.json({ text: null, error: msg }, { status: 500 });
  }
}