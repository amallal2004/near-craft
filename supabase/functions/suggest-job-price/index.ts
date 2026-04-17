const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SuggestJobPriceRequest = {
  title?: string;
  description?: string;
  categoryName?: string;
  urgency?: "low" | "medium" | "urgent";
  budgetType?: "fixed" | "hourly";
  locationText?: string;
};

type ConfidenceLevel = "low" | "medium" | "high";

type SuggestJobPriceResponse = {
  suggested_amount: number;
  min_amount: number;
  max_amount: number;
  confidence: ConfidenceLevel;
  explanation: string;
  currency: "INR";
  model: string;
};

function extractGeminiErrorMessage(status: number, rawBody: string) {
  try {
    const parsed = JSON.parse(rawBody);
    const message =
      parsed?.error?.message ||
      parsed?.message ||
      parsed?.details?.[0]?.message;

    if (typeof message === "string" && message.trim()) {
      return `Gemini API error (${status}): ${message.trim()}`;
    }
  } catch {
    // Fall back to the raw response text below.
  }

  const trimmedBody = rawBody.trim();
  if (trimmedBody) {
    return `Gemini API error (${status}): ${trimmedBody}`;
  }

  return `Gemini API error (${status})`;
}

function buildPrompt(input: Required<Omit<SuggestJobPriceRequest, "locationText">> & { locationText: string }) {
  return `
You are an expert at pricing local service jobs in India.

Estimate a fair market price for the following customer job request. Consider:
- complexity
- likely duration
- skill level needed
- urgency premium
- typical Indian local market rates
- whether the job sounds fixed-price or hourly

Return only valid JSON with this exact shape:
{
  "suggested_amount": number,
  "min_amount": number,
  "max_amount": number,
  "confidence": "low" | "medium" | "high",
  "explanation": "Three short bullet points separated by \\n"
}

Rules:
- Currency is INR.
- Use whole numbers only.
- "suggested_amount" must be between "min_amount" and "max_amount".
- Keep the range realistic and not too wide.
- Explanation must contain exactly 3 bullet points, each starting with "• ".
- If details are vague, lower confidence and keep the range broader.

Job title: ${input.title}
Job description: ${input.description}
Category: ${input.categoryName}
Urgency: ${input.urgency}
Budget type: ${input.budgetType}
Location context: ${input.locationText}
  `.trim();
}

function sanitizeSuggestion(payload: unknown): SuggestJobPriceResponse {
  if (!payload || typeof payload !== "object") {
    throw new Error("Model returned an invalid payload");
  }

  const raw = payload as Partial<SuggestJobPriceResponse>;
  const suggested = Number(raw.suggested_amount);
  const min = Number(raw.min_amount);
  const max = Number(raw.max_amount);
  const confidence = raw.confidence;
  const explanation = typeof raw.explanation === "string" ? raw.explanation.trim() : "";

  if (!Number.isFinite(suggested) || !Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error("Model returned invalid price numbers");
  }

  const normalizedMin = Math.max(1, Math.round(Math.min(min, suggested, max)));
  const normalizedMax = Math.max(normalizedMin, Math.round(Math.max(min, suggested, max)));
  const normalizedSuggested = Math.min(normalizedMax, Math.max(normalizedMin, Math.round(suggested)));

  const normalizedConfidence: ConfidenceLevel =
    confidence === "high" || confidence === "medium" || confidence === "low" ? confidence : "medium";

  const lines = explanation
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((line) => (line.startsWith("• ") ? line : `• ${line.replace(/^[•*-]\s*/, "")}`));

  if (lines.length === 0) {
    throw new Error("Model did not provide an explanation");
  }

  return {
    suggested_amount: normalizedSuggested,
    min_amount: normalizedMin,
    max_amount: normalizedMax,
    confidence: normalizedConfidence,
    explanation: lines.join("\n"),
    currency: "INR",
    model: "gemini-2.5-flash",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const body = (await req.json()) as SuggestJobPriceRequest;
    const title = body.title?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    const categoryName = body.categoryName?.trim() ?? "General service";
    const urgency = body.urgency ?? "medium";
    const budgetType = body.budgetType ?? "fixed";
    const locationText = body.locationText?.trim() || "India";

    if (title.length < 5 || description.length < 20) {
      throw new Error("Title and description are too short for pricing");
    }

    const prompt = buildPrompt({
      title,
      description,
      categoryName,
      urgency,
      budgetType,
      locationText,
    });

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      const errorMessage = extractGeminiErrorMessage(geminiResponse.status, errorText);
      console.error("Gemini API error:", errorMessage);
      throw new Error(errorMessage);
    }

    const geminiPayload = await geminiResponse.json();
    const responseText = geminiPayload?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof responseText !== "string" || responseText.trim().length === 0) {
      console.error("Unexpected Gemini payload:", JSON.stringify(geminiPayload));
      throw new Error("Empty model response");
    }

    const suggestion = sanitizeSuggestion(JSON.parse(responseText));

    return new Response(JSON.stringify(suggestion), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("suggest-job-price error:", message);

    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
