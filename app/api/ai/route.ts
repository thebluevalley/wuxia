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
    // 🆕 模式 A：剧情批量预生成 (Batch Generation)
    // --------------------------------------------------------
    if (eventType === 'generate_script_batch') {
        const questDesc = context.questScript?.description || "";
        const location = context.location || "荒野";
        
        const batchPrompt = `
          你是一个硬核生存小说家。
          请基于以下剧情梗概，**扩写成一段完整的第一人称生存日记**。
          
          【剧情梗概】：
          "${questDesc}"
          
          【要求】：
          1. **拆分输出**：请将这段剧情拆分为 **5 到 8 个** 独立的自然段。
          2. **格式强制**：**必须**只返回一个 JSON 字符串数组，格式为：["段落1内容...", "段落2内容...", "段落3内容..."]。不要包含 markdown 代码块标记，不要包含任何其他文字。
          3. **内容风格**：
             - 第一人称"我"。
             - 沉浸感强，包含环境描写（声、光、味）和具体的动作细节。
             - 每一段字数控制在 60-120 字之间。
             - 逻辑连贯，像在讲故事。
          
          背景：${location}
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: batchPrompt }],
            model: PROVIDER_CONFIG.model,
            temperature: 0.7, // 稍微降低随机性，保证 JSON 格式稳定
            max_tokens: 1024, // 允许长文本生成
        });

        let content = completion.choices[0]?.message?.content || "[]";
        // 清理可能存在的 markdown 标记
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // 尝试解析 JSON
        try {
            const storyArray = JSON.parse(content);
            if (Array.isArray(storyArray)) {
                return NextResponse.json({ storyBatch: storyArray });
            }
        } catch (e) {
            console.error("JSON Parse Error:", e, content);
            // 兜底：如果 JSON 解析失败，按换行符强行分割
            const fallbackArray = content.split('\n').filter(line => line.length > 20);
            return NextResponse.json({ storyBatch: fallbackArray });
        }
    }

    // --------------------------------------------------------
    // 🔄 模式 B：传统的单条生成 (用于随机事件/Idle)
    // --------------------------------------------------------
    // ... (保留原有的单条生成逻辑，用于处理非主线的随机事件) ...
    
    const isDanger = context.isDanger;
    const taskTarget = context.taskObjective || "生存"; 
    const recentLogs = context.recentLogs || [];
    const recentLogsText = recentLogs.join(" | ");
    const location = context.location || "荒野";
    
    const baseInstruction = `
      你是一个硬核荒野求生游戏的叙事引擎。
      请用第一人称"我"的视角，生成一段 30-80 字的生存记录。
      只描写动作和环境，不要写心理活动。
      
      背景：${location}
      任务：${taskTarget}
      
      拒绝重复：[${recentLogsText}]
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: baseInstruction }],
      model: PROVIDER_CONFIG.model,
      temperature: 0.9, 
      max_tokens: 150, 
    });

    let text = completion.choices[0]?.message?.content || "";
    text = text.replace(/^(Task:|Context:|Response:|Here is|Scene:|Day 1|日记|【.*?】).*/gi, '').trim();
    text = text.replace(/^["']|["']$/g, ''); 

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ text: null, error: error.message }, { status: 500 });
  }
}