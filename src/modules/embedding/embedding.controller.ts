import { Request, Response } from "express"
import { inject, injectable } from "inversify"

import { ok } from "../../helpers/utils"
import { EmbeddingService } from "./embedding.service"

@injectable()
export class EmbeddingController {
  constructor(
    @inject(EmbeddingService)
    private readonly embeddingService: EmbeddingService
  ) {}

  public extract = async (req: Request, res: Response) => {
    const users = await this.embeddingService.extractTexts(
      res.locals.requestData
    )
    return ok(res, users)
  }
}
