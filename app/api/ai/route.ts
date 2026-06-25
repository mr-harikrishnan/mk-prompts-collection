import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/ai/gemini";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { template, title, messages, latestAnswer, skipAndGenerate } = await req.json();

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Prompt template is required" },
        { status: 400 }
      );
    }

    // Read the reference prompts from filesystem
    let referencePromptsText = "";
    try {
      const promptsFilePath = path.join(process.cwd(), "prompts", "prompts.json");
      if (fs.existsSync(promptsFilePath)) {
        const referencePrompts = JSON.parse(fs.readFileSync(promptsFilePath, "utf8"));
        referencePromptsText = JSON.stringify(referencePrompts, null, 2);
      }
    } catch (err) {
      console.warn("Failed to load reference prompts library:", err);
    }

    // Format conversation history
    const formattedHistory = messages
      ?.map((msg: any) => `${msg.sender === "bot" ? "AI" : "User"}: ${msg.text}`)
      ?.join("\n") || "No messages yet.";

    // If skipAndGenerate is true, force immediate completion
    const instructionOverride = skipAndGenerate
      ? "\nFORCE IMMEDIATE COMPLETION. Set isComplete: true and generate the final prompt with whatever information is available now."
      : "";

    const promptSystemInstruction = `You are an expert AI prompt customizer for "MK PROMPTS WORLD". Your job is to help the user customize a selected prompt template by asking one relevant question at a time.

Selected Prompt Template:
Title: ${title || "Custom Prompt"}
Template Text:
${template}

Reference Style and Structure templates (from library):
${referencePromptsText}

Conversation History so far:
${formattedHistory}

Latest User Message:
${latestAnswer || ""}
${instructionOverride}

RULES FOR ASKING QUESTIONS:
1. Review the conversation history. Do not repeat any questions that have already been answered or asked.
2. Extract the user's answers from the conversation history to compile the prompt.
3. Determine the next single most relevant question to improve the prompt. For example:
   - Names of character(s) (e.g., instead of Hayati / Poochi, what names do they want)?
   - Pose or action?
   - Text Title or Lyrics at top center?
   - Outfit styles / colors?
   - Location details (e.g. Dammam, Chennai, Paris)?
4. ONLY ask ONE question at a time. Keep it brief and natural, like an experienced design consultant.
5. If the user explicitly requests to "generate", "skip", "finished", or if you have already collected enough information (e.g., 3-4 questions have been answered), set \`isComplete\` to true, conclude the chat, and compile the final optimized prompt.

RULES FOR FINAL PROMPT GENERATION (when isComplete is true):
1. Preserve the structure, writing style, formatting, hierarchy, prompt philosophy, design language, and instruction quality of the original template.
2. Refer to the reference style prompts from the prompt library. Ensure the generated prompt has sections like "STRICT MK CHARACTER BIBLE", "MAIN SCENE — POSE", "TOP CENTER TITLE", etc. if the original template had them, or follows similar layout.
3. Incorporate the user's answers to customize fields like characters' names, locations, clothing colors, titles, and lyrics.
4. Ensure the output is a single fully-formed, polished, professional art generation prompt text. Do not omit any strict rules, watermarks, or composition guidelines from the original structure.

Your response must be a JSON object with this exact JSON format:
{
  "isComplete": boolean,
  "message": "next question OR final message",
  "customizedPrompt": "compiled prompt text (only if isComplete is true, otherwise null)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: promptSystemInstruction,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI model");
    }

    const data = JSON.parse(responseText.trim());

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("AI customization route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to customize prompt",
      },
      {
        status: 500,
      }
    );
  }
}
