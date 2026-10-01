import { customAlphabet } from "nanoid";

const short = customAlphabet("abcdefghjkmnpqrstuvwxyz23456789", 6);
const token = customAlphabet("abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789", 22);

export function newSlug() {
  return short();
}

export function newToken() {
  return token();
}
