import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoneyRight | Expense & Income Tracker for Smart Budgeting",
  description:
    "MoneyRight is a free expense and income tracker app for budgeting, saving, and managing personal finances. Designed for the average worker and anyone who wants to control spending, save money, and maximize their financial health. Track expenses, income, and get insights to make smarter financial decisions.",
  keywords:
    "expense tracker, budget app, personal finance, income tracker, money management, savings, financial planning, spending tracker, budget planner, save money, financial health, smart budgeting, track expenses, manage income, best budget app, free expense tracker, moneyRight",
  openGraph: {
    title: "MoneyRight | Expense & Income Tracker for Smart Budgeting",
    description:
      "MoneyRight helps you manage expenses, income, and spending. Perfect for workers and anyone who wants to make the most of their finances.",
    url: "https://moneyright.app",
    type: "website",
    images: [
      {
        url: "/public/next.svg",
        width: 1200,
        height: 630,
        alt: "MoneyRight App Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoneyRight | Expense & Income Tracker for Smart Budgeting",
    description:
      "MoneyRight helps you manage expenses, income, and spending. Perfect for workers and anyone who wants to make the most of their finances.",
    site: "@moneyrightapp",
    images: ["/public/next.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <meta name="google-site-verification" content="" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Analytics with next/script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XX15G5LWP0"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XX15G5LWP0');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
