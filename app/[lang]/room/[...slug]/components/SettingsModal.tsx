'use client';
import { settingsAtom, showSettingsAtom } from '@/app/atoms';
import { getTranslation, Lang } from '@/language';
import { ISetting } from '@/puzzle/utils/settings';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

interface SettingsModalProps {
  lang: Lang;
}

export default function SettingsModal({ lang }: SettingsModalProps) {
  const t = getTranslation(lang);
  const [isOpen, setIsOpen] = useAtom(showSettingsAtom);
  const [settings, setSettings] = useAtom(settingsAtom);
  const [waitingForKey, setWaitingForKey] = useState<ISetting | null>(null);

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
        [waitingForKey]: keyCode,
      };
      setSettings(newSettings);

      setWaitingForKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [waitingForKey, settings, setSettings]);

  const handleSliderChange = (key: ISetting, value: number) => {
    const newSettings = {
      ...settings,
      [key]: value,
    };
    setSettings(newSettings);
  };

  const handleToggleChange = (key: ISetting, checked: boolean) => {
    const newSettings = {
      ...settings,
      [key]: checked ? 1 : 0,
    };
    setSettings(newSettings);
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
      {/* Close button */}
      <button
        onClick={() => setIsOpen(false)}
        className="fixed top-4 right-4 z-50 p-3 bg-zinc-800/90 hover:bg-zinc-700/90 rounded-full transition-colors"
      >
        <XMarkIcon width={24} height={24} className="text-zinc-300 stroke-2" />
      </button>

      {/* Content */}
      <div className="min-h-screen w-full py-16 px-4 flex items-center justify-center">
        <div
          className="max-w-2xl w-full bg-zinc-800/90 rounded-lg p-8 space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-3xl font-bold text-zinc-100 mb-8">{t('Settings')}</h2>

          {/* Rotation Speed Slider */}
          <div className="space-y-2">
            <label className="text-zinc-300 text-sm font-medium">{t('Rotation speed')}</label>
            <input
              type="range"
              min="0.2"
              max="5"
              step="0.1"
              value={settings.rotationshastighet}
              onChange={(e) => handleSliderChange('rotationshastighet', parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="text-zinc-500 text-xs text-right">
              {settings.rotationshastighet.toFixed(1)}
            </div>
          </div>

          {/* Key Bindings */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-zinc-200 mt-6">{t('Key bindings')}</h3>

            {[
              { key: 'rotera vänster' as ISetting, label: t('Rotate left') },
              { key: 'rotera höger' as ISetting, label: t('Rotate right') },
              { key: 'stapla bitar' as ISetting, label: t('Stack pieces') },
              { key: 'sprid bitar' as ISetting, label: t('Explode pieces') },
              { key: 'markera fler' as ISetting, label: t('Select multiple') },
              { key: 'koppla om bitar' as ISetting, label: t('Reconnect pieces') },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-zinc-300">{label}</span>
                <button
                  onClick={() => setWaitingForKey(key)}
                  className={`px-4 py-2 rounded-md min-w-25 font-mono text-sm transition-colors ${
                    waitingForKey === key
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                  }`}
                >
                  {waitingForKey === key ? t('Press key') : getKeyName(settings[key])}
                </button>
              </div>
            ))}
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300">{t('Invert zoom')}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings['invertera zoom'])}
                  onChange={(e) => handleToggleChange('invertera zoom', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-300">{t('Show selection outline')}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings['visa markeringskontur'])}
                  onChange={(e) => handleToggleChange('visa markeringskontur', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-300">{t('Hide puzzle action buttons')}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(settings['dölj pusselknappar'])}
                  onChange={(e) => handleToggleChange('dölj pusselknappar', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
