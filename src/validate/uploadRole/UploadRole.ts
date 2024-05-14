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
        extName: UploadModel.extName,
        chunkSize: UploadModel.chunkSize,
        seriesId: UploadModel.seriesId,
        sequence: UploadModel.sequence,
      },
      isReturn: true,
    }
  }
  static get vertify(): dataRoleObj {
    return {
      targetRole: {
        type: UploadModel.type,
        fileHash: UploadModel.fileHash,
        seriesId: UploadModel.seriesId,
        sequence: UploadModel._sequence,
      },
      isReturn: true,
    }
  }
  static get transform(): dataRoleObj {
    return {
      targetRole: {
        videoId: UploadModel.videoId,
        pass: UploadModel.pass,
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
  static get extName(): roleObj {
    return new ModelMaker().string().required().keys()
  }
  static get chunkSize(): roleObj {
    return new ModelMaker().integer().required().keys()
  }
  static get path(): roleObj {
    return new ModelMaker().string().required().keys()
  }
  static get videoId(): roleObj {
    return new ModelMaker().integer().required().keys()
  }
  static get pass(): roleObj {
    return new ModelMaker().boolean().required().keys()
  }
  static get seriesId(): roleObj {
    return new ModelMaker().integer().keys()
  }
  static get sequence(): roleObj {
    return new ModelMaker().integer().required().keys()
  }
  static get _sequence(): roleObj {
    return new ModelMaker().integer().keys()
  }
}