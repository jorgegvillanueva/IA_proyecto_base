import type { PersistedState } from '../../../shared/types/app.types';
import type { PersistencePort } from '../ports/persistence.port';

export class PostgresAdapter implements PersistencePort {
  async loadData(): Promise<PersistedState | null> {
    throw new Error('No implementado');
  }

  async saveData(_state: PersistedState): Promise<void> {
    throw new Error('No implementado');
  }
}
