import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const metadata = {
  title: "Sentinel - AI-Powered Web3 Portfolio Tracker",
  description:
    "Real-time crypto portfolio monitoring with AI alerts and automated trading",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter bg-gray-900 text-white antialiased min-h-screen">
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(17, 24, 39, 0.8)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "white",
              },
            }}
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}
