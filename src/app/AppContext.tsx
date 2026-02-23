import { createContext } from 'react';
import type { Dispatch } from 'react';
import type { AppState } from '../shared/types/app.types';
import type { TaskAction } from '../features/tasks/model/task.reducer';
import type { SettingsAction } from '../features/settings/model/settings.reducer';

export type AppAction = TaskAction | SettingsAction;

export type AppContextValue = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
};

export const AppContext = createContext<AppContextValue | null>(null);
