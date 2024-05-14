import * as UUID from "uuid-int"

const workId = 11;

const generator = UUID(workId);

export class IDGenerator {
  static getId () {
    return generator.uuid();
  }
}