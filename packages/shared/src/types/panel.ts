export interface Panel {
  id: string;
  projectId: string;
  pageIndex: number;
  order: number;
  bbox: PanelBBox;
  maskUrl?: string;
  effects: {
    parallax: number;
    glow: boolean;
    glitch: boolean;
    blur: number;
  };
  transitions: Transition[];
  createdAt: string;
  updatedAt: string;
}

export interface PanelBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Transition {
  type: string;
  duration: number;
  beatId?: string;
  easing: string;
}
