import type { Task } from '../../features/tasks/model/task.types';
import type { Settings } from '../../features/settings/model/settings.types';

export interface PersistedState {
  tasks: Task[];
  settings: Settings;
}
