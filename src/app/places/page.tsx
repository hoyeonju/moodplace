"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import KakaoMap from "@/components/KakaoMap";
import type { Place, CategoryFilter, ViewMode } from "@/lib/types";

const CATEGORIES: CategoryFilter[] = ["전체", "카페", "음식점", "기타"];

function PlacesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const region = searchParams.get("region") || "";
  const centerLat = parseFloat(searchParams.get("lat") || "37.5665");
  const centerLng = parseFloat(searchParams.get("lng") || "126.9780");

  const [places, setPlaces] = useState<Place[]>([]);
  const [category, setCategory] = useState<CategoryFilter>("전체");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        region,
        lat: String(centerLat),
        lng: String(centerLng),
      });
      if (category !== "전체") params.set("category", category);

      const res = await fetch(`/api/places?${params.toString()}`);
      const data = await res.json();
      setPlaces(data.places || []);
    } catch {
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [region, category, centerLat, centerLng]);

  useEffect(() => {
    if (region) fetchPlaces();
  }, [region, category, fetchPlaces]);

  const handleWriteReview = (place: Place) => {
    const params = new URLSearchParams({
      place_id: place.id,
      place_name: place.name,
    });
    router.push(`/review?${params.toString()}`);
  };

  return (
    <main className="flex flex-1 flex-col">
      {/* 헤더 */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-black transition-colors"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{region}의 플레이스</h1>
        </div>

        {/* 카테고리 필터 + 뷰 전환 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 text-sm rounded-full border whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-black text-white border-black"
                    : "border-zinc-300 text-zinc-600 hover:border-black"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setViewMode((v) => (v === "map" ? "list" : "map"))}
            className="ml-3 px-3 py-1.5 text-sm border border-zinc-300 rounded-full hover:border-black transition-colors whitespace-nowrap"
          >
            {viewMode === "map" ? "리스트" : "지도"}
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-zinc-400">장소를 불러오는 중...</p>
        </div>
      ) : places.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-zinc-400">이 지역의 플레이스를 찾지 못했어요.</p>
        </div>
      ) : viewMode === "map" ? (
        /* 지도 뷰 */
        <div className="flex flex-col flex-1">
          <div className="flex-1 min-h-[50vh]">
            <KakaoMap
              centerLat={centerLat}
              centerLng={centerLng}
              places={places}
              onMarkerClick={setSelectedPlace}
            />
          </div>
          {selectedPlace && (
            <PlaceDetail place={selectedPlace} onReview={handleWriteReview} />
          )}
        </div>
      ) : (
        /* 리스트 뷰 */
        <div className="flex-1 px-6 pb-6 overflow-y-auto">
          <p className="text-sm text-zinc-400 mb-3">{places.length}개의 장소</p>
          <div className="flex flex-col gap-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="p-4 border border-zinc-200 rounded-xl hover:border-black transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs px-2 py-0.5 bg-zinc-100 rounded-full text-zinc-500">
                      {place.category}
                    </span>
                    <h3 className="font-semibold mt-1.5">{place.name}</h3>
                    <p className="text-sm text-zinc-500 mt-0.5 truncate">
                      {place.address}
                    </p>
                    {place.phone && (
                      <p className="text-sm text-zinc-400 mt-0.5">
                        {place.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {place.place_url && (
                      <a
                        href={place.place_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs border border-zinc-300 rounded-full text-center hover:border-black transition-colors"
                      >
                        상세보기
                      </a>
                    )}
                    <button
                      onClick={() => handleWriteReview(place)}
                      className="px-3 py-1.5 bg-black text-white text-xs rounded-full hover:bg-zinc-800 transition-colors"
                    >
                      후기 쓰기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function PlaceDetail({
  place,
  onReview,
}: {
  place: Place;
  onReview: (p: Place) => void;
}) {
  return (
    <div className="border-t border-zinc-200 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs px-2 py-0.5 bg-zinc-100 rounded-full text-zinc-500">
            {place.category}
          </span>
          <h3 className="text-lg font-bold mt-1">{place.name}</h3>
          <p className="text-sm text-zinc-500 mt-0.5">{place.address}</p>
          {place.phone && (
            <p className="text-sm text-zinc-400 mt-0.5">{place.phone}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {place.place_url && (
            <a
              href={place.place_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm border border-zinc-300 rounded-full text-center hover:border-black transition-colors"
            >
              상세보기
            </a>
          )}
          <button
            onClick={() => onReview(place)}
            className="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-zinc-800 transition-colors"
          >
            후기 쓰기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlacesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center">
          <p className="text-zinc-400">로딩 중...</p>
        </main>
      }
    >
      <PlacesContent />
    </Suspense>
  );
}
