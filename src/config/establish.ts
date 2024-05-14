import * as dotenv from "dotenv"

export function establish () {
  dotenv.config();
  BigInt.prototype.toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };
}