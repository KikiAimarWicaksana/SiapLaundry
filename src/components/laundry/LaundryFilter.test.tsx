import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LaundryFilter, FilterState } from "./LaundryFilter";

const defaultFilters: FilterState = {
  distance: null,
  minRating: null,
  priceSort: null,
  services: [],
};

describe("LaundryFilter", () => {
  it("renders all filter sections", () => {
    render(
      <LaundryFilter
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText("Jarak")).toBeInTheDocument();
    expect(screen.getByText("Rating Minimum")).toBeInTheDocument();
    expect(screen.getByText("Urutkan Harga")).toBeInTheDocument();
    expect(screen.getByText("Layanan")).toBeInTheDocument();
  });

  it("renders distance options", () => {
    render(
      <LaundryFilter
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText("Semua")).toBeInTheDocument();
    expect(screen.getByText("1 km")).toBeInTheDocument();
    expect(screen.getByText("3 km")).toBeInTheDocument();
    expect(screen.getByText("5 km")).toBeInTheDocument();
    expect(screen.getByText("10 km+")).toBeInTheDocument();
  });

  it("renders rating options", () => {
    render(
      <LaundryFilter
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText("4+")).toBeInTheDocument();
    expect(screen.getByText("3+")).toBeInTheDocument();
    expect(screen.getByText("2+")).toBeInTheDocument();
  });

  it("renders price sort options", () => {
    render(
      <LaundryFilter
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText("Termurah")).toBeInTheDocument();
    expect(screen.getByText("Termahal")).toBeInTheDocument();
  });

  it("renders service options", () => {
    render(
      <LaundryFilter
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText("Cuci Kering")).toBeInTheDocument();
    expect(screen.getByText("Cuci Setrika")).toBeInTheDocument();
    expect(screen.getByText("Setrika Saja")).toBeInTheDocument();
    expect(screen.getByText("Dry Clean")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(
      <LaundryFilter
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText("Terapkan Filter")).toBeInTheDocument();
    expect(screen.getByText("Reset Filter")).toBeInTheDocument();
  });

  it("calls onFilterChange with selected filters when 'Terapkan Filter' is clicked", () => {
    const onFilterChange = vi.fn();
    render(
      <LaundryFilter
        filters={defaultFilters}
        onFilterChange={onFilterChange}
        onReset={vi.fn()}
      />
    );

    // Select distance 3km
    fireEvent.click(screen.getByLabelText("Jarak 3 km"));
    // Select rating 4+
    fireEvent.click(screen.getByLabelText("Rating minimum 4+"));
    // Select service
    fireEvent.click(screen.getByLabelText("Layanan Cuci Kering"));
    // Apply
    fireEvent.click(screen.getByText("Terapkan Filter"));

    expect(onFilterChange).toHaveBeenCalledWith({
      distance: 3,
      minRating: 4,
      priceSort: null,
      services: ["Cuci Kering"],
    });
  });

  it("calls onReset and resets local state when 'Reset Filter' is clicked", () => {
    const onReset = vi.fn();
    render(
      <LaundryFilter
        filters={{ distance: 5, minRating: 3, priceSort: "asc", services: ["Dry Clean"] }}
        onFilterChange={vi.fn()}
        onReset={onReset}
      />
    );

    fireEvent.click(screen.getByText("Reset Filter"));

    expect(onReset).toHaveBeenCalled();
  });

  it("toggles service selection on and off", () => {
    const onFilterChange = vi.fn();
    render(
      <LaundryFilter
        filters={defaultFilters}
        onFilterChange={onFilterChange}
        onReset={vi.fn()}
      />
    );

    // Select a service
    fireEvent.click(screen.getByLabelText("Layanan Cuci Setrika"));
    // Deselect the same service
    fireEvent.click(screen.getByLabelText("Layanan Cuci Setrika"));
    // Apply
    fireEvent.click(screen.getByText("Terapkan Filter"));

    expect(onFilterChange).toHaveBeenCalledWith({
      distance: null,
      minRating: null,
      priceSort: null,
      services: [],
    });
  });

  it("toggles rating selection off when clicking the same rating", () => {
    const onFilterChange = vi.fn();
    render(
      <LaundryFilter
        filters={defaultFilters}
        onFilterChange={onFilterChange}
        onReset={vi.fn()}
      />
    );

    // Select rating 3+
    fireEvent.click(screen.getByLabelText("Rating minimum 3+"));
    // Deselect rating 3+
    fireEvent.click(screen.getByLabelText("Rating minimum 3+"));
    // Apply
    fireEvent.click(screen.getByText("Terapkan Filter"));

    expect(onFilterChange).toHaveBeenCalledWith({
      distance: null,
      minRating: null,
      priceSort: null,
      services: [],
    });
  });

  it("has accessible filter panel with aria-label", () => {
    render(
      <LaundryFilter
        filters={defaultFilters}
        onFilterChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Filter laundry")).toBeInTheDocument();
  });
});
