import type { PersistedState } from '../../../shared/types/app.types';
import type { PersistencePort } from '../ports/persistence.port';

const STORAGE_KEY = 'iceTasksApp';

export class LocalStorageAdapter implements PersistencePort {
  async loadData(): Promise<PersistedState | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PersistedState;
    } catch {
      return null;
    }
  }

  async saveData(state: PersistedState): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        alert('No se pudo guardar el estado: almacenamiento local lleno.');
      }
    }
  }
}
