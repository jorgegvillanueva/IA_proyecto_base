import type { PersistedState } from '../../../shared/types/app.types';

export interface PersistencePort {
  loadData(): Promise<PersistedState | null>;
  saveData(state: PersistedState): Promise<void>;
}
