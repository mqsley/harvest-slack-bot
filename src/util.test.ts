import { getMondayAndFriday } from "./util";

describe("getMondayAndFriday", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  // Weekday test cases - should return current week
  it("returns current week Monday and Friday for Monday", () => {
    vi.setSystemTime(new Date("2024-11-4")); // Monday
    const { monday, friday } = getMondayAndFriday();

    expect(monday.toISOString().slice(0, 10)).toBe("2024-11-04");
    expect(friday.toISOString().slice(0, 10)).toBe("2024-11-08");
  });

  it("returns current week Monday and Friday for Wednesday", () => {
    vi.setSystemTime(new Date("2024-10-23")); // Wednesday
    const { monday, friday } = getMondayAndFriday();

    expect(monday.toISOString().slice(0, 10)).toBe("2024-10-21");
    expect(friday.toISOString().slice(0, 10)).toBe("2024-10-25");
  });

  it("returns current week Monday and Friday for Friday", () => {
    vi.setSystemTime(new Date("2024-11-08")); // Friday
    const { monday, friday } = getMondayAndFriday();

    expect(monday.toISOString().slice(0, 10)).toBe("2024-11-04");
    expect(friday.toISOString().slice(0, 10)).toBe("2024-11-08");
  });

  it("returns current week Monday and Friday for Friday in different month", () => {
    vi.setSystemTime(new Date("2024-11-01")); // Friday
    const { monday, friday } = getMondayAndFriday();

    expect(monday.toISOString().slice(0, 10)).toBe("2024-10-28");
    expect(friday.toISOString().slice(0, 10)).toBe("2024-11-01");
  });

  // Weekend test cases - should return prior week
  it("returns prior week Monday and Friday for Saturday", () => {
    vi.setSystemTime(new Date("2024-10-19")); // Saturday
    const { monday, friday } = getMondayAndFriday();

    expect(monday.toISOString().slice(0, 10)).toBe("2024-10-14");
    expect(friday.toISOString().slice(0, 10)).toBe("2024-10-18");
  });

  it("returns prior week Monday and Friday for Sunday", () => {
    vi.setSystemTime(new Date("2024-10-20")); // Sunday
    const { monday, friday } = getMondayAndFriday();

    expect(monday.toISOString().slice(0, 10)).toBe("2024-10-14");
    expect(friday.toISOString().slice(0, 10)).toBe("2024-10-18");
  });

  // Edge cases handling month and year boundaries
  it("correctly handles month boundary for a weekend", () => {
    vi.setSystemTime(new Date("2023-07-30")); // Sunday
    const { monday, friday } = getMondayAndFriday();

    expect(monday.toISOString().slice(0, 10)).toBe("2023-07-24");
    expect(friday.toISOString().slice(0, 10)).toBe("2023-07-28");
  });

  it("correctly handles year boundary for a weekend", () => {
    vi.setSystemTime(new Date("2023-12-31")); // Sunday
    const { monday, friday } = getMondayAndFriday();

    expect(monday.toISOString().slice(0, 10)).toBe("2023-12-25");
    expect(friday.toISOString().slice(0, 10)).toBe("2023-12-29");
  });

  it("handles leap year correctly for a weekend", () => {
    vi.setSystemTime(new Date("2024-02-24")); // Saturday in a leap year
    const { monday, friday } = getMondayAndFriday();

    expect(monday.toISOString().slice(0, 10)).toBe("2024-02-19");
    expect(friday.toISOString().slice(0, 10)).toBe("2024-02-23");
  });
});
