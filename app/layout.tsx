export const metadata = {
  title: "Cheapest IFB 9kg Finder",
  description: "Find the cheapest IFB 9 kg washing machine in India"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', background: '#0b1020', color: '#e6e8ef', margin: 0 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Cheapest IFB 9 kg Washing Machine</h1>
          <p style={{ opacity: 0.8, marginTop: 8 }}>Live price scan across major Indian e-commerce sites.</p>
          {children}
        </div>
      </body>
    </html>
  );
}
