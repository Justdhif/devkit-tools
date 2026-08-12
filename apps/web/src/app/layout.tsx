import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ProfileDrawer } from '../components/ProfileDrawer';
import NextTopLoader from 'nextjs-toploader';
import { InitialLoader } from '../components/InitialLoader';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { PageTransition } from '../components/PageTransition';
import { SearchProvider } from '../context/SearchContext';
import { MotionLayoutRoot } from '../components/MotionLayoutRoot';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} h-full overflow-hidden`} style={{ backgroundColor: '#09090B' }}>
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
      <body className="dark bg-background text-devText-primary h-full overflow-hidden flex flex-col antialiased" style={{ backgroundColor: '#09090B' }} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SearchProvider>
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
            <MotionLayoutRoot>
              <div className="flex flex-col h-screen max-h-screen overflow-hidden">
                <Header />
                <div className="flex flex-1 overflow-hidden min-h-0">
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto flex flex-col min-h-0 pb-16 md:pb-0">
                    <PageTransition>{children}</PageTransition>
                  </main>
                </div>
              </div>
            </MotionLayoutRoot>
            <ProfileDrawer />
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
