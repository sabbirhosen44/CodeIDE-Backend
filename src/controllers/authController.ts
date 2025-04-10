import { Request, Response } from "express";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
};
