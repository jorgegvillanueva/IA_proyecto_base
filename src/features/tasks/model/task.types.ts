export type TaskStatus = 'esperando' | 'en_curso' | 'hecha';

export interface Task {
  id: string;
  title: string;
  description: string;
  impact: number | null;
  confidence: number | null;
  ease: number | null;
  iceScore: number;
  aiJustification?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}
