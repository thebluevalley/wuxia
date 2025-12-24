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
    const strategy = context.strategy || { longTermGoal: "逃离这里", currentFocus: "活下去" };
    const questDesc = context.questScript?.description || "";
    // ⚠️ 获取主线剧情背景，用于制造悬念
    const mainSagaTitle = context.mainSaga || "未知的危机";
    
    const seedEvent = context.seedEvent || "";
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");
    const location = context.location || "荒野";
    const envFlavor = FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];

    // ⚠️ 动态字数策略
    const rand = Math.random();
    let lengthInstruction = "";
    if (rand < 0.4) {
        lengthInstruction = "字数：30-50字。短促、焦虑、碎片化。";
    } else if (rand < 0.8) {
        lengthInstruction = "字数：50-80字。";
    } else {
        lengthInstruction = "字数：80-120字。多一点细节描写。";
    }

    // ⚠️ 核心：Lifeline 风格指令
    let styleInstruction = "";
    
    if (isDanger) {
        styleInstruction = "【濒死通讯】：极度恐慌。呼吸急促。不要用完整的句子。直接把那一瞬间的恐惧喊出来。";
        lengthInstruction = "字数：30-60字。";
    } else if (isExpedition) {
        styleInstruction = `【探索记录】：压低声音。对周围的每一个声响都疑神疑鬼。描述你看到的那些${location}里不该存在的东西。`;
    } else if (isSideTask) {
        styleInstruction = `【生存吐槽】：虽然在做琐事【${taskTarget}】，但嘴里要不停碎碎念。可以吐槽环境恶劣，可以怀疑人生，也可以表现出对【${strategy.longTermGoal}】的绝望或执念。`;
    } else if (isMainQuest) {
        styleInstruction = `【剧情关键】：严肃、沉重。你意识到这些线索与【${mainSagaTitle}】有关。你感到一种宿命般的压迫感。`;
    } else {
        styleInstruction = "【个人独白】：像在对着对讲机自言自语。";
    }

    const baseInstruction = `
      你是一个身处绝境的幸存者（类似于《Lifeline》中的泰勒）。
      你正在通过一个单向通讯频道发送文字。
      
      【人设要求】：
      1. **像人一样说话**：使用口语、倒装句、感叹词。**严禁**像说明书一样平铺直叙。
      2. **情绪化**：你会疼、会累、会怕、会爆粗口（适度）、会自嘲。
      3. **悬疑感**：即使是捡木头，你也要表现出一种"暴风雨前的宁静"的不安感。总是觉得有什么东西在暗处盯着你。
      4. **关联主线**：不管你在干什么，潜意识里都要提到【${strategy.longTermGoal}】或【${mainSagaTitle}】带来的阴影。
      
      【绝对规则】：
      1. ${lengthInstruction}
      2. 紧扣任务描述："${questDesc}"。
      3. 拒绝重复：[${recentLogsText}]。
      
      背景：${location} | ${envFlavor}
    `;

    let prompt = "";
    
    switch (eventType) {
      case 'start_game':
        prompt = `${baseInstruction} 任务：第一次建立通讯。内容：你是谁？有人能收到吗？我刚醒来...这该死的地方是哪？头好痛...全是沙子。`;
        break;
      
      case 'quest_start':
        prompt = `${baseInstruction} 
        事件：决定开始【${context.questTitle}】。
        指令：深吸一口气，给自己打气。或者吐槽一下为什么非得做这个破事不可。`;
        break;

      case 'quest_journey':
        if (isSideTask) {
            prompt = `${baseInstruction} 
            当前动作：【${taskTarget}】。
            微观事件："${seedEvent}"。
            指令：**用第一人称扩写这个瞬间**。
            要求：
            1. 加入身体反馈（"嘶——手划破了"）。
            2. 加入环境疑点（"刚才是不是有影子闪过？"）。
            3. 吐槽（"要是能有点抗生素就好了..."）。
            示例："该死，这撬棍卡住了！锈迹摩擦的声音简直像指甲刮黑板...我用力一踹，这破石头终于动了。希望能找到点有用的，别又是垃圾。"`;
        } else {
            prompt = `${baseInstruction} 
            当前主线：【${context.questTitle}】。
            微观事件："${seedEvent}"。
            指令：严肃地描述这个过程。你感觉自己正在揭开一个巨大的秘密，或者正在接近危险的源头。`;
        }
        break;

      case 'quest_climax':
        prompt = `${baseInstruction} 事件：做【${taskTarget}】时出事了！指令：骂一句！或者惊呼！描述这个突发状况带来的瞬间剧痛或惊吓。`;
        break;

      case 'quest_end':
        prompt = `${baseInstruction} 事件：任务【${context.questTitle}】搞定。指令：喘着粗气看着成果。虽然累得像狗一样，但至少离【${strategy.longTermGoal}】近了一点点...大概吧。`;
        break;
      
      case 'expedition_start':
        prompt = `${baseInstruction} 整理好包。我要进【${location}】了。如果不幸没回来...算了，不说丧气话。祝我好运。`;
        break;
      
      case 'expedition_event':
        prompt = `${baseInstruction} 发现：${seedEvent}。指令：描述这个东西有多诡异。它看起来不像是自然形成的。你感到一阵恶寒。`;
        break;
      
      case 'expedition_end':
        prompt = `${baseInstruction} 活着出来了。满身是泥，可能还挂了彩，但手里攥着战利品。哈哈，我还活着！`;
        break;

      case 'idle_event':
        prompt = `${baseInstruction} 状态：休息。指令：坐在地上发呆。看着伤口或天空，突然感到一阵孤独。或者是整理装备时的碎碎念。`;
        break;
        
      default:
        prompt = `${baseInstruction} 发送一条状态更新。`;
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: PROVIDER_CONFIG.model,
      temperature: 1.0, // 提高温度，让语气更活泼、更像人
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
    if (error.status === 403) msg = "权限不足 (403)。";
    if (error.status === 429) msg = "请求太快了 (429)。";
    return NextResponse.json({ text: null, error: msg }, { status: 500 });
  }
}