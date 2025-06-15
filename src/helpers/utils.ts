import { type Response } from "express"
import { StatusCodes } from "http-status-codes"
import { type ZodError } from "zod"

export function isZodError<T>(error: unknown): error is ZodError<T> {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "ZodError"
  )
}

export const ok = (res: Response, data: unknown = undefined) => {
  return res.status(StatusCodes.OK).json(data)
}

export const created = (res: Response, data: unknown = undefined) => {
  return res.status(StatusCodes.CREATED).json(data)
}

export const noContent = (res: Response) => {
  return res.status(StatusCodes.NO_CONTENT).json()
}
