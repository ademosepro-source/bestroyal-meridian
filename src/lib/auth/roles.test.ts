import { describe, expect, it } from "vitest";
import { isRole, ROLE_ACCESS, ROLE_HOME_PATH, ROLE_LABELS, ROLES } from "./roles";

describe("isRole", () => {
  it("accepts every known role", () => {
    for (const role of ROLES) {
      expect(isRole(role)).toBe(true);
    }
  });

  it("rejects unknown, empty or missing values", () => {
    expect(isRole("superadmin")).toBe(false);
    expect(isRole("")).toBe(false);
    expect(isRole(null)).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});

describe("role tables stay in sync", () => {
  it("every role has a label and a home path", () => {
    for (const role of ROLES) {
      expect(ROLE_LABELS[role]).toBeTruthy();
      expect(ROLE_HOME_PATH[role]).toBeTruthy();
    }
  });

  it("every role's own home path grants that role access", () => {
    // If this ever fails, a role would be redirected after login straight
    // into a page the middleware then bounces them out of.
    for (const role of ROLES) {
      const homePath = ROLE_HOME_PATH[role];
      expect(ROLE_ACCESS[homePath]).toContain(role);
    }
  });
});
