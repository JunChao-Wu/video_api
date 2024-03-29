import { dataRoleObj } from '../../utils/request/ValidateUtil'
import { ModelMaker, roleObj } from '../../utils/request/ModelMaker'

export class UploadRole {
  static get upload(): dataRoleObj {
    return {
      targetRole: {
        type: UploadModel.type,
        fileHash: UploadModel.fileHash,
        chunk: UploadModel.chunk,
        chunkHash: UploadModel.chunkHash,
      },
      isReturn: true,
    }
  }
  static get merge(): dataRoleObj {
    return {
      targetRole: {
        type: UploadModel.type,
        fileHash: UploadModel.fileHash,
        fileName: UploadModel.fileName,
        chunkSize: UploadModel.chunkSize,
      },
      isReturn: true,
    }
  }
}

class UploadModel {
  static get type(): roleObj {
    return new ModelMaker().string().defaultTo("video").emu(["video", "image"]).keys()
  }
  static get fileHash(): roleObj {
    return new ModelMaker().string().required().keys()
  }
  static get chunk(): roleObj {
    return new ModelMaker().arraybuffer().required().keys()
  }
  static get chunkHash(): roleObj {
    return new ModelMaker().string().required().keys()
  }
  static get fileName(): roleObj {
    return new ModelMaker().string().required().keys()
  }
  static get chunkSize(): roleObj {
    return new ModelMaker().integer().required().keys()
  }
}