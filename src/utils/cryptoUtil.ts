
import * as crypto from "crypto";

export function sha256(text: string) {
  const hash = crypto.createHash('sha256');
  hash.update(text);
  return hash.digest('hex');
}
