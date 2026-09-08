import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function createMediaQueryStore(query) {
  function getMediaQuery() {
    if (typeof window === "undefined") {
      return null;
    }

    return window.matchMedia(query);
  }

  return {
    subscribe(onStoreChange) {
      const mediaQuery = getMediaQuery();

      if (!mediaQuery) {
        return () => {};
      }

      mediaQuery.addEventListener("change", onStoreChange);

      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    getSnapshot() {
      return getMediaQuery()?.matches ?? false;
    },
    getServerSnapshot() {
      return false;
    },
  };
}

const reducedMotionStore = createMediaQueryStore(REDUCED_MOTION_QUERY);
const finePointerStore = createMediaQueryStore(FINE_POINTER_QUERY);

function useMediaQueryStore(store) {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
}

export default function useMotionPreferences() {
  const prefersReducedMotion = useMediaQueryStore(reducedMotionStore);
  const hasFinePointer = useMediaQueryStore(finePointerStore);

  return {
    prefersReducedMotion,
    hasFinePointer,
    allowsPointerMotion: hasFinePointer && !prefersReducedMotion,
  };
}
