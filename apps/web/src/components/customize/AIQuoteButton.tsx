"use client";

import { useState, useRef } from "react";

interface OrderData {
  name:          string;
  furnitureType: string;
  woodType?:     string;
  budgetRange:   string;
  dimensions?:   string;
  description:   string;
}

interface AIQuoteButtonProps {
  orderData: OrderData;
}

export default function AIQuoteButton({ orderData }: AIQuoteButtonProps) {
  const [quote,    setQuote]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [copied,   setCopied]   = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function generateQuote() {
    if (loading) {
      abortRef.current?.abort();
      return;
    }

    setQuote("");
    setError(null);
    setLoading(true);
    setCopied(false);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/quote", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(orderData),
        signal:  controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to reach AI service.");
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;

          try {
            const payload = JSON.parse(raw) as { text?: string; error?: string };
            if (payload.error) throw new Error(payload.error);
            if (payload.text)  setQuote((prev) => prev + payload.text);
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError(err.message ?? "Quote generation failed.");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  async function copyToClipboard() {
    if (!quote) return;
    try {
      await navigator.clipboard.writeText(quote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for unsupported environments
    }
  }

  return (
    <div className="space-y-4">
      {/* Generate button */}
      <button
        type="button"
        onClick={generateQuote}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                   bg-gold-800 hover:bg-gold-900 active:bg-gold-900
                   text-white font-medium text-sm transition-colors
                   disabled:opacity-50"
      >
        {/* Sparkle icon */}
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {loading ? "Stop generating" : quote ? "Regenerate quote" : "Generate AI quote"}
      </button>

      {/* Streaming text area */}
      {(loading || quote) && (
        <div className="relative rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
            {quote}
            {loading && (
              <span className="inline-block w-0.5 h-4 bg-gold-700 ml-0.5 animate-pulse" />
            )}
          </p>

          {/* Copy button — shows once streaming is done */}
          {!loading && quote && (
            <button
              type="button"
              onClick={copyToClipboard}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium
                         text-gold-700 hover:text-gold-900 transition-colors"
            >
              {copied ? (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                  </svg>
                  Copy quote
                </>
              )}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
