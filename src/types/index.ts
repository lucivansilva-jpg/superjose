export type VideoSourceType = 'upload' | 'youtube' | 'url' | 'recorded' | 'demo';

export interface VideoConfig {
  type: VideoSourceType;
  src: string; // URL, blob URL or YouTube embed URL
  youtubeId?: string;
  originalName?: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  fit: 'cover' | 'contain';
  caption?: string;
  updatedAt: number;
}

export interface GuestRSVP {
  id: string;
  name: string;
  phone: string;
  adults: number;
  children: number;
  attendance: 'yes' | 'no';
  notes?: string;
  timestamp: number;
}

export interface GiftOption {
  id: string;
  category: string;
  label: string;
  details: string;
  suggestedSizes?: string;
  claimedBy?: string;
  icon: 'shirt' | 'shoe' | 'sparkles' | 'gift';
}
