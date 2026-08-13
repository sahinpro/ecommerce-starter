export type MediaAsset = {
  id: string;
  url: string;
  public_id: string;
  folder: string;
  content_hash: string;
  bytes: number;
  width: number;
  height: number;
  alt: string | null;
  created_at: string;
  updated_at: string;
  /** Populated on list when requested */
  usage_count?: number;
};

export type MediaAssetCreateInput = {
  url: string;
  public_id: string;
  folder: string;
  content_hash: string;
  bytes: number;
  width: number;
  height: number;
  alt?: string | null;
};

export type MediaListFilters = {
  search?: string;
  folder?: string;
};
