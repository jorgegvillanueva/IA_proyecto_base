import { useReducer, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AppState } from '../shared/types/app.types';
import type { TaskAction } from '../features/tasks/model/task.reducer';
import type { SettingsAction } from '../features/settings/model/settings.reducer';
import { taskReducer } from '../features/tasks/model/task.reducer';
import { settingsReducer } from '../features/settings/model/settings.reducer';
import { persistenceService } from '../services/persistence';
import { AppContext } from './AppContext';
import type { AppAction } from './AppContext';

type HydrateAction = { type: 'HYDRATE'; payload: AppState };
type InternalAction = AppAction | HydrateAction;

const DEFAULT_STATE: AppState = {
  tasks: [],
  settings: {
    geminiApiKey: '',
    hasSeenWelcome: false,
  },
};

function appReducer(state: AppState, action: InternalAction): AppState {
  if (action.type === 'HYDRATE') return action.payload;

  const isTaskAction =
    action.type === 'ADD_TASK' ||
    action.type === 'UPDATE_TASK' ||
    action.type === 'DELETE_TASK' ||
    action.type === 'CHANGE_STATUS';

  if (isTaskAction) {
    return {
      ...state,
      tasks: taskReducer(state.tasks, action as TaskAction),
    };
  }

  return {
    ...state,
    settings: settingsReducer(state.settings, action as SettingsAction),
  };
}

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  const [state, internalDispatch] = useReducer(appReducer, DEFAULT_STATE);
  const dispatch = internalDispatch as React.Dispatch<AppAction>;
  const isHydrated = useRef(false);

  // Hydrate state from persistence on mount
  useEffect(() => {
    persistenceService.loadData().then((persisted) => {
      if (persisted) {
        internalDispatch({ type: 'HYDRATE', payload: persisted });
      }
      isHydrated.current = true;
    });
  }, []);

  // Persist state on every change, but not before hydration completes
  useEffect(() => {
    if (!isHydrated.current) return;
    persistenceService.saveData(state);
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
