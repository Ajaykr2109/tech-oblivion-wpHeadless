"use client";

import React, { useEffect, useRef } from "react";

type NoCopyProps = {
  children?: React.ReactNode;
  // If true, also blocks common keyboard shortcuts like Ctrl/Cmd+C, A, S, P, U
  includeShortcuts?: boolean;
  // Optional aria label to indicate protected content
  ariaLabel?: string;
};

export default function NoCopy({
  children,
  includeShortcuts = true,
  ariaLabel = "Content protected",
}: NoCopyProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      // Block common shortcuts: copy, cut, paste, select all, save, print, view source
      if (
        (ctrl && ["c", "x", "v", "a", "s", "p", "u"].includes(key)) ||
        key === "printscreen"
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Attach listeners only within the protected container
    el.addEventListener("copy", block);
    el.addEventListener("cut", block);
    el.addEventListener("paste", block);
    el.addEventListener("contextmenu", block);
    el.addEventListener("dragstart", block);
    el.addEventListener("selectstart", block);
    if (includeShortcuts) {
      el.addEventListener("keydown", onKeyDown, true);
    }

    // Also attach document-level listeners while this component is mounted
    // to catch actions when focus is outside the container but still on this page.
    document.addEventListener("copy", block, true);
    document.addEventListener("cut", block, true);
    document.addEventListener("paste", block, true);
    document.addEventListener("contextmenu", block, true);
    document.addEventListener("dragstart", block, true);
    document.addEventListener("selectstart", block, true);
    if (includeShortcuts) {
      document.addEventListener("keydown", onKeyDown, true);
    }

    return () => {
      el.removeEventListener("copy", block);
      el.removeEventListener("cut", block);
      el.removeEventListener("paste", block);
      el.removeEventListener("contextmenu", block);
      el.removeEventListener("dragstart", block);
      el.removeEventListener("selectstart", block);
      if (includeShortcuts) {
        el.removeEventListener("keydown", onKeyDown, true);
      }

      document.removeEventListener("copy", block, true);
      document.removeEventListener("cut", block, true);
      document.removeEventListener("paste", block, true);
      document.removeEventListener("contextmenu", block, true);
      document.removeEventListener("dragstart", block, true);
      document.removeEventListener("selectstart", block, true);
      if (includeShortcuts) {
        document.removeEventListener("keydown", onKeyDown, true);
      }
    };
  }, [includeShortcuts]);

  return (
    <div
      ref={containerRef}
      className="select-none"
      aria-label={ariaLabel}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
