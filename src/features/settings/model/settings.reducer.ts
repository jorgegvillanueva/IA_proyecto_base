import type { Settings } from './settings.types';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

export type SettingsAction =
  | { type: 'UPDATE_API_KEY'; payload: { geminiApiKey: string } }
  | { type: 'SET_WELCOME_SEEN'; payload: { seen: boolean } };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function settingsReducer(
  state: Settings,
  action: SettingsAction,
): Settings {
  switch (action.type) {
    case 'UPDATE_API_KEY':
      return { ...state, geminiApiKey: action.payload.geminiApiKey };

    case 'SET_WELCOME_SEEN':
      return { ...state, hasSeenWelcome: action.payload.seen };
  }
}
