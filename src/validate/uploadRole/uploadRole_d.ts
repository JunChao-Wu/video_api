
export interface upload {
  type: fileType;
  fileHash: string;
  chunk: Buffer;
  chunkHash: string
}

export interface merge {
  type: fileType,
  fileHash: string,
  fileName: string,
  chunkSize: number,
}


type fileType = "image" | "video";