import { useState } from 'react';
import type { ReactElement } from 'react';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { useAppState } from '../../../app/useAppState';
import { calculateIceScore } from '../lib/ice';
import { validateTask } from '../lib/validateTask';

type TaskModalProps = {
  /** When provided, the modal is in edit mode for this task id. */
  taskId?: string;
  onClose: () => void;
};

function parseIceField(raw: string): number | null {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function TaskModal({ taskId, onClose }: TaskModalProps): ReactElement {
  const { state, dispatch } = useAppState();
  const isEditing = taskId !== undefined;
  const existingTask = isEditing ? state.tasks.find((t) => t.id === taskId) : undefined;

  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(existingTask?.description ?? '');
  const [impactRaw, setImpactRaw] = useState(existingTask?.impact?.toString() ?? '');
  const [confidenceRaw, setConfidenceRaw] = useState(existingTask?.confidence?.toString() ?? '');
  const [easeRaw, setEaseRaw] = useState(existingTask?.ease?.toString() ?? '');

  const impact = parseIceField(impactRaw);
  const confidence = parseIceField(confidenceRaw);
  const ease = parseIceField(easeRaw);

  const liveScore = calculateIceScore(impact, confidence, ease);
  const validation = validateTask(title, impact, confidence, ease);

  function handleSave() {
    if (!validation.isValid) return;
    if (isEditing && taskId) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: { id: taskId, title, description, impact, confidence, ease },
      });
    } else {
      dispatch({ type: 'ADD_TASK', payload: { title, description, impact, confidence, ease } });
    }
    onClose();
  }

  return (
    <Modal isOpen onClose={onClose} title={isEditing ? 'Editar tarea' : 'Nueva tarea'}>
      <div className="flex flex-col gap-4">
        {/* Title */}
        <Input
          id="task-title"
          label="Título *"
          value={title}
          onChange={setTitle}
          maxLength={200}
          showCounter
          placeholder="Describe la tarea..."
        />
        {validation.errors.title && (
          <p className="text-xs text-danger">{validation.errors.title}</p>
        )}

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label htmlFor="task-description" className="text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Detalles opcionales..."
          />
        </div>

        {/* ICE fields */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <Input
              id="task-impact"
              label="Impact (0–10)"
              value={impactRaw}
              onChange={setImpactRaw}
              placeholder="—"
            />
            {validation.errors.impact && (
              <p className="text-xs text-danger">{validation.errors.impact}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Input
              id="task-confidence"
              label="Confidence (0–10)"
              value={confidenceRaw}
              onChange={setConfidenceRaw}
              placeholder="—"
            />
            {validation.errors.confidence && (
              <p className="text-xs text-danger">{validation.errors.confidence}</p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Input
              id="task-ease"
              label="Ease (0–10)"
              value={easeRaw}
              onChange={setEaseRaw}
              placeholder="—"
            />
            {validation.errors.ease && (
              <p className="text-xs text-danger">{validation.errors.ease}</p>
            )}
          </div>
        </div>

        {/* Live ICE score */}
        <p className="text-sm text-gray-600">
          ICE Score:{' '}
          <span className="font-bold text-gray-900">
            {liveScore > 0 ? liveScore.toFixed(1) : '—'}
          </span>
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!validation.isValid}>
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
