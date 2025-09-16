import { renderHook, act } from "@testing-library/react-hooks";
import { z } from "zod";
import { useFormValidation } from "../useFormValidation";

const testSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
  name: z.string().min(2, "Name too short"),
});

describe("useFormValidation", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema })
    );

    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isValid).toBe(false);
  });

  it("should validate field on blur with debounce", async () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema, debounceMs: 100 })
    );

    act(() => {
      result.current.handleBlur("email", "invalid-email", {
        email: "invalid-email",
        password: "password123",
        name: "John",
      });
    });

    expect(result.current.touched.email).toBe(true);
    expect(result.current.errors.email).toBeUndefined();

    // Fast-forward debounce timer
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.errors.email).toBe("Invalid email");
    expect(result.current.isValid).toBe(false);
  });

  it("should clear error when field becomes valid", async () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema, debounceMs: 100 })
    );

    // First set an invalid email
    act(() => {
      result.current.handleBlur("email", "invalid", {
        email: "invalid",
        password: "password123",
        name: "John",
      });
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.errors.email).toBe("Invalid email");

    // Then set a valid email
    act(() => {
      result.current.handleBlur("email", "valid@email.com", {
        email: "valid@email.com",
        password: "password123",
        name: "John",
      });
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.errors.email).toBeNull();
  });

  it("should validate entire form", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema })
    );

    const validForm = {
      email: "test@example.com",
      password: "password123",
      name: "John Doe",
    };

    const invalidForm = {
      email: "invalid-email",
      password: "123",
      name: "J",
    };

    act(() => {
      const isValid = result.current.validateForm(validForm);
      expect(isValid).toBe(true);
    });

    act(() => {
      const isValid = result.current.validateForm(invalidForm);
      expect(isValid).toBe(false);
    });

    expect(result.current.errors.email).toBe("Invalid email");
    expect(result.current.errors.password).toBe("Password too short");
    expect(result.current.errors.name).toBe("Name too short");
  });

  it("should clear specific field error", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema })
    );

    // Set some errors first
    act(() => {
      result.current.validateForm({
        email: "invalid",
        password: "123",
        name: "J",
      });
    });

    expect(result.current.errors.email).toBeTruthy();

    act(() => {
      result.current.clearError("email");
    });

    expect(result.current.errors.email).toBeNull();
    expect(result.current.errors.password).toBeTruthy(); // Other errors remain
  });

  it("should reset all validation state", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema })
    );

    // Set some state first
    act(() => {
      result.current.handleBlur("email", "test@example.com", {
        email: "test@example.com",
        password: "password123",
        name: "John",
      });
      result.current.validateForm({
        email: "invalid",
        password: "123",
        name: "J",
      });
    });

    expect(result.current.touched.email).toBe(true);
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

    act(() => {
      result.current.reset();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isValid).toBe(false);
  });

  it("should update isValid when errors change", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema })
    );

    expect(result.current.isValid).toBe(false);

    // Simulate touching all fields and making them valid
    const validForm = {
      email: "test@example.com",
      password: "password123",
      name: "John Doe",
    };

    act(() => {
      result.current.handleBlur("email", validForm.email, validForm);
    });
    act(() => {
      result.current.handleBlur("password", validForm.password, validForm);
    });
    act(() => {
      result.current.handleBlur("name", validForm.name, validForm);
    });

    // Now, manually validate the form one more time to update errors,
    // which will then trigger the isValid update
    act(() => {
      result.current.validateForm(validForm);
    });

    // All fields are now touched and there are no errors, so isValid should be true
    expect(result.current.isValid).toBe(true);

    // Add an error
    act(() => {
      result.current.validateForm({
        email: "invalid-email",
        password: "password123",
        name: "John Doe",
      });
    });

    expect(result.current.isValid).toBe(false);
  });
  it("should clear an error for a field that becomes valid on blur", async () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema, debounceMs: 100 })
    );

    act(() => {
      result.current.handleBlur("email", "invalid-email", {
        email: "invalid-email",
        password: "password123",
        name: "John",
      });
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current.errors.email).toBe("Invalid email");

    act(() => {
      result.current.handleBlur("email", "john@example.com", {
        email: "john@example.com",
        password: "password123",
        name: "John",
      });
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current.errors.email).toBeNull();
  });
  it("should return false and set multiple errors on invalid form data", () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema })
    );
    const invalidForm = {
      email: "invalid",
      password: "123",
      name: "a",
    };

    let isValid = false;
    act(() => {
      isValid = result.current.validateForm(invalidForm);
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.email).toBe("Invalid email");
    expect(result.current.errors.password).toBe("Password too short");
    expect(result.current.errors.name).toBe("Name too short");
  });
  it("should debounce rapid field validation calls", async () => {
    const { result } = renderHook(() =>
      useFormValidation({ schema: testSchema, debounceMs: 200 })
    );

    act(() => {
      // Rapidly change the input
      result.current.handleBlur("email", "invalid", {
        email: "invalid",
        password: "123",
        name: "John",
      });
      jest.advanceTimersByTime(100);
      result.current.handleBlur("email", "still-invalid", {
        email: "still-invalid",
        password: "123",
        name: "John",
      });
      jest.advanceTimersByTime(100);
      result.current.handleBlur("email", "invalid-final", {
        email: "invalid-final",
        password: "123",
        name: "John",
      });
    });

    // The timer has not finished, so no error should be set yet
    expect(result.current.errors.email).toBeUndefined();

    // Fast-forward to after the final debounce period
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Only the last input should have been validated
    expect(result.current.errors.email).toBe("Invalid email");
  });
  it("should set a general error if validation fails for a non-ZodError", () => {
    // Create a mock schema that throws a generic error
    const mockSchema = {
      parse: jest.fn(() => {
        throw new Error("Validation failed");
      }),
    } as unknown as z.ZodSchema;

    const { result } = renderHook(() =>
      useFormValidation({ schema: mockSchema })
    );

    let isValid = true;
    act(() => {
      isValid = result.current.validateForm({});
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.general).toBe("Validation failed");
  });
});
