import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import ErrorBoundary from "../ErrorBoundary.jsx";

function ThrowAlways() {
  throw new Error("test-boundary");
}

describe("ErrorBoundary", () => {
  let consoleError;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("renders fallback when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowAlways />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("heading", { name: /משהו השתבש/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /רענן דף/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /לדף הבית/i })).toBeInTheDocument();
  });

  it("calls location.reload when refresh is clicked", () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload, assign: vi.fn() });

    render(
      <ErrorBoundary>
        <ThrowAlways />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByRole("button", { name: /רענן דף/i }));
    expect(reload).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });
});
