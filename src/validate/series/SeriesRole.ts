import { dataRoleObj } from '../../utils/request/ValidateUtil'
import { ModelMaker, roleObj } from '../../utils/request/ModelMaker'

export class SeriesRole {
  static get list(): dataRoleObj {
    return {
      targetRole: {
        page: SeriesModel.page,
        pageSize: SeriesModel.pageSize,
      },
      isReturn: true,
    }
  }
  static get getNames(): dataRoleObj {
    return {
      targetRole: {
        page: SeriesModel.page,
        pageSize: SeriesModel.pageSize,
        seriesName: SeriesModel.seriesName,
      },
      isReturn: true,
    }
  }
  static get add(): dataRoleObj {
    return {
      targetRole: {
        seriesName: SeriesModel.seriesName,
        region: SeriesModel.region,
        type: SeriesModel.type,
        alias: SeriesModel.alias,
        originalWorker: SeriesModel.originalWorker,
        company: SeriesModel.company,
        premiereDate: SeriesModel.premiereDate,
        coverPath: SeriesModel.filePath,
        status: SeriesModel.status,
        introduction: SeriesModel.introduction,
      },
      isReturn: true,
    }
  }
  static get update(): dataRoleObj {
    return {
      targetRole: {
        seriesId: SeriesModel.seriesId,
        seriesName: SeriesModel.seriesName,
        region: SeriesModel.region,
        type: SeriesModel.type,
        alias: SeriesModel.alias,
        originalWorker: SeriesModel.originalWorker,
        company: SeriesModel.company,
        premiereDate: SeriesModel.premiereDate,
        coverPath: SeriesModel.filePath,
        status: SeriesModel.status,
      },
      isReturn: true,
    }
  }
  static get info(): dataRoleObj {
    return {
      targetRole: {
        seriesId: SeriesModel.seriesId,
      },
      isReturn: true,
    }
  }
}

class SeriesModel {
  static get page(): roleObj {
    return new ModelMaker().integer().required().keys()
  }
  static get pageSize(): roleObj {
    return new ModelMaker().integer().required().keys()
  }
  static get seriesId(): roleObj {
    return new ModelMaker().integer().required().keys()
  }
  static get seriesName(): roleObj {
    return new ModelMaker().string().required().keys()
  }
  static get region(): roleObj {
    return new ModelMaker().string().keys()
  }
  static get type(): roleObj {
    return new ModelMaker().integer().emu<number>([0, 1, 2, 3]).keys()
  }
  static get alias(): roleObj {
    return new ModelMaker().string().keys()
  }
  static get company(): roleObj {
    return new ModelMaker().string().keys()
  }
  static get originalWorker(): roleObj {
    return new ModelMaker().string().keys()
  }
  static get premiereDate(): roleObj {
    return new ModelMaker().integer().keys()
  }
  static get filePath(): roleObj {
    return new ModelMaker().string().keys()
  }
  static get status(): roleObj {
    return new ModelMaker().integer().emu([0, 1, 2]).keys()
  }
  static get introduction(): roleObj {
    return new ModelMaker().string().keys()
  }
}