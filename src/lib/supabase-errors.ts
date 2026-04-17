export function getSupabaseErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const errorName = error instanceof Error ? error.name : "";

  if (!message) {
    return "Something went wrong while contacting the server. Please try again.";
  }

  const normalizedMessage = message.toLowerCase();
  const normalizedName = errorName.toLowerCase();

  if (normalizedName.includes("functionsfetcherror")) {
    return "Unable to reach the Supabase Edge Function. Check VITE_SUPABASE_URL, make sure your Supabase project is reachable, and confirm the function is deployed.";
  }

  if (normalizedMessage.includes("failed to fetch")) {
    return "Unable to reach Supabase. Check your internet connection, verify the app URL keys, and make sure no extension is blocking the request.";
  }

  return message;
}
