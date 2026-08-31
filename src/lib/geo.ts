// https://developers.google.com/maps/documentation/urls/get-started#search-action
// A plain https URL is always a clickable link (unlike geo:, which needs an
// OS-registered handler); Google Maps apps still intercept it via universal/app
// links when installed, and it falls back to a normal map page otherwise.
const MAPS_URL_LINE_REGEX = /^https:\/\/www\.google\.com\/maps\/search\/.*$/gm;

export function buildMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function extractMapsUrlFromAddress(address: string): string | null {
  const match = address.match(MAPS_URL_LINE_REGEX);
  return match ? match[0].trim() : null;
}

// Replaces a previously-appended maps link (if any) instead of duplicating it on re-capture.
export function appendMapsUrlToAddress(
  address: string,
  mapsUrl: string,
): string {
  const withoutPreviousMapsLine = address
    .replace(MAPS_URL_LINE_REGEX, "")
    .trimEnd();

  return withoutPreviousMapsLine
    ? `${withoutPreviousMapsLine}\n\n${mapsUrl}`
    : mapsUrl;
}
