"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import type { Region } from "@/lib/types";

function RecommendContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mood = searchParams.get("mood") || "";
  const regionsParam = searchParams.get("regions");
  const tagsParam = searchParams.get("tags");

  let regions: Region[] = [];
  let tags: string[] = [];

  try {
    regions = regionsParam ? JSON.parse(regionsParam) : [];
    tags = tagsParam ? JSON.parse(tagsParam) : [];
  } catch {
    regions = [];
    tags = [];
  }

  const handleRegionClick = (region: Region) => {
    const params = new URLSearchParams({
      region: region.name,
      lat: String(region.center_lat),
      lng: String(region.center_lng),
    });
    router.push(`/places?${params.toString()}`);
  };

  if (regions.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <p className="text-zinc-500 mb-6">추천 결과를 찾을 수 없어요.</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 border border-zinc-300 rounded-full hover:border-black transition-colors"
        >
          다시 입력하기
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* 상단 느낌 요약 */}
        <p className="text-sm text-zinc-400 mb-1">당신의 느낌</p>
        <p className="text-base text-zinc-700 mb-2">&ldquo;{mood}&rdquo;</p>
        <div className="flex gap-1.5 mb-8">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-6">이런 동네는 어때요?</h2>

        {/* 지역 카드 */}
        <div className="flex flex-col gap-4">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => handleRegionClick(region)}
              className="group relative w-full h-48 rounded-2xl overflow-hidden text-left border-2 border-transparent hover:border-black transition-all"
            >
              {/* 배경 그라데이션 (이미지 대체) */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

              <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">{region.name}</h3>
                <p className="text-sm text-white/80">{region.description}</p>
                <div className="flex gap-1.5 mt-3">
                  {region.mood_tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-white/20 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 다시 입력하기 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 border border-zinc-300 rounded-full text-sm text-zinc-600 hover:border-black hover:text-black transition-colors"
          >
            다시 입력하기
          </button>
        </div>
      </div>
    </main>
  );
}

export default function RecommendPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center">
          <p className="text-zinc-400">로딩 중...</p>
        </main>
      }
    >
      <RecommendContent />
    </Suspense>
  );
}
