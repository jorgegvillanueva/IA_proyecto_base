import { useState } from 'react';
import { AppProvider } from './AppProvider';
import { TaskList, TaskModal, DeleteTaskDialog } from '../features/tasks/components';
import { Button } from '../shared/ui';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; taskId: string }
  | null;

function AppShell() {
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-primary">Gestor ICE</h1>
          <div className="flex items-center gap-2">
            {/* Settings placeholder — Tarea 7 */}
            <Button variant="secondary" onClick={() => {}}>
              ⚙ Settings
            </Button>
            <Button onClick={() => setModalState({ mode: 'create' })}>+ Nueva Tarea</Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl">
        <TaskList
          onEdit={(id) => setModalState({ mode: 'edit', taskId: id })}
          onDelete={(id) => setDeletingTaskId(id)}
        />
      </main>

      {/* TaskModal */}
      {modalState !== null && (
        <TaskModal
          key={modalState.mode === 'edit' ? modalState.taskId : 'create'}
          taskId={modalState.mode === 'edit' ? modalState.taskId : undefined}
          onClose={() => setModalState(null)}
        />
      )}

      {/* DeleteTaskDialog */}
      {deletingTaskId !== null && (
        <DeleteTaskDialog
          taskId={deletingTaskId}
          onClose={() => setDeletingTaskId(null)}
        />
      )}

      {/* WelcomeModal — Tarea 7 */}
      {/* SettingsModal — Tarea 7 */}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
