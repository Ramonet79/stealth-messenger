
import React from 'react';
import { Check } from 'lucide-react';

export type AppTheme = 
  | 'calculator'
  | 'weather'
  | 'radar'
  | 'browser'
  | 'notes'
  | 'fitness'
  | 'scanner'
  | 'converter'
  | 'flashlight'
  | 'calendar';

interface ThemeOption {
  id: AppTheme;
  name: string;
  icon: string;
}

interface ThemeSelectorProps {
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  onClose
}) => {
  const themes: ThemeOption[] = [
    { id: 'calculator', name: 'Calculadora', icon: '🧮' },
    { id: 'weather', name: 'Tiempo', icon: '🌤️' },
    { id: 'radar', name: 'Radares', icon: '🚗' },
    { id: 'browser', name: 'Navegador', icon: '🌐' },
    { id: 'notes', name: 'Notas', icon: '📝' },
    { id: 'fitness', name: 'Fitness', icon: '🏃' },
    { id: 'scanner', name: 'Scanner', icon: '📄' },
    { id: 'converter', name: 'Conversor', icon: '🔄' },
    { id: 'flashlight', name: 'Linterna', icon: '🔦' },
    { id: 'calendar', name: 'Calendario', icon: '📅' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Seleccionar tema de camuflaje</h2>
        </div>
        
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className={`flex items-center p-3 rounded-lg border ${
                  currentTheme === theme.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="h-8 w-8 flex items-center justify-center text-2xl mr-3">
                  {theme.icon}
                </div>
                <div className="flex-1 text-left">{theme.name}</div>
                {currentTheme === theme.id && (
                  <Check size={18} className="text-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
