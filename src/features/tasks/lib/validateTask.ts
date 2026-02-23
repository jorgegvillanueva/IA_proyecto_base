const TITLE_MAX_LENGTH = 200;
const ICE_MIN = 0;
const ICE_MAX = 10;

export type TaskErrors = {
  title?: string;
  impact?: string;
  confidence?: string;
  ease?: string;
};

export type TaskValidation = {
  isValid: boolean;
  errors: TaskErrors;
};

function validateIceField(
  value: number | null,
  fieldName: string,
): string | undefined {
  if (value === null) return undefined;
  if (!Number.isInteger(value) || value < ICE_MIN || value > ICE_MAX) {
    return `${fieldName} debe ser un número entero entre ${ICE_MIN} y ${ICE_MAX}.`;
  }
  return undefined;
}

export function validateTask(
  title: string,
  impact: number | null,
  confidence: number | null,
  ease: number | null,
): TaskValidation {
  const errors: TaskErrors = {};

  if (!title.trim()) {
    errors.title = 'El título es obligatorio.';
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `El título no puede superar ${TITLE_MAX_LENGTH} caracteres.`;
  }

  const impactError = validateIceField(impact, 'Impact');
  if (impactError) errors.impact = impactError;

  const confidenceError = validateIceField(confidence, 'Confidence');
  if (confidenceError) errors.confidence = confidenceError;

  const easeError = validateIceField(ease, 'Ease');
  if (easeError) errors.ease = easeError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
