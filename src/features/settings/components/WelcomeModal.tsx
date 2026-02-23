import { useState } from 'react';
import type { ReactElement } from 'react';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { useAppState } from '../../../app/useAppState';

export function WelcomeModal(): ReactElement {
  const { dispatch } = useAppState();
  const [apiKey, setApiKey] = useState('');

  function handleOmit() {
    dispatch({ type: 'SET_WELCOME_SEEN', payload: { seen: true } });
  }

  function handleSaveAndStart() {
    if (apiKey.trim()) {
      dispatch({
        type: 'UPDATE_API_KEY',
        payload: { geminiApiKey: apiKey },
      });
    }
    dispatch({ type: 'SET_WELCOME_SEEN', payload: { seen: true } });
  }

  return (
    <Modal isOpen onClose={() => {}} title="Bienvenido a Gestor ICE">
      <div className="flex flex-col gap-6">
        {/* Intro text */}
        <div className="flex flex-col gap-2 text-sm text-gray-700">
          <p>
            Gestor ICE te ayuda a priorizar tareas usando el método ICE (Impact, Confidence, Ease).
          </p>
          <p>
            Puedes usar inteligencia artificial de Google Gemini para sugerir valores ICE automáticamente.
          </p>
        </div>

        {/* API Key input */}
        <div className="flex flex-col gap-3 rounded-lg bg-blue-50 p-4">
          <p className="text-sm font-medium text-gray-900">Configurar Gemini (Opcional)</p>
          <Input
            id="welcome-api-key"
            label="API Key de Google Gemini"
            value={apiKey}
            onChange={setApiKey}
            placeholder="Pega tu API Key aquí..."
          />
          <a
            href="https://ai.google.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Obtener API Key gratis →
          </a>
          <p className="text-xs text-gray-600">
            ⚠️ <span className="font-semibold">Seguridad:</span> Tu API Key se guarda localmente en el navegador.
            No la compartas ni la subas a control de versiones. Úsala solo en variables de entorno.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleOmit}>
            Omitir
          </Button>
          <Button onClick={handleSaveAndStart}>Guardar y Comenzar</Button>
        </div>
      </div>
    </Modal>
  );
}
