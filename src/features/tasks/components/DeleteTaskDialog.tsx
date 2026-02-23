import type { ReactElement } from 'react';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { useAppState } from '../../../app/useAppState';

type DeleteTaskDialogProps = {
  taskId: string;
  onClose: () => void;
};

export function DeleteTaskDialog({ taskId, onClose }: DeleteTaskDialogProps): ReactElement {
  const { state, dispatch } = useAppState();
  const task = state.tasks.find((t) => t.id === taskId);

  function handleConfirm() {
    dispatch({ type: 'DELETE_TASK', payload: { id: taskId } });
    onClose();
  }

  return (
    <Modal isOpen onClose={onClose} title="Eliminar tarea">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-700">
            ¿Eliminar la tarea{' '}
            <span className="font-semibold text-gray-900">
              &ldquo;{task?.title ?? taskId}&rdquo;
            </span>
            ?
          </p>
          <p className="text-xs text-gray-500">Esta acción no se puede deshacer.</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            Sí, eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
