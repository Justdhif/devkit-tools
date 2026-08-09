import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { CommandPalette } from '../components/CommandPalette';
import { ProfileDrawer } from '../components/ProfileDrawer';
import NextTopLoader from 'nextjs-toploader';
import { InitialLoader } from '../components/InitialLoader';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const navs = window.performance.getEntriesByType('navigation');
                const isReload = navs.length > 0 
                  ? navs[0].type === 'reload'
                  : window.performance.navigation.type === 1;
                const hasLoadedBefore = sessionStorage.getItem('devkit_loaded');
                if (hasLoadedBefore && !isReload) {
                  document.documentElement.classList.add('no-loader');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
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

