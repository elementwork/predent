import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NotFound from "../NotFound";

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("NotFound page", () => {
  it("renders 404 message", () => {
    renderWithRouter(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("shows page not found text", () => {
    renderWithRouter(<NotFound />);
    expect(screen.getAllByText("Page not found").length).toBeGreaterThan(0);
  });

  it("has a link back to home", () => {
    renderWithRouter(<NotFound />);
    const homeLinks = screen.getAllByText("Back to Home");
    expect(homeLinks.length).toBeGreaterThan(0);
    expect(homeLinks[0].closest("a")).toHaveAttribute("href", "/");
  });
});
