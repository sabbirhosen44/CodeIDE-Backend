import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";

const EXEC_URL = process.env.CODE_EXEC_URL || "https://serene-beyond-24282-e718ca8b277f.herokuapp.com";

const LANGUAGE_MAP: Record<string, string> = {
  javascript: "javascript",
  typescript:  "javascript",
  python:      "python3",
  python3:     "python3",
  java:        "java",
  c:           "c",
  cpp:         "cpp",
  go:          "go",
  rust:        "rust",
  php:         "php",
  ruby:        "ruby",
  csharp:      "csharp",
};

async function pollResult(url: string, maxAttempts = 20, intervalMs = 1000): Promise<Record<string, unknown>> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(url);
    const data = await res.json() as Record<string, unknown>;
    if (res.status === 200) return data;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error("Timed out");
}

export const executeCodeController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { language, code, stdin = "" } = req.body;

    if (!language || typeof language !== "string") {
      return next(new ErrorResponse("language is required", 400));
    }
    if (!code || typeof code !== "string") {
      return next(new ErrorResponse("code is required", 400));
    }

    const langKey = language.toLowerCase();
    const lang = LANGUAGE_MAP[langKey];

    if (!lang) {
      return next(
        new ErrorResponse(
          `Language "${language}" is not supported. Supported: ${Object.keys(LANGUAGE_MAP).join(", ")}`,
          400
        )
      );
    }

    const startTime = Date.now();

    const submitRes = await fetch(`${EXEC_URL}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src: code, stdin, lang, timeout: 10 }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      return next(new ErrorResponse(`Execution engine error (${submitRes.status}): ${errText}`, 502));
    }

    const returnedUrl = await submitRes.text();

    const resultPath = returnedUrl.includes("/results/")
      ? "/results/" + returnedUrl.split("/results/")[1].trim()
      : returnedUrl.trim();
    const resultUrl = `${EXEC_URL}${resultPath}`;

    let result: Record<string, unknown>;
    try {
      result = await pollResult(resultUrl, 20, 1000);
    } catch {
      return next(new ErrorResponse("Code execution timed out after 20 seconds", 408));
    }

    const executionTime = Date.now() - startTime;
    const stdout = (result.output as string) || "";
    const stderr = (result.stderr as string) || "";
    const isSuccess = result.status === "Successful";

    res.status(200).json({
      success: true,
      data: {
        stdout,
        stderr,
        compileOutput: "",
        status: isSuccess ? "Accepted" : (result.status as string) || "Runtime Error",
        statusId: isSuccess ? 3 : 11,
        exitCode: isSuccess ? 0 : 1,
        executionTime,
        memory: 0,
        language: langKey,
        version: lang,
      },
    });
  }
);
