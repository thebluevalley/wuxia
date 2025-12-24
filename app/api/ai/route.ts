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

    // ⚠️ 核心升级：动态字数策略 (实现真正的长短交替)
    // 随机生成一个具体的字数要求，而不是给一个大区间让 AI 偷懒
    const rand = Math.random();
    let lengthInstruction = "";
    if (rand < 0.4) {
        lengthInstruction = "【短句模式】：控制在 30-50 字。语言极简，只写核心动作，干脆利落。";
    } else if (rand < 0.8) {
        lengthInstruction = "【标准模式】：控制在 50-80 字。平衡动作描写和环境氛围。";
    } else {
        lengthInstruction = "【详尽模式】：控制在 80-100 字。多写一点细节，把动作拆解得更细致。";
    }

    // ⚠️ 动态风格指令
    let styleInstruction = "";
    
    if (isDanger) {
        styleInstruction = "【生死时刻】：极短促。只描写生理反应（瞳孔收缩、肌肉紧绷）和具体的生存动作（翻滚、挥刺）。";
        lengthInstruction = "【短句模式】：控制在 30-50 字。"; // 危险时强制短句
    } else if (isExpedition) {
        styleInstruction = `【探险模式】：聚焦于环境的细节（光影、气味、回声）。描写主角在${location}中的每一步探索动作。`;
    } else if (isSideTask) {
        styleInstruction = `【动作特写】：像摄像机特写一样记录执行【${taskTarget}】的过程。只写手部动作、工具与物体的接触、以及物品的物理反馈。`;
    } else if (isMainQuest) {
        styleInstruction = "【剧情推进】：通过具体的行动来推动剧情。少写内心独白，多写目之所见的事实。";
    } else {
        styleInstruction = "【生存快照】：客观记录当下的状态。";
    }

    const baseInstruction = `
      你是一个硬核荒野求生游戏的叙事引擎。
      请像一个冷峻的观察者，用极简精炼的语言记录事实。
      
      【绝对规则】：
      1. **字数指令**：${lengthInstruction} (严格执行)。
      2. **拒绝心理描写**：**严禁**出现"我感到"、"我想"、"希望"、"恐惧"等词汇。用动作和生理反应来表现情绪（如用"手在颤抖"代替"害怕"）。
      3. **聚焦动作与场景**：每一句话都必须包含具体的**动作**（挖掘、打磨、行走）或**环境细节**（纹理、气味、光线）。
      4. **紧扣任务**：内容必须完全围绕任务描述"${questDesc}"展开。
      5. **拒绝重复**：避开：[${recentLogsText}]。

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
            要求：
            1. 聚焦于动作过程（用力、抓握、切割）。
            2. 描写物体的物理反馈（断裂声、粗糙质感、重量）。
            3. 描写生理反馈（汗水滴落、肌肉酸胀）。
            示例："手中的撬棍卡在岩石缝隙里，锈迹摩擦发出刺耳的声响。咬牙用力一扳，指关节因发力而泛白，岩石终于松动滚落。"`;
        } else {
            prompt = `${baseInstruction} 
            当前主线：【${context.questTitle}】。
            微观事件："${seedEvent}"。
            指令：描写执行任务的具体过程。将动作与周围环境的变化联系起来。`;
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
        prompt = `${baseInstruction} 探险发现：${seedEvent}。描写这个发现的视觉细节（颜色、形状、材质），以及它周围的环境。`;
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
      max_tokens: 200, 
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
    if (error.status === 403) msg = "权限不足 (403)：请检查硅基流动账号是否已实名认证。";
    if (error.status === 429) msg = "请求太快了 (429)，请稍候。";
    return NextResponse.json({ text: null, error: msg }, { status: 500 });
  }
}