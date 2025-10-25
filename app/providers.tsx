"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";

const defaultFetcher = async (resource: string, init?: RequestInit) => {
  const response = await fetch(resource, init);
  if (!response.ok) {
    throw new Error("No se pudo obtener la información solicitada");
  }
  return response.json();
};

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: defaultFetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false
      }}
    >
      {children}
    </SWRConfig>
  );
}
