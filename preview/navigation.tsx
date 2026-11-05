import { useSyncExternalStore } from "react";
function pathname() {
  const hash = window.location.hash.slice(1);
  return hash.startsWith("/") ? hash.split("?")[0] : "/";
}
function listen(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("preview:navigate", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("preview:navigate", callback);
  };
}
function navigate(path: string, replace = false) {
  const value = "#" + path;
  if (replace) window.history.replaceState(null, "", value);
  else window.history.pushState(null, "", value);
  window.dispatchEvent(new Event("preview:navigate"));
  window.scrollTo({ top: 0, behavior: "instant" });
}
const router = {
  push: (path: string) => navigate(path),
  replace: (path: string) => navigate(path, true),
  refresh: () => window.dispatchEvent(new Event("preview:navigate")),
};
export function useRouter() {
  return router;
}
export function usePathname() {
  return useSyncExternalStore(listen, pathname, () => "/");
}
