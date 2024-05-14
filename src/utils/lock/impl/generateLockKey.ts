
const lockHead = "lock"

export function generateLockKey(key: string | number) {
  key = key + "";
  const keyList = [lockHead];
  keyList.push(key);
  return keyList.join(":");
}