import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { CommandPalette } from '../components/CommandPalette';
import { ProfileDrawer } from '../components/ProfileDrawer';
import NextTopLoader from 'nextjs-toploader';
import { InitialLoader } from '../components/InitialLoader';

export const metadata: Metadata = {
  title: "DevKit — The developer's everyday toolbox",
  description: 'Fast, privacy-first developer productivity platform featuring JSON tools, JWT decoders, UUID generators, crypto hashes, and more.',
  icons: {
    icon: '/icon.svg',
  },
};

import { PageTransition } from '../components/PageTransition';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark bg-background text-devText-primary min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <NextTopLoader 
            color="#8B5CF6" 
            initialPosition={0.08} 
            crawlSpeed={200} 
            height={3} 
            crawl={true} 
            showSpinner={false} 
            easing="ease" 
            speed={200} 
            shadow="0 0 10px #8B5CF6,0 0 5px #8B5CF6"
          />
          <InitialLoader />
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 pb-16 md:pb-0 overflow-y-auto flex flex-col min-h-0">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
          <CommandPalette />
          <ProfileDrawer />
        </ThemeProvider>
      </body>
    </html>
  );
}

