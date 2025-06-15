import {
  AutoTokenizer,
  env,
  FeatureExtractionPipeline,
  pipeline,
  PreTrainedTokenizer,
} from "@huggingface/transformers"
import { injectable } from "inversify"

import { TExtractSchema } from "./embedding.validation"

type Chunk = {
  chunkId: number
  text: string
}

type ChunkWithVector = Chunk & {
  vector: number[]
}

@injectable()
export class EmbeddingService {
  private extractor: FeatureExtractionPipeline | null = null
  private tokenizer: PreTrainedTokenizer | null = null
  private readonly maxTokens = 250 as const
  private readonly overlap = 50 as const
  private readonly task = "feature-extraction" as const
  private readonly model = "Xenova/all-MiniLM-L6-v2" as const

  async getExtractor(): Promise<FeatureExtractionPipeline> {
    if (this.extractor === null) {
      env.localModelPath = "../../Xenova/all-MiniLM-L6-v2"

      //@ts-ignore
      this.extractor = await pipeline(this.task, this.model)
    }

    return this.extractor
  }

  async getTokenizer(): Promise<PreTrainedTokenizer> {
    if (this.tokenizer === null) {
      env.localModelPath = "../../Xenova/all-MiniLM-L6-v2"
      this.tokenizer = await AutoTokenizer.from_pretrained(this.model)
    }

    return this.tokenizer
  }

  async extract(dto: TExtractSchema): Promise<ChunkWithVector[]> {
    const extractor = await this.getExtractor()

    const chunks = await this.chunkText(dto.body.text)

    return await Promise.all(
      chunks.map(async (c) => {
        const output = await extractor(c.text, {
          pooling: "mean",
          normalize: true,
        })
        return {
          ...c,
          vector: Array.from(output.data) as number[],
        }
      })
    )
  }

  private async chunkText(rawText: string): Promise<Chunk[]> {
    const sentences = this.splitIntoSentences(await this.normalize(rawText))
    const chunks: Chunk[] = []
    let buffer = "",
      tokenCount = 0,
      chunkId = 0

    for (const sent of sentences) {
      const sentTokenCount = (await this.tokenize(sent)).length

      // Nếu thêm câu này vượt quá maxTokens → đóng chunk cũ
      if (tokenCount + sentTokenCount > this.maxTokens && buffer) {
        chunks.push({
          chunkId: chunkId++,
          text: buffer,
        })

        // buffer mới bắt đầu từ phần overlap
        const overlapText = await this.getLastTokens(buffer, this.overlap)
        buffer = overlapText
        tokenCount = (await this.tokenize(overlapText)).length
      }

      // Thêm sentence vào buffer
      buffer = buffer ? `${buffer} ${sent}` : sent
      tokenCount += sentTokenCount
    }

    // Đưa chunk còn thừa ra
    if (buffer) {
      chunks.push({ chunkId, text: buffer })
    }

    return chunks
  }

  private splitIntoSentences(text: string): string[] {
    // Loại bỏ khoảng trắng đầu/cuối, rồi dùng regex tách câu.
    const raw = text.trim()
    // Regex: tìm các nhóm kết thúc bằng dấu . ! ? và giữ ký tự đó
    const sentences = raw.match(/[^.!?]+[.!?]+/g)
    return sentences ? sentences.map((s) => s.trim()).filter(Boolean) : [raw]
  }

  private async tokenize(text: string): Promise<number[]> {
    const tokenizer = await this.getTokenizer()
    const encoded = tokenizer.encode(text)
    return encoded
  }

  private async normalize(text: string): Promise<string> {
    const tokenizer = await this.getTokenizer()
    return tokenizer.normalizer.normalize(text)
  }

  private async getLastTokens(text: string, overlap: number): Promise<string> {
    // Bước 1: encode toàn bộ buffer
    const tokenizer = await this.getTokenizer()
    const encoded = tokenizer.encode(text)

    // Bước 2: lấy overlap token cuối
    const lastIds = encoded.slice(-overlap)

    // Bước 3: decode lại thành text (string) — ta sẽ tận dụng tokenizer.decode
    // Lưu ý decode có thể tạo ra thêm khoảng trắng; ta trim lại
    const decoded = tokenizer.decode(lastIds, {
      skip_special_tokens: true,
    })
    return decoded.trim()
  }
}
