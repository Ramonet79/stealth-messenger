import React, { useState } from 'react';
import { Settings, Search, Plus, MoreVertical, Trash2, ChevronLeft } from 'lucide-react';

interface NotesAppProps {
  onSettingsClick: () => void;
  hasUnreadMessages?: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  color: string;
}

const NotesApp: React.FC<NotesAppProps> = ({ onSettingsClick, hasUnreadMessages = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showNoteDetail, setShowNoteDetail] = useState(false);
  
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Lista de compras',
      content: 'Leche, Pan, Huevos, Fruta, Verduras, Carne',
      date: '20 Jun',
      color: 'bg-yellow-100'
    },
    {
      id: '2',
      title: 'Ideas para proyecto',
      content: 'Implementar autenticación, Rediseñar la página principal, Mejorar el rendimiento',
      date: '18 Jun',
      color: 'bg-blue-100'
    },
    {
      id: '3',
      title: 'Recordatorios',
      content: 'Llamar al médico, Pagar facturas, Reservar hotel para vacaciones',
      date: '16 Jun',
      color: 'bg-green-100'
    },
    {
      id: '4',
      title: 'Películas para ver',
      content: 'Interestelar, El Padrino, Pulp Fiction, Matrix, El Señor de los Anillos',
      date: '12 Jun',
      color: 'bg-pink-100'
    },
  ]);

  const filteredNotes = searchQuery 
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;
  
  const selectedNote = selectedNoteId 
    ? notes.find(note => note.id === selectedNoteId) 
    : null;

  const handleNoteClick = (noteId: string) => {
    setSelectedNoteId(noteId);
    setShowNoteDetail(true);
  };

  const handleBackFromDetail = () => {
    setShowNoteDetail(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {showNoteDetail && selectedNote ? (
        // Note Detail View
        <div className={`flex flex-col h-full ${selectedNote.color}`}>
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b bg-white">
            <button 
              onClick={handleBackFromDetail}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex gap-2">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Trash2 size={24} />
              </button>
              <button 
                onClick={onSettingsClick} 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                <Settings size={24} />
                {hasUnreadMessages && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
          
          {/* Note Content */}
          <div className="p-4 flex-1">
            <input 
              type="text"
              className="w-full text-xl font-medium bg-transparent border-none outline-none mb-4"
              defaultValue={selectedNote.title}
            />
            <textarea 
              className="w-full h-[calc(100%-2rem)] bg-transparent border-none outline-none resize-none"
              defaultValue={selectedNote.content}
            ></textarea>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t bg-white text-sm text-gray-500">
            Editado: {selectedNote.date}
          </div>
        </div>
      ) : (
        // Notes List View
        <>
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-white border-b">
            <h1 className="text-xl font-semibold">Notas</h1>
            <button 
              onClick={onSettingsClick} 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <Settings size={24} />
              {hasUnreadMessages && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
          
          {/* Search */}
          <div className="p-4 bg-white">
            <div className="flex items-center bg-gray-100 rounded-lg p-2">
              <Search size={20} className="text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar notas" 
                className="flex-1 bg-transparent border-none outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Notes List */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {filteredNotes.map((note) => (
                <div 
                  key={note.id}
                  className={`${note.color} p-3 rounded-lg shadow-sm cursor-pointer`}
                  onClick={() => handleNoteClick(note.id)}
                >
                  <h3 className="font-medium mb-2 line-clamp-1">{note.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{note.content}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-500">{note.date}</span>
                    <button className="p-1 rounded-full hover:bg-gray-200/50">
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Button */}
          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg">
              <Plus size={20} />
              <span>Nueva nota</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotesApp;
