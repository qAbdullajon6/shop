import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { getTelegramWebApp } from "@/lib/telegram";

/**
 * Telegram Mini App BackButton integration.
 *
 * Shows the native Telegram back button whenever the user has navigated deeper
 * than the entry point. Pressing it performs a React Router `navigate(-1)`.
 *
 * Design decisions:
 * - Tab switches use `setSearchParams({ replace: true })`, so they do NOT change
 *   `location.key` and do NOT increment the depth counter. Back never cycles
 *   through tab states.
 * - Uses `location.key` (React Router's per-entry identifier) rather than
 *   `window.history.length` so depth is scoped to the current Mini App session.
 * - `show()`/`hide()` are only called when visibility actually changes. Calling
 *   them on every REPLACE navigation (tab switch) is unnecessary and some
 *   Telegram clients react to redundant calls in unexpected ways.
 * - The navigate ref pattern keeps the onClick handler stable across renders,
 *   preventing duplicate listener registration.
 * - Safe outside Telegram: all code behind `wa?.BackButton` guard — no errors.
 * - Safe with React StrictMode: `prevKeyRef` deduplicates the double-invoke.
 */
export function TelegramBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();

  // Counts how many PUSH navigations deep we are from the Mini App entry.
  const depthRef = useRef(0);
  // Tracks the React Router key of the last-processed entry to deduplicate
  // React StrictMode's double-invoke and same-entry re-renders.
  const prevKeyRef = useRef<string | null>(null);
  // Tracks whether the BackButton is currently shown so we only call
  // show()/hide() when the state actually needs to change.
  const prevVisibleRef = useRef(false);
  // Stable ref to the latest navigate function — avoids re-registering onClick.
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // Sync BackButton visibility with navigation depth.
  useEffect(() => {
    const wa = getTelegramWebApp();
    if (!wa?.BackButton) return;

    const { key } = location;

    // First render is the Mini App entry point — not a navigation.
    // Always hide on entry so we start from a known clean state.
    if (prevKeyRef.current === null) {
      prevKeyRef.current = key;
      wa.BackButton.hide();
      prevVisibleRef.current = false;
      return;
    }

    // Deduplicate: StrictMode fires the effect twice with the same key.
    if (prevKeyRef.current === key) return;
    prevKeyRef.current = key;

    if (navigationType === "PUSH") {
      depthRef.current += 1;
    } else if (navigationType === "POP") {
      depthRef.current = Math.max(0, depthRef.current - 1);
    }
    // REPLACE (tab switch): depth unchanged.

    const shouldShow = depthRef.current > 0;

    // Only call show()/hide() when visibility actually needs to change.
    // This prevents repeated no-op calls on every REPLACE navigation.
    if (shouldShow === prevVisibleRef.current) return;
    prevVisibleRef.current = shouldShow;

    if (shouldShow) wa.BackButton.show();
    else wa.BackButton.hide();
  }, [location, navigationType]);

  // Register a stable click handler. Cleaned up on unmount to prevent leaks.
  useEffect(() => {
    const wa = getTelegramWebApp();
    const btn = wa?.BackButton;
    if (!btn) return;

    const handleBack = () => navigateRef.current(-1);
    btn.onClick(handleBack);
    return () => {
      btn.offClick(handleBack);
    };
  }, []); // intentionally empty — handler is stable via navigateRef

  return null;
}
