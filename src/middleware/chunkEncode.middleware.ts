import { Request, Response, NextFunction } from "express";
import { decode } from "base64-arraybuffer-es6";

export function chunkEncode(req: Request, res: Response, next: NextFunction) {
  const param = req.method === "POST" ? req.body : req.params;
  if (param.chunk) {
    param.chunk = decode(param.chunk);
  }
  console.log("🚀 ~ chunkEncode ~ param:", param)
  next();
}