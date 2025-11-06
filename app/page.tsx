"use client";

import { useEffect, useState } from "react";

type Offer = {
  site: string;
  title: string;
  price: number;
  url: string;
};

type ApiResponse = {
  cheapest: Offer | null;
  offers: Offer[];
  checkedAt: string;
};

export default function Page() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch("/api/find", { cache: "no-store" });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <button onClick={load} disabled={loading} style={{ padding: '10px 14px', borderRadius: 8, background: '#1f6feb', color: 'white', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Scanning?' : 'Rescan Now'}
        </button>
        <span style={{ opacity: 0.8, fontSize: 14 }}>
          Looking for IFB 9 kg washing machines across Amazon, Flipkart, Croma, Reliance Digital, TataCliq, Vijay Sales.
        </span>
      </div>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#3b1d1d', color: '#ffdada', borderRadius: 8 }}>
          {error}
        </div>
      )}

      {data?.cheapest && (
        <div style={{ marginTop: 20, padding: 16, background: '#11162a', border: '1px solid #26304d', borderRadius: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Cheapest right now</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginTop: 6 }}>
            <a href={data.cheapest.url} target="_blank" rel="noreferrer" style={{ color: '#8ab4ff', textDecoration: 'none', fontSize: 18 }}>{data.cheapest.title}</a>
            <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 20 }}>?{data.cheapest.price.toLocaleString('en-IN')}</span>
            <span style={{ opacity: 0.8 }}>({data.cheapest.site})</span>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>All offers</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
          {data?.offers?.map((o) => (
            <div key={o.url} style={{ padding: 12, background: '#0f1427', border: '1px solid #26304d', borderRadius: 10, display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{o.site}</div>
                <a href={o.url} target="_blank" rel="noreferrer" style={{ color: '#8ab4ff', textDecoration: 'none' }}>{o.title}</a>
              </div>
              <div style={{ fontWeight: 700 }}>?{o.price.toLocaleString('en-IN')}</div>
            </div>
          ))}
          {loading && (
            <div style={{ padding: 12, opacity: 0.8 }}>Scanning?</div>
          )}
          {!loading && data && data.offers.length === 0 && (
            <div style={{ padding: 12, opacity: 0.8 }}>No results found. Try rescan.</div>
          )}
        </div>
        {data && (
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>Checked at {new Date(data.checkedAt).toLocaleString()}</div>
        )}
      </div>
    </div>
  );
}
