import type { Task, TaskStatus } from './task.types';

export type GroupedTasks = Record<TaskStatus, Task[]>;

/**
 * Sorts tasks within a group:
 * 1. Tasks with iceScore > 0: sorted by iceScore desc, then createdAt asc.
 * 2. Tasks with iceScore === 0: sorted by createdAt asc.
 */
function sortGroup(tasks: Task[]): Task[] {
  const withScore = tasks
    .filter((t) => t.iceScore > 0)
    .sort((a, b) => {
      if (b.iceScore !== a.iceScore) return b.iceScore - a.iceScore;
      return a.createdAt.localeCompare(b.createdAt);
    });

  const withoutScore = tasks
    .filter((t) => t.iceScore === 0)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return [...withScore, ...withoutScore];
}

export function selectTasksGroupedByStatus(tasks: Task[]): GroupedTasks {
  const groups: GroupedTasks = {
    esperando: [],
    en_curso: [],
    hecha: [],
  };

  for (const task of tasks) {
    groups[task.status].push(task);
  }

  return {
    esperando: sortGroup(groups.esperando),
    en_curso: sortGroup(groups.en_curso),
    hecha: sortGroup(groups.hecha),
  };
}
