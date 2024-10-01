export interface TagData {
  id?: number;
  uuid?: string;
  text: string;
  type: string;
  emoji: string;
  linkedTag: string | null;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}