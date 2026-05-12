export const fioPattern =
  '^([А-Яа-яЁё]+\\s+[А-Яа-яЁё]+(\\s+[А-Яа-яЁё]+)?|[А-Яа-яЁё]+\\s+[А-Яа-яЁё]\\.?(\\s*[А-Яа-яЁё]\\.?)?)$';
// Пароль: минимум 8 символов, без пробелов, с прописной/строчной буквой, цифрой и спецсимволом.
export const passwordPattern =
  '^(?=.*[a-zа-яё])(?=.*[A-ZА-ЯЁ])(?=.*\\d)(?=.*[^A-Za-zА-Яа-яЁё0-9\\s])(?!.*\\s).{8,}$';
const fioRegex = new RegExp(fioPattern);
const passwordRegex = new RegExp(passwordPattern);
const phoneRegex = /^(\+7|8)[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;

export const validateFIO = (name) => fioRegex.test(name.trim());
export const validatePhone = (phone) => phoneRegex.test(phone.trim());
export const validatePassword = (password) => passwordRegex.test(password);
