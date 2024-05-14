import { baseRole } from "../baseRole_d";

type fileType = "image" | "video";

export interface upload extends baseRole {
  type: fileType;
  fileHash: string;
  chunk: Buffer;
  chunkHash: string
}
export interface merge extends baseRole {
  type: fileType,
  fileHash: string,
  fileName: string,
  extName: string,
  chunkSize: number,
  seriesId: number,
  sequence: number,
}
export interface vertify extends baseRole {
  type: fileType,
  fileHash: string,
  seriesId: number,
  sequence: number,
}
export interface transform extends baseRole {
  videoId: number,
  pass: boolean,
}
