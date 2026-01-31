import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStore } from "../../stores/useStore";

describe("useStore", () => {
  beforeEach(() => {
    act(() => {
      useStore.setState({ count: 0 });
    });
  });

  it("initializes with count of 0", () => {
    const { result } = renderHook(() => useStore());
    expect(result.current.count).toBe(0);
  });

  it("increments count when increase is called", () => {
    const { result } = renderHook(() => useStore());
    
    act(() => {
      result.current.increase();
    });
    
    expect(result.current.count).toBe(1);
  });

  it("can increase multiple times", () => {
    const { result } = renderHook(() => useStore());
    
    act(() => {
      result.current.increase();
      result.current.increase();
      result.current.increase();
    });
    
    expect(result.current.count).toBe(3);
  });

  it("resets count to 0 when reset is called", () => {
    const { result } = renderHook(() => useStore());
    
    act(() => {
      result.current.increase();
      result.current.increase();
    });
    
    expect(result.current.count).toBe(2);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.count).toBe(0);
  });

  it("maintains state across multiple components/hooks", () => {
    const { result: result1 } = renderHook(() => useStore());
    const { result: result2 } = renderHook(() => useStore());
    
    act(() => {
      result1.current.increase();
    });
    
    expect(result1.current.count).toBe(1);
    expect(result2.current.count).toBe(1);
  });
});
