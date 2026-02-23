import { useState } from 'react';
import type { ReactElement } from 'react';
import type { Task, TaskStatus } from '../model/task.types';
import { getIceBadgeColor } from '../lib/ice';
import { useAppState } from '../../../app/useAppState';

const STATUS_ICON: Record<TaskStatus, string> = {
  esperando: '○',
  en_curso: '◐',
  hecha: '☑',
};

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  esperando: 'en_curso',
  en_curso: 'hecha',
  hecha: 'esperando',
};

type TaskCardProps = {
  task: Task;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps): ReactElement {
  const { dispatch } = useAppState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleStatusClick() {
    dispatch({
      type: 'CHANGE_STATUS',
      payload: { id: task.id, status: STATUS_CYCLE[task.status] },
    });
  }

  function handleEdit() {
    setIsMenuOpen(false);
    onEdit(task.id);
  }

  function handleDelete() {
    setIsMenuOpen(false);
    onDelete(task.id);
  }

  const badgeColor = task.iceScore > 0 ? getIceBadgeColor(task.iceScore) : 'text-gray-400';

  return (
    <div className="relative flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStatusClick}
            className="text-xl leading-none text-gray-500 hover:text-primary transition"
            aria-label={`Estado: ${task.status}. Cambiar estado`}
          >
            {STATUS_ICON[task.status]}
          </button>
          <span className={`text-sm font-bold tabular-nums ${badgeColor}`}>
            {task.iceScore > 0 ? task.iceScore.toFixed(1) : '—'}
          </span>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Opciones"
          >
            ⋮
          </button>
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
                role="presentation"
              />
              <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-gray-50"
                >
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-sm font-semibold text-gray-900 leading-snug">{task.title}</h3>
      {task.description && (
        <p className="line-clamp-2 text-xs text-gray-500">{task.description}</p>
      )}
    </div>
  );
}
