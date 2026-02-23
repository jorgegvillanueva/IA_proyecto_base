import { calculateIceScore } from '../lib/ice';
import { generateId, nowISO } from '../../../shared/lib/utils';
import type { Task, TaskStatus } from './task.types';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

export type AddTaskPayload = {
  title: string;
  description: string;
  impact: number | null;
  confidence: number | null;
  ease: number | null;
  aiJustification?: string;
};

export type UpdateTaskPayload = {
  id: string;
  title: string;
  description: string;
  impact: number | null;
  confidence: number | null;
  ease: number | null;
  aiJustification?: string;
};

export type TaskAction =
  | { type: 'ADD_TASK'; payload: AddTaskPayload }
  | { type: 'UPDATE_TASK'; payload: UpdateTaskPayload }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'CHANGE_STATUS'; payload: { id: string; status: TaskStatus } };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'ADD_TASK': {
      const { title, description, impact, confidence, ease, aiJustification } =
        action.payload;
      const now = nowISO();
      const newTask: Task = {
        id: generateId(),
        title,
        description,
        impact,
        confidence,
        ease,
        iceScore: calculateIceScore(impact, confidence, ease),
        ...(aiJustification !== undefined ? { aiJustification } : {}),
        status: 'esperando',
        createdAt: now,
        updatedAt: now,
      };
      return [...state, newTask];
    }

    case 'UPDATE_TASK': {
      const { id, title, description, impact, confidence, ease, aiJustification } =
        action.payload;
      return state.map((task) => {
        if (task.id !== id) return task;
        return {
          ...task,
          title,
          description,
          impact,
          confidence,
          ease,
          iceScore: calculateIceScore(impact, confidence, ease),
          ...(aiJustification !== undefined ? { aiJustification } : {}),
          updatedAt: nowISO(),
        };
      });
    }

    case 'DELETE_TASK': {
      return state.filter((task) => task.id !== action.payload.id);
    }

    case 'CHANGE_STATUS': {
      return state.map((task) => {
        if (task.id !== action.payload.id) return task;
        return {
          ...task,
          status: action.payload.status,
          updatedAt: nowISO(),
        };
      });
    }
  }
}
