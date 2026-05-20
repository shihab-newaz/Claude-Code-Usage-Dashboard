import { Controller, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SyncService } from "./sync.service";
import { ApiKeyGuard } from "../common/api-key.guard";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import "multer";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

@Controller("sync")
@UseGuards(ApiKeyGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        cb(null, path.extname(file.originalname).toLowerCase() === ".jsonl");
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File): { message: string } {
    if (!file) {
      throw new BadRequestException("No file uploaded or file type not allowed (must be .jsonl)");
    }

    const safeName = `${crypto.randomUUID()}-${path.basename(file.originalname)}`;
    const tempPath = path.join(os.tmpdir(), safeName);
    fs.writeFileSync(tempPath, file.buffer);

    try {
      this.syncService.syncFromDirectory(path.dirname(tempPath));
    } finally {
      fs.unlinkSync(tempPath);
    }

    return { message: "Sync complete" };
  }
}
