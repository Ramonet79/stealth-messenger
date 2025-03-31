
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
  description: string;
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
    { id: 'calculator', name: 'Calculadora', icon: '🧮', description: 'Disfrazada como una calculadora funcional' },
    { id: 'weather', name: 'Tiempo', icon: '🌤️', description: 'Aplicación del clima con información real' },
    { id: 'radar', name: 'Radares', icon: '🚗', description: 'Información sobre radares de tráfico' },
    { id: 'browser', name: 'Navegador', icon: '🌐', description: 'Un navegador web simple' },
    { id: 'notes', name: 'Notas', icon: '📝', description: 'Una aplicación de notas funcional' },
    { id: 'fitness', name: 'Fitness', icon: '🏃', description: 'Seguimiento de actividad física' },
    { id: 'scanner', name: 'Scanner', icon: '📄', description: 'Herramienta de escaneo de documentos' },
    { id: 'converter', name: 'Conversor', icon: '🔄', description: 'Conversor de unidades y divisas' },
    { id: 'flashlight', name: 'Linterna', icon: '🔦', description: 'Control de la linterna del dispositivo' },
    { id: 'calendar', name: 'Calendario', icon: '📅', description: 'Un calendario interactivo' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Seleccionar tema de camuflaje</h2>
          <p className="text-sm text-gray-500 mt-1">Cada tema es una aplicación funcional para mayor discreción</p>
        </div>
        
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className={`flex flex-col items-start p-3 rounded-lg border ${
                  currentTheme === theme.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center w-full mb-2">
                  <div className="h-8 w-8 flex items-center justify-center text-2xl mr-3">
                    {theme.icon}
                  </div>
                  <div className="flex-1 text-left">{theme.name}</div>
                  {currentTheme === theme.id && (
                    <Check size={18} className="text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">{theme.description}</p>
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
