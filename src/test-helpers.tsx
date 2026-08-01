import { type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactNode,
  options: CustomRenderOptions = {}
) {
  const { queryClient, ...renderOptions } = options;
  const client = queryClient ?? createTestQueryClient();

  return {
    ...render(ui, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>
          <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
      ),
      ...renderOptions,
    }),
    queryClient: client,
  };
}

export function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}

export function createMockRouter(initialEntries: string[] = ["/"]) {
  return { initialEntries };
}
