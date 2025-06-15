import UnauthorizedException from "../helpers/errors/unauthorized-exception"

import "dotenv/config"

import { type NextFunction, type Request, type Response } from "express"

const checkAPIKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"]
  if (!apiKey || apiKey !== process.env.API_KEY)
    throw new UnauthorizedException("Invalid API Key")
  next()
}

export { checkAPIKey }
