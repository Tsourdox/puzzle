'use client';
import { settingsAtom, showSettingsAtom } from '@/app/atoms';
import Slider from '@/components/Slider';
import Switch from '@/components/Switch';
import { getTranslation, Lang } from '@/language';
import { DEFAULT_SETTINGS, KeybindingKey } from '@/puzzle/settings';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

interface SettingsModalProps {
  lang: Lang;
}

const KEYBINDING_KEYS = Object.keys(DEFAULT_SETTINGS.keybindings) as KeybindingKey[];

export default function SettingsModal({ lang }: SettingsModalProps) {
  const t = getTranslation(lang);
  const [isOpen, setIsOpen] = useAtom(showSettingsAtom);
  const [settings, setSettings] = useAtom(settingsAtom);
  const [waitingForKey, setWaitingForKey] = useState<KeybindingKey | null>(null);

  const getKeybindingLabel = (key: KeybindingKey): string => {
    const labels: Record<KeybindingKey, string> = {
      rotateLeft: t('Rotate left'),
      rotateRight: t('Rotate right'),
      stackPieces: t('Stack pieces'),
      explodePieces: t('Explode pieces'),
      selectMultiple: t('Select multiple'),
      reconnectPieces: t('Reconnect pieces'),
    };
    return labels[key];
  };

  // Convert e.code to keyCode for p5.js compatibility
  const codeToKeyCode = (code: string): number => {
    const mapping: Record<string, number> = {
      Space: 32,
      ArrowLeft: 37,
      ArrowUp: 38,
      ArrowRight: 39,
      ArrowDown: 40,
      ShiftLeft: 16,
      ShiftRight: 16,
      ControlLeft: 17,
      ControlRight: 17,
      AltLeft: 18,
      AltRight: 18,
      Enter: 13,
    };

    // Handle letter keys (KeyA -> 65, KeyZ -> 90)
    if (code.startsWith('Key')) {
      const letter = code.charAt(3);
      return letter.charCodeAt(0);
    }

    return mapping[code] || 0;
  };

  // Handle key press when waiting for new key binding
  useEffect(() => {
    if (!waitingForKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      // Escape to cancel
      if (e.key === 'Escape') {
        setWaitingForKey(null);
        return;
      }

      // Convert e.code to keyCode for storage (p5.js compatibility)
      const keyCode = codeToKeyCode(e.code);
      const newSettings = {
        ...settings,
        keybindings: {
          ...settings.keybindings,
          [waitingForKey]: keyCode,
        },
      };
      setSettings(newSettings);

      setWaitingForKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [waitingForKey, settings, setSettings]);

  const handleRotationSpeedChange = (value: number) => {
    setSettings({
      ...settings,
      puzzle: {
        ...settings.puzzle,
        rotationSpeed: value,
      },
    });
  };

  const getKeyName = (keyCode: number): string => {
    const specialKeys: Record<number, string> = {
      32: t('Space'),
      37: '←',
      38: '↑',
      39: '→',
      40: '↓',
      16: 'Shift',
      17: 'Ctrl',
      18: 'Alt',
      13: 'Enter',
    };

    return specialKeys[keyCode] || String.fromCharCode(keyCode).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-md overflow-y-auto"
      onClick={() => setIsOpen(false)}
    >
      <div className="min-h-screen w-full p-4 md:py-12 flex items-center justify-center">
        <div
          className="relative max-w-2xl w-full bg-zinc-800/90 rounded-lg p-8 space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-zinc-700/50 rounded-full transition-colors"
          >
            <XMarkIcon width={24} height={24} className="text-zinc-300 stroke-2" />
          </button>

          <h2 className="text-3xl font-bold text-zinc-100 mb-8">{t('Settings')}</h2>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-zinc-200">{t('Puzzle')}</h3>

            <div className="space-y-2">
              <label className="text-zinc-300 text-sm font-medium">{t('Optimize for')}</label>
              <div className="flex gap-2">
                {(['low', 'normal', 'performance'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() =>
                      setSettings({
                        ...settings,
                        puzzle: { ...settings.puzzle, fpsMode: mode },
                      })
                    }
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      settings.puzzle.fpsMode === mode
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                    }`}
                  >
                    {mode === 'low'
                      ? t('Battery')
                      : mode === 'normal'
                        ? t('Balance')
                        : t('Performance')}
                  </button>
                ))}
              </div>
            </div>

            <Slider
              label={t('Rotation speed')}
              value={settings.puzzle.rotationSpeed}
              onChange={handleRotationSpeedChange}
              min={0.2}
              max={5}
              step={0.1}
              leftLabel={t('Slower')}
              rightLabel={t('Faster')}
            />

            <Slider
              label={t('Snap tolerance')}
              value={settings.puzzle.snapTolerance}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  puzzle: { ...settings.puzzle, snapTolerance: value },
                })
              }
              min={0.6}
              max={3}
              step={0.1}
              leftLabel={t('Harder')}
              rightLabel={t('Easier')}
            />

            <Switch
              label={t('Invert zoom')}
              checked={settings.puzzle.invertZoom}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  puzzle: { ...settings.puzzle, invertZoom: checked },
                })
              }
            />
          </div>

          <div className="space-y-4 pt-6 mt-6 border-t border-zinc-700">
            <h3 className="text-xl font-semibold text-zinc-200">{t('Interface')}</h3>

            <Switch
              label={t('Show puzzle action buttons')}
              checked={settings.ui.showPuzzleButtons}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  ui: { ...settings.ui, showPuzzleButtons: checked },
                })
              }
            />

            <Switch
              label={t('Show large preview')}
              checked={settings.ui.showLargePreview}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  ui: { ...settings.ui, showLargePreview: checked },
                })
              }
            />
          </div>

          <div className="space-y-4 pt-6 mt-6 border-t border-zinc-700">
            <h3 className="text-xl font-semibold text-zinc-200">{t('Network')}</h3>

            <Switch
              label={t('Show multiplayer cursors')}
              checked={settings.network.showMultiplayerCursors}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  network: { ...settings.network, showMultiplayerCursors: checked },
                })
              }
            />

            <Switch
              label={t('Show remote selections')}
              checked={settings.network.showRemoteSelections}
              onChange={(checked) =>
                setSettings({
                  ...settings,
                  network: { ...settings.network, showRemoteSelections: checked },
                })
              }
            />
          </div>

          <div className="space-y-4 pt-6 mt-6 border-t border-zinc-700">
            <h3 className="text-xl font-semibold text-zinc-200">{t('Key bindings')}</h3>

            {KEYBINDING_KEYS.map((key) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-zinc-300">{getKeybindingLabel(key)}</span>
                <button
                  onClick={() => setWaitingForKey(key)}
                  className={`px-4 py-2 rounded-md min-w-25 font-mono text-sm transition-colors ${
                    waitingForKey === key
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                  }`}
                >
                  {waitingForKey === key ? t('Press key') : getKeyName(settings.keybindings[key])}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
