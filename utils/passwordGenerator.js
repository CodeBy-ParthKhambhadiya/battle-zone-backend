// ✅ Generate a strong 8-character password
export const generateStrongPassword = () => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "@#$&";

  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";

  // ✅ Ensure at least one from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // ✅ Fill the rest up to 8 characters
  for (let i = 4; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // ✅ Shuffle to make it less predictable
  password = password.split('').sort(() => 0.5 - Math.random()).join('');

  return password;
};
