import type { UserDict } from "../hooks";

export const checkUsername = (username: string, users?: UserDict) => {
  if (!users) return false;

  if (username.length === 0) {
    return false;
  }

  const usernameFormat = /^[0-9a-z-_\.]{1,64}$/g;
  const isUsernameValid = usernameFormat.test(username);

  if (!isUsernameValid) {
    return "Nama pengguna cuman bisa mengandung huruf kecil dan angka.";
  } else if (users[username]) {
    return "Maaf banget nih, nama pengguna itu udah ada yang punya. Ganti yang lain ya...";
  } else {
    return false;
  }
};
