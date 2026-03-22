"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

const MATCH_OPTIONS = [
  { value: "매우 잘 맞음", emoji: "😍", label: "매우 잘 맞음" },
  { value: "잘 맞음", emoji: "😊", label: "잘 맞음" },
  { value: "보통", emoji: "😐", label: "보통" },
  { value: "안 맞음", emoji: "😕", label: "안 맞음" },
] as const;

function saveReview(review: {
  place_id: string;
  place_name: string;
  recommendation_match: string;
  mood_description: string;
}) {
  const stored = localStorage.getItem("moodplace_reviews");
  const reviews = stored ? JSON.parse(stored) : [];
  reviews.push({ ...review, id: Date.now().toString(), created_at: new Date().toISOString() });
  localStorage.setItem("moodplace_reviews", JSON.stringify(reviews));
}

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const placeId = searchParams.get("place_id") || "";
  const placeName = searchParams.get("place_name") || "";

  const [match, setMatch] = useState<string>("");
  const [moodDescription, setMoodDescription] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const canSubmit = !!match;

  const handleSubmit = () => {
    if (!canSubmit) return;

    saveReview({
      place_id: placeId,
      place_name: placeName,
      recommendation_match: match,
      mood_description: moodDescription.trim(),
    });

    setIsComplete(true);
    setTimeout(() => router.push("/"), 2000);
  };

  if (isComplete) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-xl font-bold mb-2">감사합니다!</h2>
          <p className="text-zinc-500">소중한 후기가 등록되었어요.</p>
          <p className="text-sm text-zinc-400 mt-4">
            잠시 후 홈으로 이동합니다...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-8">
      <div className="w-full max-w-lg mx-auto flex flex-col flex-1">
        <button
          onClick={() => router.back()}
          className="text-zinc-400 hover:text-black transition-colors self-start mb-6"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <h1 className="text-2xl font-bold mb-8">
          {placeName ? `${placeName}에 다녀오셨군요!` : "후기 작성"}
        </h1>

        {/* 추천 적합도 */}
        <div className="mb-8">
          <h2 className="text-base font-semibold mb-4">
            우리의 추천이 잘 맞았나요?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MATCH_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setMatch(option.value)}
                className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all ${
                  match === option.value
                    ? "border-black bg-black text-white"
                    : "border-zinc-200 hover:border-zinc-400"
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 느낌 입력 */}
        <div className="mb-8 flex-1">
          <h2 className="text-base font-semibold mb-4">
            이 공간은 어떤 느낌이었나요?
          </h2>
          <textarea
            value={moodDescription}
            onChange={(e) => setMoodDescription(e.target.value)}
            placeholder="예: 따뜻한 조명과 나무 인테리어가 아늑했어요. 커피도 맛있고 조용해서 집중하기 좋았어요."
            className="w-full h-36 p-4 border border-zinc-300 rounded-xl resize-none outline-none focus:border-black transition-colors text-sm leading-relaxed"
          />
        </div>

        {/* 제출 버튼 */}
        <div className="sticky bottom-6">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4 bg-black text-white rounded-full font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
          >
            제출하기
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center">
          <p className="text-zinc-400">로딩 중...</p>
        </main>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
