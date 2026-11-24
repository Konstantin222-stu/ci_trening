import { Injectable } from '@nestjs/common';

export interface TaskItem {
  id: number;
  title: string;
  done: boolean;
}

@Injectable()
export class TasksService {
  private tasks: TaskItem[] = [];
  private nextId = 1;

  findAll(): TaskItem[] {
    return this.tasks;
  }

  create(title: string): TaskItem {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      throw new Error('Title cannot be empty');
    }

    const item: TaskItem = {
      id: this.nextId++,
      title: cleanTitle,
      done: false,
    };
    this.tasks.push(item);
    return item;
  }

  toggle(id: number): TaskItem | null {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) {
      return null;
    }
    task.done = !task.done;
    return task;
  }
}