
export interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  fullName?: string | null;
  notes?: string | null;
  hasCustomLock?: boolean;
}

export interface Message {
  id: string;
  contactId: string;
  text: string;
  sent: boolean;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'audio' | 'video';
  mediaUrl?: string;
  duration?: number; // Para mensajes de audio
}

export interface Request {
  id: string;
  username: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  expirationDate?: string;
}

export type AppView = 'list' | 'conversation' | 'new' | 'requests' | 'settings' | 'directory' | 'contactLock';

export type MediaCaptureMode = 'image' | 'audio' | 'video' | null;
