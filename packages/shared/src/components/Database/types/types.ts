// Represents a single row in any table
export type Row = Record<string, any>;

// Represents the structure of a single table
export type Table = Row[];

// Represents the entire database structure
export type TableData = {
  [tableName: string]: Table;
};

export type Change = {
  type: 'added' | 'modified' | 'removed' | 'duplicated';
  item: any;
};

export type MergeResult<T> = {
  merged: T[];
  changes: Change[]; 
};

export interface NoteDetail {
  previousNote: Record<string, any> | null;
  newNote: Record<string, any> | null;
  message: string;
}

export interface TableStats {
  processed: number;
  successful: {
    number: number;
    notes: Record<string, NoteDetail>;
  };
  failed: {
    number: number;
    notes: Record<string, NoteDetail>;
  };
  created: {
    number: number;
    notes: Record<string, NoteDetail>;
  };
  updated: {
    number: number;
    notes: Record<string, NoteDetail>;
  };
  skipped: {
    number: number;
    notes: Record<string, NoteDetail>;
  };
}

export interface SyncSummary {
  tables: Record<string, TableStats>;
  totals: {
    processed: number;
    successful: number;
    failed: number;
    created: number;
    updated: number;
    skipped: number;
  };
  errors: {
    table: string;
    uuid: string;
    message: string;
  }[];
  clientErrors: {
    table: string;
    message: string;
    items?: any[];
  }[];
}