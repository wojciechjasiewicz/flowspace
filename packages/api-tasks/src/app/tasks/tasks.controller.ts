import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import type { z } from 'zod';
import { AuthGuard } from '@flowspace/auth';
import { ZodValidationPipe } from '@flowspace/nest-utils';
import { TasksService } from './tasks.service.js';
import { createTaskSchema, updateTaskSchema } from './tasks.schemas.js';

type CreateTaskBody = z.infer<typeof createTaskSchema>;
type UpdateTaskBody = z.infer<typeof updateTaskSchema>;

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  list() {
    return this.tasksService.list();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findById(id);
  }

  @Post()
  create(@Body(new ZodValidationPipe(createTaskSchema)) body: CreateTaskBody) {
    return this.tasksService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(updateTaskSchema)) body: UpdateTaskBody) {
    return this.tasksService.update(id, body);
  }
}
