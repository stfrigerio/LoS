import { TagData } from '@los/shared/src/types/TagsAndDescriptions';

export type UseTagsAndDescriptionsType = () => {
  type: string;
  setType: React.Dispatch<React.SetStateAction<string>>;
  recordText: string;
  setRecordText: React.Dispatch<React.SetStateAction<string>>;
  emoji: string;
  setEmoji: React.Dispatch<React.SetStateAction<string>>;
  linkedTag: string;
  setLinkedTag: React.Dispatch<React.SetStateAction<string>>;
  items: TagData[];
  collapsedSections: { [key: string]: boolean };
  handleDeleteItem: (id: number, deleteAssociated: boolean) => Promise<void>;
  handleAddOrUpdateItem: (newItem: TagData) => Promise<TagData[]>;
  toggleSection: (section: string) => void;
  fetchItems: () => Promise<TagData[]>;
  getTagsForSelection: any;
};