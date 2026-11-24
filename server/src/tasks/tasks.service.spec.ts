import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService();
  });

  it('1. creates a task with trimmed title and done=false', () => {
    const task = service.create('  Настроить CI для сервера  ');

    expect(task).toEqual({
      id: 1,
      title: 'Настроить CI для сервера',
      done: false,
    });
    expect(service.findAll()).toHaveLength(1);
  });

  it('2. throws on empty title', () => {
    expect(() => service.create('   ')).toThrow('Title cannot be empty');
  });

  it('3. toggles task completion status', () => {
    const task = service.create('Проверить Jest');
    expect(task.done).toBe(false);

    const toggled = service.toggle(task.id);
    expect(toggled?.done).toBe(true);
  });

  it('4. returns null when toggling non-existent task', () => {
    expect(service.toggle(999)).toBeNull();
  });
});