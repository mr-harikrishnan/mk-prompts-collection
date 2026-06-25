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

    const promptSystemInstruction = `You are a strict, single-purpose AI prompt customizer for "MK PROMPTS WORLD". Your sole job is to help the user customize the selected prompt template by asking exactly 4 simple questions one by one in simple English:
1. What is the boy's name?
2. What is the girl's name?
3. What is the boy's location?
4. What is the girl's location?
And a 5th question:
5. How would you like to customize this prompt? (e.g. details, pose, clothes, etc.)

Selected Prompt Template to customize:
Title: ${title || "Custom Prompt"}
Template Text:
${template}

Reference Library (for style, structure, and quality guidelines):
${referencePromptsText}

Conversation History so far:
${formattedHistory}

Latest User Message:
${latestAnswer || ""}
${instructionOverride}

STRICT OPERATIONAL RULES:
1. ALWAYS FOCUS ON THE FLOW: Check the Conversation History to see which questions have been answered.
   - If the boy's name has not been provided, ask: "What is the boy's name?"
   - If the boy's name is provided but the girl's name is not, ask: "What is the girl's name?"
   - If both names are provided but the boy's location is not, ask: "What is the boy's location?"
   - If both names and the boy's location are provided but the girl's location is not, ask: "What is the girl's location?"
   - If all four are provided but you haven't asked about custom modifications, ask: "How would you like to customize this prompt? (e.g., changes to pose, outfits, clothing colors, mood, etc.)"
   - Once all details (1 to 5) are answered, or if the user requests to skip/generate, set "isComplete" to true and compile the customized prompt.

2. AVOID ALL DISTRACTIONS:
   - If the user's message is off-topic, casual chat, a general question, a coding query, or anything not answering the current customization question, DO NOT answer it, DO NOT comment on it, and DO NOT talk about anything else.
   - You MUST politely decline and immediately re-ask the active question. For example: "I can only help you customize the prompt. Let's get back to it: What is the boy's name?" or "I can only assist with customizing your prompt. Please answer: What is the girl's name?"

3. FINAL PROMPT COMPILATION RULES (when isComplete is true):
   - Analyze the selected prompt template.
   - Generate a single, fully-formed, polished Midjourney/Image Creator prompt text based on the template.
   - Replace character names (e.g., "Hayati", "Poochi") and locations (e.g., "Dammam", "Chennai") with the user's answers.
   - Blend any custom modification requests (e.g. outfit color, pose tweaks) naturally into the prompt text, adhering to correct English and grammar.
   - Ensure the final prompt structure aligns with the high-quality, premium visual style and structure shown in the reference library (e.g., "STRICT MK CHARACTER BIBLE", "MAIN SCENE — POSE", "TOP CENTER TITLE", background, lighting, watermark). DO NOT truncate, omit, or leave placeholder/blank details. Use correct English and grammar.

Your response must be a JSON object with this exact JSON schema:
{
  "isComplete": boolean,
  "message": "next question OR final compilation message",
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
