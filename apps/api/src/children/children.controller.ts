import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ChildrenService } from "./children.service";
import { createChildSchema, type CreateChildDto } from "./dto";

@UseGuards(JwtAuthGuard)
@Controller("children")
export class ChildrenController {
  constructor(private readonly children: ChildrenService) {}

  @Get()
  list(@CurrentUser() userId: string) {
    return this.children.list(userId);
  }

  @Post()
  create(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(createChildSchema)) dto: CreateChildDto,
  ) {
    return this.children.create(userId, dto);
  }

  @Delete(":id")
  remove(@CurrentUser() userId: string, @Param("id") id: string) {
    return this.children.remove(userId, id);
  }
}
