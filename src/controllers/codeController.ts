import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";

const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python3: 71,
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  go: 60,
  rust: 73,
  php: 68,
  ruby: 72,
  csharp: 51,
};

const JUDGE0_STATUS: Record<number, string> = {
  1: "In Queue",
  2: "Processing",
  3: "Accepted",
  4: "Wrong Answer",
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error (SIGSEGV)",
  8: "Runtime Error (SIGXFSZ)",
  9: "Runtime Error (SIGFPE)",
  10: "Runtime Error (SIGABRT)",
  11: "Runtime Error (NZEC)",
  12: "Runtime Error (Other)",
  13: "Internal Error",
  14: "Exec Format Error",
};

const JUDGE0_BASE_URL = "https://judge0-ce.p.rapidapi.com";
const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 15;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runOnJudge0(
  languageId: number,
  sourceCode: string,
  stdin: string,
  apiKey: string,
  apiHost: string
): Promise<{
  stdout: string;
  stderr: string;
  compileOutput: string;
  status: string;
  statusId: number;
  time: string;
  memory: number;
}> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": apiKey,
    "X-RapidAPI-Host": apiHost,
  };

  const submitRes = await fetch(
    `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: languageId,
        source_code: sourceCode,
        stdin: stdin || "",
      }),
    }
  );

  if (!submitRes.ok) {
    const errText = await submitRes.text();
    throw new Error(`Judge0 submission failed (${submitRes.status}): ${errText}`);
  }

  const { token } = (await submitRes.json()) as { token: string };

  if (!token) {
    throw new Error("Judge0 did not return a submission token");
  }

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const pollRes = await fetch(
      `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`,
      { method: "GET", headers }
    );

    if (!pollRes.ok) {
      throw new Error(`Judge0 polling failed (${pollRes.status})`);
    }

    const result = (await pollRes.json()) as {
      status: { id: number; description: string };
      stdout?: string;
      stderr?: string;
      compile_output?: string;
      time?: string;
      memory?: number;
    };

    const statusId = result.status?.id;

    if (statusId === 1 || statusId === 2) {
      continue;
    }

    return {
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      compileOutput: result.compile_output || "",
      status: result.status?.description || JUDGE0_STATUS[statusId] || "Unknown",
      statusId,
      time: result.time || "0",
      memory: result.memory || 0,
    };
  }

  throw new Error("Execution timed out waiting for Judge0 result");
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
    const languageId = JUDGE0_LANGUAGE_IDS[langKey];

    if (!languageId) {
      return next(
        new ErrorResponse(
          `Language "${language}" is not supported. Supported: ${Object.keys(JUDGE0_LANGUAGE_IDS).join(", ")}`,
          400
        )
      );
    }

    const apiKey = process.env.JUDGE0_API_KEY || "";
    const apiHost = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";

    if (!apiKey) {
      return next(
        new ErrorResponse(
          "Code execution is not configured. Please set JUDGE0_API_KEY in the server environment.",
          503
        )
      );
    }

    const result = await runOnJudge0(languageId, code, stdin, apiKey, apiHost);

    const exitCode = result.statusId === 3 ? 0 : 1;

    const errorText = [result.compileOutput, result.stderr]
      .filter(Boolean)
      .join("\n")
      .trim();

    res.status(200).json({
      success: true,
      data: {
        stdout: result.stdout,
        stderr: errorText,
        compileOutput: result.compileOutput,
        status: result.status,
        statusId: result.statusId,
        exitCode,
        executionTime: parseFloat(result.time) * 1000,
        memory: result.memory,
        language: langKey,
        version: "Judge0 CE",
      },
    });
  }
);
