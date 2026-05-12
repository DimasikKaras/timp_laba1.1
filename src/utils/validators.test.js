import { validateFIO, validatePhone } from './validators';

describe('validators', () => {
  test('validates russian fio strings', () => {
    expect(validateFIO('Иванов Иван')).toBe(true);
    expect(validateFIO('Иванов Иван Иванович')).toBe(true);
    expect(validateFIO('John Doe')).toBe(false);
  });

  test('validates phone numbers in supported formats', () => {
    expect(validatePhone('+7 999 000-00-00')).toBe(true);
    expect(validatePhone('89990000000')).toBe(true);
    expect(validatePhone('12345')).toBe(false);
  });
});
