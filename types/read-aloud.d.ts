// Type-check-only declarations for the extension; not shipped with it.
interface ReadAloudLabels {
  read: string;
  stop: string;
  empty: string;
  unsupported: string;
  error: string;
}

interface ReadAloudOptions {
  rate?: unknown;
  lang?: string;
  voice?: string;
  labels?: Partial<ReadAloudLabels>;
}

interface Window {
  RevealReadAloud: Reveal.PluginFunction;
}
