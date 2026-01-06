
export interface Step {
  label: string;
  text: string;
}

export interface DesignTier {
  title: string;
  sub: string;
  description: string;
  color: string;
}

export enum ModalType {
  NONE,
  LOGIN,
  LEGAL,
  SUCCESS,
  AI_CHAT
}
