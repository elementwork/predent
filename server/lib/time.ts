export const DEFAULT_TIMEZONE = "America/Toronto";

export function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function formatInTimeZone(
  value: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions
) {
  const safeTimeZone = isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIMEZONE;
  return new Intl.DateTimeFormat("en-CA", {
    ...options,
    timeZone: safeTimeZone,
  }).format(value);
}
