
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '😍', '🥰', '😘']
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👌', '👋', '🤝', '👏', '🙌', '🙏', '🤲', '👐', '🤟', '🤘', '👉', '👈', '👆', '👇']
  },
  {
    name: 'Animals',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔']
  },
  {
    name: 'Food',
    emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑']
  },
  {
    name: 'Travel',
    emojis: ['🚗', '✈️', '🚢', '🚂', '🚲', '⛵', '🛴', '🏍️', '🚁', '🚀', '🛸', '🏝️', '🗻', '🏙️', '🌋', '🏠']
  }
];

interface EmojiKeyboardProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EmojiKeyboard: React.FC<EmojiKeyboardProps> = ({ onSelectEmoji, onClose }) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = React.useState(0);

  return (
    <div className="absolute bottom-16 left-0 right-0 bg-white border shadow-lg rounded-t-lg z-10 animate-slide-up">
      <div className="flex items-center justify-between border-b p-2">
        <h3 className="text-sm font-medium">{t('emoji.title') || 'Emojis'}</h3>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          ✕
        </button>
      </div>
      
      <div className="max-h-64 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-2">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, idx) => (
            <button 
              key={idx}
              onClick={() => onSelectEmoji(emoji)}
              className="text-2xl hover:bg-gray-100 p-2 rounded-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between bg-gray-50 p-2 border-t">
        {EMOJI_CATEGORIES.map((category, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveCategory(idx)}
            className={`p-2 rounded-full ${activeCategory === idx ? 'bg-messenger-primary text-white' : 'text-gray-500'}`}
            title={category.name}
          >
            {category.emojis[0]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiKeyboard;
