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

    // --------------------------------------------------------
    // 🆕 模式 A：剧情批量预生成 (Batch Generation - 畅销书模式)
    // --------------------------------------------------------
    if (eventType === 'generate_script_batch') {
        const questDesc = context.questScript?.description || "";
        const location = context.location || "荒野";
        
        // ⚠️ 核心升级：文学化 Prompt
        const batchPrompt = `
          你是一位获得普利策奖的硬核生存小说家（风格类似《路》或《火星救援》）。
          请基于下方的【剧情核心】，创作一段极具沉浸感、文学性极高的第一人称叙事文本。
          
          【剧情核心】：
          "${questDesc}"
          
          【极高标准的写作要求】：
          1. **拒绝流水账**：
             - **严禁**连续使用以"我"开头的句子。
             - **严禁**简单的"动作+结果"句式（如"我打开了门，看见了..."）。
             - 请使用倒装句、侧面描写、环境隐喻来替代平铺直叙。
          
          2. **多维叙事（必须包含以下元素）**：
             - **感官特写**：不要只写看见了什么。写出指尖划过粗糙铁锈的触感、吸入肺部那股灼烧的灰尘味、耳边死一般的寂静。
             - **心理潜流**：不要直接写"我很害怕"。写下意识的生理反应（比如"胃里一阵痉挛"）或瞬间闪过的无关记忆。
             - **环境交互**：环境不是背景板，它是对手。写出环境对他人的压迫感。
          
          3. **长短错落的节奏**：
             - 输出必须是一个 **JSON 字符串数组**。
             - 包含 **5 到 8 个** 自然段。
             - **字数强制波动**：必须混合 **极短句 (20-40字)** 和 **长描写 (80-120字)**。不要让每段话看起来一样长！
          
          【范例对比】：
          ❌ 差：我拿起石头砸开了椰子。椰汁流了出来，我喝了一口，很好喝。
          ✅ 好：双手止不住地颤抖，那块锋利的黑曜石在掌心划出了血痕。随着一声闷响，坚硬的椰壳终于裂开了一道缝隙。清甜的汁液顺着指缝流淌，那一刻，我仿佛尝到了生命本身的味道。
          
          背景：${location}
          现在，请开始你的创作，只返回 JSON 数组。
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: batchPrompt }],
            model: PROVIDER_CONFIG.model,
            temperature: 0.8, // 保持较高的创造力
            max_tokens: 2000, 
        });

        let content = completion.choices[0]?.message?.content || "[]";
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            const storyArray = JSON.parse(content);
            if (Array.isArray(storyArray)) {
                return NextResponse.json({ storyBatch: storyArray });
            }
        } catch (e) {
            console.error("JSON Parse Error:", e);
            const fallbackArray = content.split('\n').map(s => s.trim()).filter(line => line.length > 10);
            return NextResponse.json({ storyBatch: fallbackArray });
        }
    }

    // --------------------------------------------------------
    // 🔄 模式 B：单条随机事件 (保持原有的随机性，但提升文笔)
    // --------------------------------------------------------
    const isDanger = context.isDanger;
    const taskTarget = context.taskObjective || "生存"; 
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");
    const location = context.location || "荒野";
    const envFlavor = FLAVOR_TEXTS.environment[Math.floor(Math.random() * FLAVOR_TEXTS.environment.length)];

    const rand = Math.random();
    let lengthInstruction = "";
    if (rand < 0.4) lengthInstruction = "字数：20-40字。极简、有力。";
    else if (rand < 0.7) lengthInstruction = "字数：40-70字。";
    else lengthInstruction = "字数：70-100字。细腻描写。";

    if (isDanger) lengthInstruction = "字数：20-30字。短促，窒息感。";

    const baseInstruction = `
      你是一个硬核生存小说家。用第一人称"我"写一段话。
      
      【要求】：
      1. ${lengthInstruction}
      2. **拒绝平庸**：不要写"我正在做..."。用侧面描写。比如用"汗水滴进眼睛的刺痛"来表现"累"。
      3. **场景+行动**：必须将【${taskTarget}】这个动作融入到【${envFlavor}】的环境描写中。
      4. 避开：[${recentLogsText}]。
      
      背景：${location}
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: baseInstruction }],
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
    if (error.status === 403) msg = "权限不足 (403)。";
    if (error.status === 429) msg = "请求过快。";
    return NextResponse.json({ text: null, error: msg }, { status: 500 });
  }
}