import { createHash, randomBytes, timingSafeEqual } from "crypto";

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (
  password: string,
  hashedPassword: string,
): boolean => {
  const [salt, hash] = hashedPassword.split(":");
  const verifyHash = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
};
