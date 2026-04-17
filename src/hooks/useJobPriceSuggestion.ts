import { useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";

export type JobPriceSuggestion = {
  suggested_amount: number;
  min_amount: number;
  max_amount: number;
  confidence: "low" | "medium" | "high";
  explanation: string;
  currency: "INR";
  model: string;
};

type JobPriceSuggestionInput = {
  title: string;
  description: string;
  categoryName?: string;
  urgency: "low" | "medium" | "urgent";
  budgetType: "fixed" | "hourly";
  locationText?: string;
};

const MIN_TITLE_LENGTH = 5;
const MIN_DESCRIPTION_LENGTH = 20;
const DEBOUNCE_MS = 1000;

async function getEdgeFunctionErrorMessage(error: unknown, response?: Response) {
  if (response) {
    try {
      const payload = await response.clone().json();
      if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
        return payload.error;
      }
    } catch {
      try {
        const text = await response.clone().text();
        if (text.trim()) {
          return text.trim();
        }
      } catch {
        // Fall back to the generic mapper below.
      }
    }
  }

  return getSupabaseErrorMessage(error);
}

export function useJobPriceSuggestion(input: JobPriceSuggestionInput) {
  const [suggestion, setSuggestion] = useState<JobPriceSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const requestIdRef = useRef(0);

  const normalizedTitle = input.title.trim();
  const normalizedDescription = input.description.trim();
  const normalizedLocation = input.locationText?.trim() ?? "";
  const normalizedCategoryName = input.categoryName?.trim() ?? "";
  const canSuggest =
    normalizedTitle.length >= MIN_TITLE_LENGTH &&
    normalizedDescription.length >= MIN_DESCRIPTION_LENGTH &&
    normalizedCategoryName.length > 0;

  useEffect(() => {
    if (!canSuggest) {
      setSuggestion(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: invokeError, response } = await supabase.functions.invoke<JobPriceSuggestion>("suggest-job-price", {
          body: {
            title: normalizedTitle,
            description: normalizedDescription,
            categoryName: normalizedCategoryName,
            urgency: input.urgency,
            budgetType: input.budgetType,
            locationText: normalizedLocation,
          },
        });

        if (requestIdRef.current !== currentRequestId) {
          return;
        }

        if (invokeError) {
          setSuggestion(null);
          setError(await getEdgeFunctionErrorMessage(invokeError, response));
          setIsLoading(false);
          return;
        }

        setSuggestion(data ?? null);
        setLastUpdatedAt(Date.now());
        setIsLoading(false);
      } catch (error) {
        if (requestIdRef.current !== currentRequestId) {
          return;
        }

        setSuggestion(null);
        setError(getSupabaseErrorMessage(error));
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    canSuggest,
    input.budgetType,
    input.urgency,
    normalizedCategoryName,
    normalizedDescription,
    normalizedLocation,
    normalizedTitle,
  ]);

  return {
    suggestion,
    isLoading,
    error,
    canSuggest,
    lastUpdatedAt,
  };
}
