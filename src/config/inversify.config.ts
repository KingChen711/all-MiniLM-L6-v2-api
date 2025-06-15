import { Container } from "inversify"

import { EmbeddingController } from "@/modules/embedding/embedding.controller"
import { EmbeddingService } from "@/modules/embedding/embedding.service"

const container = new Container()

container.bind(EmbeddingService).toSelf().inRequestScope()
container.bind(EmbeddingController).toSelf().inRequestScope()

export { container }
