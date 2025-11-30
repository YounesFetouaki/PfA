import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import {
  SYSTEM_PROMPT,
  generateQuestionsPrompt,
} from "@/lib/prompts/generate-questions";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

export async function POST(req: Request, res: Response) {
  logger.info("generate-interview-questions request received");
  
  let body;
  try {
    body = await req.json();
    logger.info("Request body received", { 
      hasName: !!body.name,
      hasObjective: !!body.objective,
      hasNumber: !!body.number,
      contextLength: body.context?.length || 0
    });
  } catch (error: any) {
    logger.error("Error parsing request body", { error: error.message });
    return NextResponse.json(
      { error: "Invalid request body", details: error.message },
      { status: 400 },
    );
  }

  // Validate required fields
  if (!body.name || !body.objective || !body.number) {
    logger.error("Missing required fields", { 
      name: !!body.name,
      objective: !!body.objective,
      number: !!body.number,
      body 
    });
    return NextResponse.json(
      { error: "Missing required fields: name, objective, and number are required" },
      { status: 400 },
    );
  }

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    logger.error("OpenAI API key not configured");
    return NextResponse.json(
      { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables." },
      { status: 500 },
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 5,
    dangerouslyAllowBrowser: true,
  });

  try {
    // Validate context length (OpenAI has token limits)
    const context = body.context || "";
    const maxContextLength = 10000; // Roughly 2500 tokens
    
    let processedContext = context;
    if (context.length > maxContextLength) {
      logger.warn("Context too long, truncating", { 
        originalLength: context.length,
        maxLength: maxContextLength 
      });
      processedContext = context.substring(0, maxContextLength) + "... [truncated]";
    }

    const promptBody = {
      name: body.name,
      objective: body.objective,
      number: Number(body.number),
      context: processedContext,
    };

    const prompt = generateQuestionsPrompt(promptBody);
    
    logger.info("Calling OpenAI API", {
      model: "gpt-4o",
      contextLength: processedContext.length,
      questionCount: promptBody.number,
      promptLength: prompt.length
    });

    // Try gpt-4o first, fallback to gpt-4-turbo-preview if needed
    let baseCompletion;
    let modelUsed = "gpt-4o";
    try {
      baseCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000,
      });
    } catch (openaiError: any) {
      // If gpt-4o fails, try gpt-4-turbo-preview as fallback
      if (openaiError.code === "model_not_found" || openaiError.status === 404) {
        logger.warn("gpt-4o not available, trying gpt-4-turbo-preview", { error: openaiError.message });
        modelUsed = "gpt-4-turbo-preview";
        try {
          baseCompletion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              {
                role: "system",
                content: SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 2000,
          });
        } catch (fallbackError: any) {
          logger.error("OpenAI API fallback also failed", {
            error: fallbackError.message,
            status: fallbackError.status,
            code: fallbackError.code,
            type: fallbackError.type
          });
          throw new Error(`OpenAI API error: ${fallbackError.message || "Unknown error"}`);
        }
      } else {
        logger.error("OpenAI API error", {
          error: openaiError.message,
          status: openaiError.status,
          code: openaiError.code,
          type: openaiError.type
        });
        throw new Error(`OpenAI API error: ${openaiError.message || "Unknown error"}`);
      }
    }
    
    logger.info(`Successfully called OpenAI API with model: ${modelUsed}`);

    const basePromptOutput = baseCompletion.choices[0] || {};
    const content = basePromptOutput.message?.content;

    if (!content) {
      logger.error("No content in OpenAI response", { baseCompletion });
      return NextResponse.json(
        { error: "No response from AI model" },
        { status: 500 },
      );
    }

    // Validate that the response is valid JSON
    try {
      const parsed = JSON.parse(content);
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        logger.error("Invalid response format", { parsed });
        return NextResponse.json(
          { error: "Invalid response format from AI" },
          { status: 500 },
        );
      }
    } catch (parseError) {
      logger.error("Failed to parse AI response as JSON", { content, parseError });
      return NextResponse.json(
        { error: "Invalid JSON response from AI" },
        { status: 500 },
      );
    }

    logger.info("Interview questions generated successfully");

    return NextResponse.json(
      {
        response: content,
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error("Error generating interview questions", {
      error: error.message,
      stack: error.stack,
      body: body,
    });

    // Return more detailed error information
    const errorMessage = error.message || "Failed to generate interview questions";
    const isOpenAIError = error.response?.status || error.status;

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
        openaiError: isOpenAIError ? true : false
      },
      { status: 500 },
    );
  }
}
