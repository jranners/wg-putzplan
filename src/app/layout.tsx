import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Lexend } from "next/font/google";
export const dynamic = 'force-dynamic';
import "./globals.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { Providers } from "@/components/Providers";
import { getUsers } from "@/app/actions";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Setup JetBrains Mono
const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: '--font-mono',
});

// Setup Lexend
const lexend = Lexend({
    subsets: ["latin"],
    variable: '--font-lexend',
});

export const metadata: Metadata = {
    title: "TidyUp WG-Manager",
    description: "Manage your shared flat tasks and expenses",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const users = await getUsers();

    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={`${inter.className} ${jetbrainsMono.variable} ${lexend.variable} bg-background text-foreground`}>
                <ErrorBoundary>
                    <Providers>
                        {children}
                        <OfflineIndicator />
                    </Providers>
                </ErrorBoundary>
            </body>
        </html>
    );
}
