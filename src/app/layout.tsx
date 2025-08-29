import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'tech.oblivion Client',
  description: 'Welcome to tech.oblivion',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ensure a CSRF token cookie exists (double-submit pattern).
  try {
    const cookieStore = (await cookies()) as any
    const existing = cookieStore.get('csrf')
    if (!existing) {
      const token = (globalThis.crypto && (globalThis.crypto as any).randomUUID) ? (globalThis.crypto as any).randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2)
      cookieStore.set({ name: 'csrf', value: token, path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    }
  } catch (e) {
    // no-op in environments where cookies can't be set server-side
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
