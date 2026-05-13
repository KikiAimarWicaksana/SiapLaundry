import { describe, it, expect } from "vitest";

describe("Project Setup", () => {
  it("should have vitest configured correctly", () => {
    expect(true).toBe(true);
  });

  it("should resolve @/ path alias", async () => {
    // Verify the path alias works by importing from @/
    const module = await import("@/app/page");
    expect(module.default).toBeDefined();
  });
});
