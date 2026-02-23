import { useState } from 'react';
import type { ReactElement } from 'react';
import { useAppState } from '../../../app/useAppState';
import { selectTasksGroupedByStatus } from '../model/task.selectors';
import { TaskCard } from './TaskCard';

type TaskListProps = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TaskList({ onEdit, onDelete }: TaskListProps): ReactElement {
  const { state } = useAppState();
  const [isDoneExpanded, setIsDoneExpanded] = useState(false);
  const grouped = selectTasksGroupedByStatus(state.tasks);
  const totalTasks = state.tasks.length;

  if (totalTasks === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
        <span className="text-5xl">📋</span>
        <p className="text-lg font-medium">Crea tu primera tarea</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4">
      {/* Esperando */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Esperando ({grouped.esperando.length})
        </h2>
        {grouped.esperando.length === 0 ? (
          <p className="text-xs text-gray-400">Sin tareas</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.esperando.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </section>

      {/* En Curso */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          En Curso ({grouped.en_curso.length})
        </h2>
        {grouped.en_curso.length === 0 ? (
          <p className="text-xs text-gray-400">Sin tareas</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.en_curso.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
        )}
      </section>

      {/* Hechas — colapsable */}
      <section>
        <button
          type="button"
          onClick={() => setIsDoneExpanded((prev) => !prev)}
          className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 transition"
        >
          <span>{isDoneExpanded ? '▾' : '▸'}</span>
          Hechas ({grouped.hecha.length})
        </button>
        {isDoneExpanded && (
          grouped.hecha.length === 0 ? (
            <p className="text-xs text-gray-400">Sin tareas</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 opacity-70">
              {grouped.hecha.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          )
        )}
      </section>
    </div>
  );
}
