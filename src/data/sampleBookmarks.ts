import { Bookmark, Collection } from '../types';

export const INITIAL_COLLECTIONS: Collection[] = [
  { id: 'work', name: '仕事・プロジェクト', icon: 'Briefcase', color: 'bg-blue-500' },
  { id: 'tech', name: 'AI・プログラミング', icon: 'Code', color: 'bg-purple-500' },
  { id: 'design', name: 'デザイン・UI/UX', icon: 'Palette', color: 'bg-pink-500' },
  { id: 'learning', name: '学習・読書メモ', icon: 'BookOpen', color: 'bg-emerald-500' },
  { id: 'shopping', name: '買い物・行きたい場所', icon: 'ShoppingBag', color: 'bg-amber-500' },
];

export const INITIAL_BOOKMARKS: Bookmark[] = [];
