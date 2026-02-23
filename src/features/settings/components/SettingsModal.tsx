import { useState } from 'react';
import type { ReactElement } from 'react';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { useAppState } from '../../../app/useAppState';

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps): ReactElement {
  const { state, dispatch } = useAppState();
  const [apiKey, setApiKey] = useState(state.settings.geminiApiKey);

  function handleSave() {
    dispatch({
      type: 'UPDATE_API_KEY',
      payload: { geminiApiKey: apiKey },
    });
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración">
      <div className="flex flex-col gap-4">
        {/* API Key section */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-900">Google Gemini API Key</p>
          <Input
            id="settings-api-key"
            value={apiKey}
            onChange={setApiKey}
            placeholder="Pega tu API Key aquí..."
          />
          <p className="text-xs text-gray-600">
            ⚠️ <span className="font-semibold">Seguridad:</span> Tu API Key se guarda localmente en el navegador.
            No la compartas ni la subas a control de versiones. Úsala solo en variables de entorno.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </div>
      </div>
    </Modal>
  );
}
