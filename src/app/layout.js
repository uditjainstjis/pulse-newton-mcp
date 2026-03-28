import "./globals.css";

export const metadata = {
  title: "Pulse | Newton-ready Student Success OS",
  description:
    "Pulse turns Newton student data into daily decisions, recovery plans, and adaptive practice.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
