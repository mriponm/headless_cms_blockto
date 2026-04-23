import { NextRequest, NextResponse } from "next/server";

// Free Google Translate endpoint — no API key, no quota, works in Node
const GT_URL = "https://translate.googleapis.com/translate_a/single";

// Language code overrides for Google Translate
const LANG_MAP: Record<string, string> = {
  zh: "zh-CN",
};

function mapLang(code: string): string {
  return LANG_MAP[code] ?? code;
}

async function googleTranslate(text: string, target: string): Promise<string> {
  if (!text.trim()) return text;
  const url =
    `${GT_URL}?client=gtx&sl=en&tl=${mapLang(target)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) return text;
  const data = await res.json();
  // Response: [ [ ["translated","original",...], ... ], ... ]
  // Join all sentence fragments
  const translated = (data[0] as [string, ...unknown[]][])
    .map((item) => item[0])
    .join("");
  return translated || text;
}

// Split into chunks ≤ 2000 chars on sentence boundaries
function chunkText(text: string): string[] {
  if (text.length <= 2000) return [text];
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) ?? [text];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > 2000) {
      if (current) chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text];
}

async function translateText(text: string, target: string): Promise<string> {
  const chunks = chunkText(text);
  if (chunks.length === 1) return googleTranslate(text, target);
  const results = await Promise.all(chunks.map((c) => googleTranslate(c, target)));
  return results.join(" ");
}

export async function POST(req: NextRequest) {
  try {
    const { texts, targetLang } = (await req.json()) as {
      texts: string[];
      targetLang: string;
    };

    if (!texts?.length || !targetLang) {
      return NextResponse.json(
        { error: "texts and targetLang required" },
        { status: 400 }
      );
    }

    if (targetLang === "en") {
      return NextResponse.json({ translations: texts });
    }

    // Translate in batches of 10 concurrently
    const results: string[] = [];
    const BATCH = 10;
    for (let i = 0; i < texts.length; i += BATCH) {
      const batch = texts.slice(i, i + BATCH);
      const translated = await Promise.all(
        batch.map((t) => translateText(t, targetLang))
      );
      results.push(...translated);
    }

    return NextResponse.json({ translations: results });
  } catch (err) {
    console.error("[translate]", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
