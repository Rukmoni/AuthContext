import { validateEmail, validatePassword, validateName, getValidationError } from '../validators';

describe('validators', () => {
  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for passwords with 6 or more characters', () => {
      expect(validatePassword('123456')).toBe(true);
      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('verylongpassword')).toBe(true);
    });

    it('should return false for passwords with less than 6 characters', () => {
      expect(validatePassword('')).toBe(false);
      expect(validatePassword('12345')).toBe(false);
      expect(validatePassword('abc')).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should return true for names with 2 or more characters', () => {
      expect(validateName('John')).toBe(true);
      expect(validateName('Jane Doe')).toBe(true);
      expect(validateName('Al')).toBe(true);
    });

    it('should return false for names with less than 2 characters', () => {
      expect(validateName('')).toBe(false);
      expect(validateName(' ')).toBe(false);
      expect(validateName('A')).toBe(false);
      expect(validateName('  ')).toBe(false);
    });
  });

  describe('getValidationError', () => {
    describe('email validation', () => {
      it('should return error for empty email', () => {
        expect(getValidationError('email', '')).toBe('Email is required');
        expect(getValidationError('email', '   ')).toBe('Email is required');
      });

      it('should return error for invalid email format', () => {
        expect(getValidationError('email', 'invalid')).toBe('Please enter a valid email address');
        expect(getValidationError('email', 'test@')).toBe('Please enter a valid email address');
      });

      it('should return null for valid email', () => {
        expect(getValidationError('email', 'test@example.com')).toBe(null);
      });
    });

    describe('password validation', () => {
      it('should return error for empty password', () => {
        expect(getValidationError('password', '')).toBe('Password is required');
      });

      it('should return error for short password', () => {
        expect(getValidationError('password', '12345')).toBe('Password must be at least 6 characters');
      });

      it('should return null for valid password', () => {
        expect(getValidationError('password', '123456')).toBe(null);
      });
    });

    describe('name validation', () => {
      it('should return error for empty name', () => {
        expect(getValidationError('name', '')).toBe('Name is required');
        expect(getValidationError('name', '   ')).toBe('Name is required');
      });

      it('should return error for short name', () => {
        expect(getValidationError('name', 'A')).toBe('Name must be at least 2 characters');
      });

      it('should return null for valid name', () => {
        expect(getValidationError('name', 'John')).toBe(null);
      });
    });

    it('should return null for unknown field', () => {
      expect(getValidationError('unknown', 'value')).toBe(null);
    });
  });
});