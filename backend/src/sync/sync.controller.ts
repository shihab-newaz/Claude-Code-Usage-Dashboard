import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SyncService } from "./sync.service";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

@Controller("sync")
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@UploadedFile() file: Express.Multer.File): { message: string } {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    // Save to temp dir and sync
    const tempPath = path.join(os.tmpdir(), file.originalname);
    fs.writeFileSync(tempPath, file.buffer);

    this.syncService.syncFromDirectory(path.dirname(tempPath));

    fs.unlinkSync(tempPath);

    return { message: "Sync complete" };
  }
}
