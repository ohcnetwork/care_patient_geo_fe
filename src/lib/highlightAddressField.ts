const HIGHLIGHT_CLASS = "geo-address-highlight";
const HIGHLIGHT_DURATION_MS = 2100;

// The address textarea lives in the host app's DOM, outside this plugin's own tree,
// so we reach for it directly instead of via props.
export function highlightAddressField(): void {
  const field = document.querySelector<HTMLElement>('textarea[name="address"]');
  if (!field) return;

  field.classList.add(HIGHLIGHT_CLASS);
  field.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(
    () => field.classList.remove(HIGHLIGHT_CLASS),
    HIGHLIGHT_DURATION_MS,
  );
}
