export type BookmarkCategory = 'article' | 'video' | 'tool' | 'product' | 'code' | 'doc' | 'other';

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon: string;
  coverImage?: string;
  category: BookmarkCategory;
  tags: string[];
  collectionId: string;
  notes: string;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  readStatus: 'unread' | 'reading' | 'read';
  rating: number; // 0 to 5
  aiSummary: string;
  aiKeyTakeaways: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export type ViewMode = 'grid' | 'list' | 'kanban';

export type SortOption = 'newest' | 'oldest' | 'title' | 'rating';

export interface FilterOptions {
  searchQuery: string;
  selectedCategory: string; // 'all' or BookmarkCategory
  selectedTags: string[];
  selectedCollection: string; // 'all' or collectionId
  viewMode: ViewMode;
  sortBy: SortOption;
  favoriteOnly: boolean;
  pinnedOnly: boolean;
  archivedOnly: boolean;
  readStatus: 'all' | 'unread' | 'reading' | 'read';
}

export interface SyncState {
  syncCode: string;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  isOnline: boolean;
  connectedDevicesCount: number;
}
