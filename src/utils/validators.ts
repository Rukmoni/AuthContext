export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };
  
  export const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };
  
  export const getValidationError = (field: string, value: string): string | null => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        return null;
      case 'password':
        if (!value) return 'Password is required';
        if (!validatePassword(value)) return 'Password must be at least 6 characters';
        return null;
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (!validateName(value)) return 'Name must be at least 2 characters';
        return null;
      default:
        return null;
    }
  };