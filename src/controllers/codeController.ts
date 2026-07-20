import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";

const GLOT_BASE_URL = "https://glot.io/api/run";

const LANGUAGE_FILE_MAP: Record<string, { slug: string; filename: string }> = {
  javascript: { slug: "javascript", filename: "main.js" },
  typescript: { slug: "typescript", filename: "main.ts" },
  python:     { slug: "python",     filename: "main.py" },
  python3:    { slug: "python",     filename: "main.py" },
  java:       { slug: "java",       filename: "Main.java" },
  c:          { slug: "c",          filename: "main.c" },
  cpp:        { slug: "cpp",        filename: "main.cpp" },
  go:         { slug: "go",         filename: "main.go" },
  rust:       { slug: "rust",       filename: "main.rs" },
  php:        { slug: "php",        filename: "main.php" },
  ruby:       { slug: "ruby",       filename: "main.rb" },
  csharp:     { slug: "csharp",     filename: "main.cs" },
};

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
    const langConfig = LANGUAGE_FILE_MAP[langKey];

    if (!langConfig) {
      return next(
        new ErrorResponse(
          `Language "${language}" is not supported. Supported: ${Object.keys(LANGUAGE_FILE_MAP).join(", ")}`,
          400
        )
      );
    }

    const apiToken = process.env.GLOT_API_TOKEN || "";

    if (!apiToken) {
      return next(
        new ErrorResponse(
          "Code execution is not configured. Please set GLOT_API_TOKEN in the server environment.",
          503
        )
      );
    }

    const url = `${GLOT_BASE_URL}/${langConfig.slug}/latest`;
    const startTime = Date.now();

    const glotRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${apiToken}`,
      },
      body: JSON.stringify({
        files: [{ name: langConfig.filename, content: code }],
        stdin,
        command: "",
      }),
    });

    if (!glotRes.ok) {
      const errJson = await glotRes.json().catch(() => ({ message: "Unknown error" })) as { message?: string };
      return next(
        new ErrorResponse(
          `Glot.io error (${glotRes.status}): ${errJson.message || "Unknown error"}`,
          502
        )
      );
    }

    const result = (await glotRes.json()) as {
      stdout?: string;
      stderr?: string;
      error?: string;
    };

    const executionTime = Date.now() - startTime;
    const stdout = result.stdout || "";
    const stderr = [result.stderr, result.error].filter(Boolean).join("\n").trim();
    const exitCode = stderr ? 1 : 0;

    res.status(200).json({
      success: true,
      data: {
        stdout,
        stderr,
        compileOutput: "",
        status: exitCode === 0 ? "Accepted" : "Runtime Error",
        statusId: exitCode === 0 ? 3 : 11,
        exitCode,
        executionTime,
        memory: 0,
        language: langKey,
        version: `glot.io/${langConfig.slug}`,
      },
    });
  }
);
