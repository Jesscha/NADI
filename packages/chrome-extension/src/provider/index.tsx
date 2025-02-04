import { ReactNode } from "react";
import { SWRConfig } from "swr";

function localStorageProvider() {
    const map = new Map(JSON.parse(localStorage.getItem("app-cache") || "[]"));
    window.addEventListener("beforeunload", () => {
      const appCache = JSON.stringify(Array.from(map.entries()));
      localStorage.setItem("app-cache", appCache);
    });
  
    return map;
}
  
export const SRWProvider = ({ children }: { children: ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <SWRConfig value={{ provider: localStorageProvider as any }}>
        {children}
    </SWRConfig>
}