export function formatSince(from: Date, now = new Date()): string {
  const minutes = Math.max(0, Math.round((now.getTime() - from.getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const rest = minutes % 60;
    return rest > 0 ? `${hours} h ${String(rest).padStart(2, "0")}` : `${hours} h`;
  }

  const days = Math.floor(hours / 24);
  return `${days} j`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) {
    const rest = Math.round(minutes % 60);
    return rest > 0 ? `${hours} h ${String(rest).padStart(2, "0")}` : `${hours} h`;
  }
  return `${Math.floor(hours / 24)} j`;
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
