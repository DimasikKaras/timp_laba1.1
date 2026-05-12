export const fioRegex = /^[А-Яа-яЁё]+\s+[А-Яа-яЁё]+(\s+[А-Яа-яЁё]+)?$/;
export const phoneRegex = /^(\+7|8)[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;

export function validateFIO(value) {
  return fioRegex.test(value.trim());
}

export function validatePhone(value) {
  return phoneRegex.test(value.trim());
}
