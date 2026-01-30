import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://chamasmart.com'),
  title: {
    default: "ChamaSmart - Investment Group Management Platform",
    template: "%s | ChamaSmart"
  },
  description: "Comprehensive platform for managing Kenyan investment groups (Chamas). Track members, contributions, loans, investments, and generate detailed financial reports with ease.",
  keywords: [
    "chama management",
    "investment group",
    "Kenya chama",
    "group savings",
    "member contributions",
    "loan management",
    "financial reporting",
    "investment tracking",
    "table banking",
    "merry-go-round",
    "SACCO management",
    "group finance",
    "contribution tracker",
    "chama software",
    "investment club"
  ],
  authors: [{ name: "ChamaSmart Team" }],
  creator: "ChamaSmart",
  publisher: "ChamaSmart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "/",
    title: "ChamaSmart - Investment Group Management Platform",
    description: "Comprehensive platform for managing Kenyan investment groups (Chamas). Track members, contributions, loans, investments, and generate detailed financial reports.",
    siteName: "ChamaSmart",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ChamaSmart - Investment Group Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChamaSmart - Investment Group Management Platform",
    description: "Comprehensive platform for managing Kenyan investment groups (Chamas). Track members, contributions, loans, and investments.",
    images: ["/twitter-image.png"],
    creator: "@chamasmart",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-icon-precomposed.png",
      },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChamaSmart",
  },
  applicationName: "ChamaSmart",
  category: "finance",
  classification: "Business & Finance",
  verification: {
    // Add your verification tokens here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  alternates: {
    canonical: "/",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "ChamaSmart",
    "application-name": "ChamaSmart",
    "msapplication-TileColor": "#2563eb",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#2563eb",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Toaster richColors position="top-center" closeButton />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
