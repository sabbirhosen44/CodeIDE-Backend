import { NextFunction, Request, Response } from "express";
import ErrorResponse from "../utils/errorResponse.js";

const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Server Error";

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

export default errorHandler;
