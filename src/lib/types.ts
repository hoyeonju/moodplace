export interface Region {
  id: string;
  name: string;
  mood_tags: string[];
  center_lat: number;
  center_lng: number;
  description: string;
  image_url: string;
}

export interface Place {
  id: string;
  name: string;
  category: "카페" | "음식점" | "기타";
  region: string;
  address: string;
  lat: number;
  lng: number;
  mood_tags: string[];
  phone: string;
  place_url: string;
}

export type CategoryFilter = "전체" | "카페" | "음식점" | "기타";
export type ViewMode = "map" | "list";
