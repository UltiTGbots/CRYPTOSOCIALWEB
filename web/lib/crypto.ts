import crypto from "crypto";
export function randomNonce(len = 16) {
  return crypto.randomBytes(len).toString("hex");
}
