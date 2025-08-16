export function handleError(error: unknown, context?: string) {
  if (error instanceof Error) {
    console.error(`[Error${context ? `: ${context}` : ""}]`, error.message);
    return { success: false, message: error.message };
  }
  console.error(`[Error${context ? `: ${context}` : ""}]`, error);
  return { success: false, message: "An unexpected error occurred." };
}
