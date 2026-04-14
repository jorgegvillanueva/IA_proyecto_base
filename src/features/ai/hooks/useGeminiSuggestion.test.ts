import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeminiSuggestion } from './useGeminiSuggestion';
import type { SuggestionResult } from '../services/geminiClient';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockGetSuggestedICE = vi.fn();

vi.mock('../services/geminiClient', () => ({
  getSuggestedICE: (...args: unknown[]) => mockGetSuggestedICE(...args),
}));

vi.mock('../../../app/useAppState', () => ({
  useAppState: () => ({
    state: {
      tasks: [],
      settings: { geminiApiKey: 'test-api-key', hasSeenWelcome: true },
    },
    dispatch: vi.fn(),
  }),
}));

// Suppress `alert` calls originating from the hook's error path
vi.stubGlobal('alert', vi.fn());

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useGeminiSuggestion', () => {
  const fakeSuggestion: SuggestionResult = {
    impact: 8,
    confidence: 7,
    ease: 6,
    justification: 'Alta prioridad por impacto en usuarios',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- Initial state ----

  it('returns idle status and null values initially', () => {
    const { result } = renderHook(() => useGeminiSuggestion());

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeNull();
    expect(result.current.suggestion).toBeNull();
    expect(typeof result.current.suggest).toBe('function');
  });

  // ---- Successful fetch ----

  it('fetches a suggestion and transitions to success', async () => {
    mockGetSuggestedICE.mockResolvedValueOnce(fakeSuggestion);

    const { result } = renderHook(() => useGeminiSuggestion());

    let returned: SuggestionResult | null = null;
    await act(async () => {
      returned = await result.current.suggest('My task', 'Task description');
    });

    expect(mockGetSuggestedICE).toHaveBeenCalledOnce();
    expect(mockGetSuggestedICE).toHaveBeenCalledWith(
      'test-api-key',
      'My task',
      'Task description',
    );

    expect(result.current.status).toBe('success');
    expect(result.current.suggestion).toEqual(fakeSuggestion);
    expect(result.current.error).toBeNull();
    expect(returned).toEqual(fakeSuggestion);
  });

  // ---- API error handling ----

  it('handles API errors and transitions to error status', async () => {
    mockGetSuggestedICE.mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useGeminiSuggestion());

    let returned: SuggestionResult | null = null;
    await act(async () => {
      returned = await result.current.suggest('Fail task', 'desc');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Network failure');
    expect(result.current.suggestion).toBeNull();
    expect(returned).toBeNull();
  });

  it('handles non-Error thrown values with a fallback message', async () => {
    mockGetSuggestedICE.mockRejectedValueOnce('string error');

    const { result } = renderHook(() => useGeminiSuggestion());

    await act(async () => {
      await result.current.suggest('Task', 'desc');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Error desconocido.');
    expect(result.current.suggestion).toBeNull();
  });

  it('calls alert with the error message on failure', async () => {
    mockGetSuggestedICE.mockRejectedValueOnce(new Error('API quota exceeded'));

    const { result } = renderHook(() => useGeminiSuggestion());

    await act(async () => {
      await result.current.suggest('Task', 'desc');
    });

    expect(window.alert).toHaveBeenCalledWith(
      'No se pudo obtener sugerencia de IA: API quota exceeded',
    );
  });

  // ---- Loading state ----

  it('sets status to loading while the request is in progress', async () => {
    let resolvePromise!: (value: SuggestionResult) => void;
    mockGetSuggestedICE.mockReturnValueOnce(
      new Promise<SuggestionResult>((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useGeminiSuggestion());

    // Start the request but don't resolve yet
    let suggestPromise!: Promise<SuggestionResult | null>;
    act(() => {
      suggestPromise = result.current.suggest('Task', 'desc');
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.error).toBeNull();
    expect(result.current.suggestion).toBeNull();

    // Now resolve and let the hook settle
    await act(async () => {
      resolvePromise(fakeSuggestion);
      await suggestPromise;
    });

    expect(result.current.status).toBe('success');
  });

  // ---- Resets state between calls ----

  it('resets previous state when suggest is called again', async () => {
    // First call succeeds
    mockGetSuggestedICE.mockResolvedValueOnce(fakeSuggestion);

    const { result } = renderHook(() => useGeminiSuggestion());

    await act(async () => {
      await result.current.suggest('First', 'desc');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.suggestion).toEqual(fakeSuggestion);

    // Second call fails
    mockGetSuggestedICE.mockRejectedValueOnce(new Error('Timeout'));

    await act(async () => {
      await result.current.suggest('Second', 'desc');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.suggestion).toBeNull();
    expect(result.current.error).toBe('Timeout');
  });

  // ---- API key forwarding ----

  it('passes the geminiApiKey from app state to getSuggestedICE', async () => {
    mockGetSuggestedICE.mockResolvedValueOnce(fakeSuggestion);

    const { result } = renderHook(() => useGeminiSuggestion());

    await act(async () => {
      await result.current.suggest('title', 'description');
    });

    expect(mockGetSuggestedICE.mock.calls[0][0]).toBe('test-api-key');
  });
});
