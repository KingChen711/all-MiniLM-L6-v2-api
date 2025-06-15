import express from "express"

import { container } from "../../config/inversify.config"
import { checkAPIKey } from "../../middleware/check-api-key.middleware"
import { validateRequestData } from "../../middleware/validate-request-data.middleware"
import { EmbeddingController } from "./embedding.controller"
import { extractSchema } from "./embedding.validation"

const router = express.Router()

const embeddingController = container.get(EmbeddingController)

router.post(
  "/extract",
  checkAPIKey,
  validateRequestData(extractSchema),
  embeddingController.extract
)

export { router as embeddingRoute }
