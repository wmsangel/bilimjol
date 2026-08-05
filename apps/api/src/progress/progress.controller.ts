import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ProgressService } from "./progress.service";
import { syncSchema, type SyncDto } from "./dto";

@UseGuards(JwtAuthGuard)
@Controller("children/:childId")
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get("state")
  getState(@CurrentUser() userId: string, @Param("childId") childId: string) {
    return this.progress.getState(userId, childId);
  }

  @Post("sync")
  sync(
    @CurrentUser() userId: string,
    @Param("childId") childId: string,
    @Body(new ZodValidationPipe(syncSchema)) body: SyncDto,
  ) {
    return this.progress.sync(userId, childId, body);
  }
}
