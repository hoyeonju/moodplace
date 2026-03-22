import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { regions } from "@/data/regions";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export async function POST(request: Request) {
  try {
    const { mood } = await request.json();

    if (!mood || typeof mood !== "string") {
      return NextResponse.json(
        { error: "느낌을 입력해주세요." },
        { status: 400 }
      );
    }

    // 1. Claude로 태그 추출
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `당신은 사용자의 감성 텍스트를 분석하여 장소 분위기 태그를 추출하는 전문가입니다.
사용자가 입력한 느낌 텍스트를 분석하고, 아래 태그 목록에서 가장 관련 있는 태그 2~4개를 선택하세요.

가능한 태그 목록:
힙함, 모던함, 트렌디, 활기참, 아늑함, 감성적, 조용함, 빈티지, 레트로, 고즈넉함, 다양함, 자유로움, 독특함, 뉴트로, 소박함, 따뜻함, 로컬, 세련됨, 고급스러움, 감각적, 전통적, 예술적, 아름다움, 역사적, 이국적, 맛있음

사용자 입력: "${mood}"

반드시 JSON 형식으로만 응답하세요: {"tags": ["태그1", "태그2", ...]}`,
        },
      ],
    });

    const content =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!content) {
      return NextResponse.json(
        { error: "AI 응답을 받지 못했습니다." },
        { status: 500 }
      );
    }

    // JSON 부분만 추출 (혹시 앞뒤에 텍스트가 있을 경우 대비)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "AI 응답을 파싱할 수 없습니다." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const tags: string[] = parsed.tags || [];

    if (tags.length === 0) {
      return NextResponse.json(
        {
          error: "좀 더 구체적으로 말씀해주시겠어요?",
          examples: [
            "조용하고 빈티지한 카페가 있는 동네",
            "힙하고 활기찬 분위기",
            "아늑하고 따뜻한 곳",
          ],
        },
        { status: 400 }
      );
    }

    // 2. 태그 매칭으로 지역 점수 계산
    const scored = regions.map((region) => {
      const matchCount = tags.filter((tag) =>
        region.mood_tags.includes(tag)
      ).length;
      return { ...region, score: matchCount };
    });

    scored.sort((a, b) => b.score - a.score);
    const topRegions = scored.filter((r) => r.score > 0).slice(0, 3);

    if (topRegions.length === 0) {
      return NextResponse.json(
        {
          error:
            "아직 해당 느낌의 지역 데이터가 없어요. 다른 느낌을 시도해보세요!",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tags,
      regions: topRegions.map(({ score: _s, ...region }) => region),
    });
  } catch (err) {
    console.error("Mood API error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
