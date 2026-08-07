import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { CommandPalette } from '../components/CommandPalette';

export const metadata: Metadata = {
  title: "DevKit — The developer's everyday toolbox",
  description: 'Fast, privacy-first developer productivity platform featuring JSON tools, JWT decoders, UUID generators, crypto hashes, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark bg-background text-devText-primary min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">
              {children}
            </main>
          </div>
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
