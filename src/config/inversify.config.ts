import { Container } from "inversify"

import { EmbeddingController } from "../modules/embedding/embedding.controller"
import { EmbeddingService } from "../modules/embedding/embedding.service"

const container = new Container()

container.bind(EmbeddingService).toSelf().inSingletonScope()
container.bind(EmbeddingController).toSelf().inSingletonScope()

export { container }
