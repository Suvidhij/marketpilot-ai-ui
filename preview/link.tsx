import type { AnchorHTMLAttributes } from "react";
import { useRouter } from "./navigation";
export default function Link({
  href,
  onClick,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const router = useRouter();
  const local = href.startsWith("/");
  return (
    <a
      {...props}
      href={local ? "#" + href : href}
      onClick={(event) => {
        onClick?.(event);
        if (
          !local ||
          event.defaultPrevented ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        if (href.includes("#")) {
          const [route, anchor] = href.split("#");
          router.push(route || "/");
          setTimeout(
            () => document.getElementById(anchor)?.scrollIntoView(),
            0,
          );
        } else router.push(href);
      }}
    >
      {children}
    </a>
  );
}
