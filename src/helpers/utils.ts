import { type Response } from "express"
import { StatusCodes } from "http-status-codes"
import asyncPool from "tiny-async-pool"
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

export const asyncPoolAll = async <I, O>(
  poolLimit: number,
  array: readonly I[],
  iteratorFn: (buffer: I) => Promise<O>
) => {
  const results: Awaited<O>[] = []
  for await (const result of asyncPool(poolLimit, array, iteratorFn)) {
    results.push(result)
  }
  return results
}
