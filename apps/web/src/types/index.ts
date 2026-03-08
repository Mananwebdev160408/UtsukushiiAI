// ── Auth Types ────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier: 'free' | 'pro' | 'elite';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}


// ── Project Types ─────────────────────────────────────────────────────

export type ProjectStatus = 'idle' | 'processing' | 'rendering' | 'completed' | 'error';

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  lastUpdated: string;
  createdAt: string;
  duration?: string;
  image?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  mangaPages: MangaPage[];
  audioInfo?: AudioInfo;
  settings: RenderSettings;
}

export interface MangaPage {
  id: string;
  url: string;
  filename: string;
  width: number;
  height: number;
  pageNumber: number;
}

export interface AudioInfo {
  id: string;
  url: string;
  filename: string;
  duration: number;
  bpm?: number;
  key?: string;
  mood?: string;
}


// ── Panel Types ───────────────────────────────────────────────────────

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Panel {
  id: string;
  index: number;
  bbox: BBox;
  imagePath?: string;
  maskPath?: string;
  depthMapPath?: string;
  transition: PanelTransition;
  animationEffect: AnimationEffect;
  duration?: number;
  label?: string;
}

export type TransitionEffect =
  | 'fade' | 'slide_left' | 'slide_right' | 'slide_up' | 'slide_down'
  | 'glitch' | 'zoom_in' | 'zoom_out' | 'dissolve' | 'wipe' | 'none';

export type AnimationEffect =
  | 'pulse' | 'breath' | 'svd' | 'parallax' | 'wiggle' | 'sway' | 'glow' | 'none';

export interface PanelTransition {
  effect: TransitionEffect;
  duration: number;
}


// ── Render Types ──────────────────────────────────────────────────────

export type QualityPreset = 'draft' | 'standard' | 'high' | 'ultra';
export type RenderJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface EffectsConfig {
  parallax: boolean;
  glow: boolean;
  zoom: boolean;
  animation: boolean;
  wiggle: boolean;
  textOverlay: boolean;
}

export interface RenderSettings {
  quality: QualityPreset;
  fps: number;
  width: number;
  height: number;
  codec: 'libx264' | 'libx265';
  effects: EffectsConfig;
  transition: TransitionEffect;
  transitionDuration: number;
}

export interface RenderJob {
  id: string;
  projectId: string;
  status: RenderJobStatus;
  progress: number;
  currentStage: string;
  message: string;
  resultUrl?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
}


// ── Timeline Types ────────────────────────────────────────────────────

export interface BeatMarker {
  time: number;
  strength: number; // 0-1
  type: 'beat' | 'onset' | 'segment';
}

export interface TimelineTrack {
  id: string;
  type: 'audio' | 'panel' | 'transition' | 'effect';
  startTime: number;
  endTime: number;
  data: Record<string, any>;
}


// ── Music Suggestion Types ────────────────────────────────────────────

export interface MusicSuggestion {
  detectedGenre: string;
  detectedMood: string;
  suggestedGenres: string[];
  suggestedBpmRange: [number, number];
  searchKeywords: string[];
  confidence: number;
  reasoning: string;
}


// ── API Response Types ────────────────────────────────────────────────

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
