import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { RegionProvider } from "@/lib/region-context";
import { RegionSelector } from "@/components/RegionSelector";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Supply Copilot — Travelier" },
      { name: "description", content: "Saves hours of manual monitoring by tracking contract status, margin issues, revenue leaks, provider performance, and peak-day opportunities in real time, enabl" },
      { property: "og:title", content: "Supply Copilot — Travelier" },
      { name: "twitter:title", content: "Supply Copilot — Travelier" },
      { property: "og:description", content: "Saves hours of manual monitoring by tracking contract status, margin issues, revenue leaks, provider performance, and peak-day opportunities in real time, enabl" },
      { name: "twitter:description", content: "Saves hours of manual monitoring by tracking contract status, margin issues, revenue leaks, provider performance, and peak-day opportunities in real time, enabl" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/7fdff8cd-86f4-4288-bf9f-efac86328cc7" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/7fdff8cd-86f4-4288-bf9f-efac86328cc7" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function todayString() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <RegionProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-muted/30">
            <AppSidebar />
            <div className="flex flex-1 flex-col">
              <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
                <SidebarTrigger />
                <div className="flex flex-1 items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h1 className="text-sm font-semibold text-foreground">Supply Copilot</h1>
                    <RegionSelector />
                  </div>
                  <span className="text-xs text-muted-foreground">{todayString()}</span>
                </div>
              </header>
              <main className="flex-1 p-4 md:p-6"><Outlet /></main>
            </div>
          </div>
        </SidebarProvider>
      </RegionProvider>
    </QueryClientProvider>
  );
}
