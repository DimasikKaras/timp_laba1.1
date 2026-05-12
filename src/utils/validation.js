export const fioPattern =
  '^([А-Яа-яЁё]+\\s+[А-Яа-яЁё]+(\\s+[А-Яа-яЁё]+)?|[А-Яа-яЁё]+\\s+[А-Яа-яЁё]\\.?(\\s*[А-Яа-яЁё]\\.?)?)$';
const fioRegex = new RegExp(fioPattern);
const phoneRegex = /^(\+7|8)[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;

export const validateFIO = (name) => fioRegex.test(name.trim());
export const validatePhone = (phone) => phoneRegex.test(phone.trim());
