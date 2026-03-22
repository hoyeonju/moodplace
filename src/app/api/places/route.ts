import { NextRequest, NextResponse } from "next/server";
import type { Place } from "@/lib/types";

// 카카오 카테고리 코드 매핑
const CATEGORY_MAP: Record<string, string> = {
  카페: "CE7",
  음식점: "FD6",
};

interface KakaoPlace {
  id: string;
  place_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const region = searchParams.get("region");
  const category = searchParams.get("category");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!region) {
    return NextResponse.json(
      { error: "지역 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  const REST_KEY = process.env.KAKAO_REST_API_KEY;
  if (!REST_KEY) {
    return NextResponse.json(
      { error: "카카오 API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    let allPlaces: Place[] = [];

    // 카테고리별 검색 (전체면 카페+음식점+기타 모두)
    const categoriesToSearch =
      category && category !== "전체"
        ? [category]
        : ["카페", "음식점", "기타"];

    for (const cat of categoriesToSearch) {
      const categoryCode = CATEGORY_MAP[cat];

      const params = new URLSearchParams({
        query: `${region} ${cat === "기타" ? "명소" : cat}`,
        size: "10",
      });

      if (lat && lng) {
        params.set("x", lng);
        params.set("y", lat);
        params.set("radius", "2000");
        params.set("sort", "distance");
      }

      if (categoryCode) {
        params.set("category_group_code", categoryCode);
      }

      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?${params}`,
        {
          headers: { Authorization: `KakaoAK ${REST_KEY}` },
        }
      );

      if (!res.ok) continue;

      const data = await res.json();
      const docs: KakaoPlace[] = data.documents || [];

      const mapped: Place[] = docs.map((doc) => ({
        id: doc.id,
        name: doc.place_name,
        category: categoryCode === "CE7" ? "카페" : categoryCode === "FD6" ? "음식점" : "기타" as Place["category"],
        region,
        address: doc.road_address_name || doc.address_name,
        lat: parseFloat(doc.y),
        lng: parseFloat(doc.x),
        mood_tags: [],
        phone: doc.phone || "",
        place_url: doc.place_url || "",
      }));

      allPlaces = [...allPlaces, ...mapped];
    }

    return NextResponse.json({ places: allPlaces });
  } catch (err) {
    console.error("Kakao API error:", err);
    return NextResponse.json(
      { error: "장소를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
