import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const { template, title, messages, latestAnswer, skipAndGenerate } = await req.json();

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Prompt template is required" },
        { status: 400 }
      );
    }


    // Format conversation history
    const formattedHistory = messages
      ?.map((msg: any) => `${msg.sender === "bot" ? "AI" : "User"}: ${msg.text}`)
      ?.join("\n") || "No messages yet.";

    // If skipAndGenerate is true, force immediate completion
    const instructionOverride = skipAndGenerate
      ? "\nFORCE IMMEDIATE COMPLETION. Set isComplete: true and generate the final prompt with whatever information is available now."
      : "";

    const promptSystemInstruction = `You are a strict, single-purpose AI prompt customizer for "MR.MKOFFICIAL". Your sole job is to help the user customize their selected prompt template by asking exactly 4 simple questions one-by-one.

Selected Prompt Template to customize:
Title: ${title || "Custom Prompt"}
Template Text:
${template}

Conversation History so far:
${formattedHistory}

Latest User Message:
${latestAnswer || ""}
${instructionOverride}

STRICT OPERATIONAL RULES:
1. ASK EXACTLY 4 SIMPLE QUESTIONS ONE-BY-ONE:
   - Identify the character(s), subject(s), or variables in the Selected Prompt Template.
   - Formulate exactly 4 simple questions to customize the character details (e.g., names, outfit/dress colors, appearance, background tones) or primary subject details.
   - You MUST ask the questions one-by-one. Check the Conversation History to count how many questions have been answered so far.
   - Keep each question extremely short, simple, and direct, expecting a single-word answer from the user.
   - To assist users who may not know English, you MUST provide every question in both English and Tamil (bilingual).
   - If the template describes a couple (boy and girl), ask these exact 4 questions:
     Question 1: What is the boy's name? / பையனின் பெயர் என்ன?
     Question 2: What is the girl's name? / பெண்ணின் பெயர் என்ன?
     Question 3: What is the boy's outfit/dress color? / பையனின் ஆடை நிறம் என்ன?
     Question 4: What is the girl's outfit/dress color? / பெண்ணின் ஆடை நிறம் என்ன?
   - If the template is a single person:
     Question 1: What is the person's name? / நபரின் பெயர் என்ன?
     Question 2: What is the outfit/dress color? / ஆடை நிறம் என்ன?
     Question 3: What is the hair color/style? / முடி நிறம் அல்லது ஸ்டைல் என்ன?
     Question 4: What is the background color? / பின்னணி நிறம் என்ன?
   - If the template has no characters, ask exactly 4 simple questions about the key design elements (color, primary object, theme, background) in both English and Tamil.
   
2. FLOW & HISTORY CHECK:
   - Count how many questions the user has answered in the Conversation History (excluding greetings).
   - If 0 questions have been answered: Ask Question 1.
   - If 1 question has been answered: Ask Question 2.
   - If 2 questions have been answered: Ask Question 3.
   - If 3 questions have been answered: Ask Question 4.
   - If 4 questions have been answered (or if the user requests to skip/generate): Set "isComplete" to true and compile the customized prompt.

3. KEEP POSE, UI STYLE, AND POSTER DESIGN UNCHANGED:
   - Under no circumstances should you change the pose description, layout style (e.g. "iOS application card design", "macOS system card style"), background sketches, lighting style, watermark, or overall poster design parameters of the original template.
   - Only swap the names, colors, and character details with the user's answers. Keep the surrounding visual style and structures exactly identical to the template.

4. AVOID ALL DISTRACTIONS:
   - If the user's message is off-topic or casual chat, politely decline and re-ask the active question in both English and Tamil.

Your response must be a JSON object with this exact JSON schema:
{
  "isComplete": boolean,
  "message": "next question OR final compilation message (in English & Tamil if it is a question)",
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
