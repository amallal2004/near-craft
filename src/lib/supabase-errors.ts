export function getSupabaseErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : typeof error === "object" && error !== null && "message" in error && typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "";
  const errorName =
    error instanceof Error
      ? error.name
      : typeof error === "object" && error !== null && "name" in error && typeof (error as { name?: unknown }).name === "string"
        ? (error as { name: string }).name
        : "";
  const details =
    typeof error === "object" && error !== null && "details" in error && typeof (error as { details?: unknown }).details === "string"
      ? (error as { details: string }).details
      : "";
  const hint =
    typeof error === "object" && error !== null && "hint" in error && typeof (error as { hint?: unknown }).hint === "string"
      ? (error as { hint: string }).hint
      : "";

  const combinedMessage = [message, details, hint].filter(Boolean).join(" ");

  if (!combinedMessage) {
    return "Something went wrong while contacting the server. Please try again.";
  }

  const normalizedMessage = combinedMessage.toLowerCase();
  const normalizedName = errorName.toLowerCase();

  if (normalizedName.includes("functionsfetcherror")) {
    return "Unable to reach the Supabase Edge Function. Check VITE_SUPABASE_URL, make sure your Supabase project is reachable, and confirm the function is deployed.";
  }

  if (normalizedMessage.includes("failed to fetch")) {
    return "Unable to reach Supabase. Check your internet connection, verify the app URL keys, and make sure no extension is blocking the request.";
  }

  return combinedMessage;
}
