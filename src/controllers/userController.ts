import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler.js";

export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const getUserDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const updateUserPlan = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {}
);
