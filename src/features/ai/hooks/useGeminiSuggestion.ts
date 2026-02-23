import { useState, useCallback } from 'react';
import { getSuggestedICE } from '../services/geminiClient';
import { useAppState } from '../../../app/useAppState';
import type { SuggestionResult } from '../services/geminiClient';

type SuggestionStatus = 'idle' | 'loading' | 'success' | 'error';

export type UseGeminiSuggestionResult = {
  status: SuggestionStatus;
  error: string | null;
  suggestion: SuggestionResult | null;
  suggest: (title: string, description: string) => Promise<SuggestionResult | null>;
};

export function useGeminiSuggestion(): UseGeminiSuggestionResult {
  const { state } = useAppState();
  const [status, setStatus] = useState<SuggestionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestionResult | null>(null);

  const suggest = useCallback(
    async (title: string, description: string): Promise<SuggestionResult | null> => {
      setStatus('loading');
      setError(null);
      setSuggestion(null);

      try {
        const result = await getSuggestedICE(
          state.settings.geminiApiKey,
          title,
          description,
        );
        setSuggestion(result);
        setStatus('success');
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error desconocido.';
        setError(message);
        setStatus('error');
        alert(`No se pudo obtener sugerencia de IA: ${message}`);
        return null;
      }
    },
    [state.settings.geminiApiKey],
  );

  return { status, error, suggestion, suggest };
}
