"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_MOODS = [
  "힙하고 활기찬",
  "아늑하고 조용한",
  "모던하고 세련된",
  "레트로하고 감성적인",
  "전통적이고 고즈넉한",
];

export default function MoodInputPage() {
  const [mood, setMood] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!mood.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: mood.trim() }),
      });

      if (!res.ok) throw new Error("추천 요청 실패");

      const data = await res.json();
      const params = new URLSearchParams({
        mood: mood.trim(),
        regions: JSON.stringify(data.regions),
        tags: JSON.stringify(data.tags),
      });
      router.push(`/recommend?${params.toString()}`);
    } catch {
      alert("추천을 가져오는 데 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">MoodPlace</h1>
        <p className="text-lg text-zinc-500 mb-12">
          어떤 느낌의 공간을 찾으세요?
        </p>

        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="예: 조용하고 빈티지한 카페가 있는 동네"
          className="w-full text-lg border-b-2 border-zinc-300 focus:border-black outline-none pb-3 bg-transparent text-center transition-colors"
        />

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {EXAMPLE_MOODS.map((example) => (
            <button
              key={example}
              onClick={() => setMood(example)}
              className="px-4 py-2 text-sm border border-zinc-300 rounded-full hover:border-black hover:bg-black hover:text-white transition-all"
            >
              {example}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!mood.trim() || isLoading}
          className="mt-10 px-10 py-3.5 bg-black text-white rounded-full text-base font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              분석 중...
            </span>
          ) : (
            "추천받기"
          )}
        </button>
      </div>
    </main>
  );
}
