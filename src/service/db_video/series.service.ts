import { Injectable } from '@nestjs/common';
import { db_video } from "../../utils/db_client/db_video";
import { OrderType } from './impl/CommonDB';
import { IDGenerator } from 'src/utils/IDGenerator';
import { SERIES_COMMON, VIDEOS_COMMON } from 'src/common/common';
import { _dayjs } from 'src/utils/time/_dayjs';
import { _lodash } from 'src/utils/_lodash';

@Injectable()
export class SeriesService {
  #series;
  #videos;
  #invertReflect;
  constructor() {
    this.#series = db_video.series;
    this.#videos = db_video.video;
    this.#invertReflect = _lodash.invert(SERIES_COMMON.keyReflect);
  }

  async findById (seriesId: number) {
    const result = await this.#series.findFirst({
      where: {
        series_id: seriesId
      },
      select: {
        series_id: true,
        series_alias: true,
        series_name: true,
        series_cover_path: true,
        series_introduction: true,
        series_original_worker: true,
        series_premiere_date: true,
        series_production_company: true,
        series_region: true,
        series_status: true,
        series_tags: true,
        series_type: true,
      }
    });
    return result;
  }

  async findSimplyById (seriesId: number) {
    const seriesInfo = await this.#series.findFirst({
      where: {
        series_id: seriesId
      },
      select: {
        series_id: true,
        series_name: true,
        series_introduction: true,
        series_status: true,
        series_type: true,
        series_cover_path: true,
        series_original_worker: true,
        series_region: true,
        videos: {
          where: {
            status: VIDEOS_COMMON.status.success
          },
          select: {
            video_id: true,
            video_series_id: true,
            video_title: true,
            video_sequence: true,
            status: true,
            video_duration: true,
            video_remote_path: true,
          }
        }
      }
    })
    return seriesInfo;
  }

  createOne (config: UpdatedSeriesType) {
    config.seriesId = IDGenerator.getId();
    if (config.userId) {
      config.createdUserId = config.userId;
      config.updatedUserId = config.userId;
    }
    if (config.timezone !== null || config.timezone !== undefined) {
      config.createdTimezone = config.timezone;
      config.updatedTimezone = config.timezone;
    }
    config.createdTime = +_dayjs().utcOffset(8).format("YYYYMMDDHHmmss");
    config.updatedTime = config.createdTime;
    const create: {
      [key:string]: any
    } = {};
    const invertReflect = this.#invertReflect;
    _lodash.mapKeys(config, function(v, k) {
      if (!invertReflect[k] || v === null || v === undefined) {
        return;
      }
      create[invertReflect[k]] = v;
    })
    return this.#series.create({
      data: create as any
    });
  }

  updateOne (config: UpdatedSeriesType) {
    if (!config.seriesId) {
      throw new Error("缺少id")
    }
    if (config.userId) {
      config.updatedUserId = config.userId;
    }
    if (config.timezone !== null || config.timezone !== undefined) {
      config.updatedTimezone = config.timezone;
    }
    config.updatedTime = +_dayjs().utcOffset(config.updatedTimezone || 8).format("YYYYMMDDHHmmss");
    const update: {
      [key:string]: any
    } = {};
    const invertReflect = this.#invertReflect;
    _lodash.mapKeys(config, function(v, k) {
      if (!invertReflect[k] || v === null || v === undefined) {
        return;
      }
      update[invertReflect[k]] = v;
    })
    return this.#series.updateMany({
      where: {
        series_id: config.seriesId,
      },
      data: update,
    });
  }

  async findMany (filter: fileterType) {
    const page = filter.page || 1;
    const pageSize  = filter.pageSize || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    let sort: sortType = {
      created_time: 'desc',
    }
    sort = {
      ...sort,
      ...(filter.sort || {})
    }
    const _filter = {};
    const [total, list] = await db_video.$transaction([
      this.#series.count({
        where: _filter
      }),
      this.#series.findMany({
        select: {
          series_id: true,
          series_name: true,
          series_alias: true,
          series_cover_path: true,
          series_original_worker: true,
          series_premiere_date: true,
          series_production_company: true,
          series_region: true,
          series_status: true,
          series_tags: true,
          series_type: true,
          created_user_id: true,
          updated_time: true,
          created_time: true,
          videos: {
            select: {
              video_sequence: true,
            },
            orderBy: {
              video_sequence: "desc"
            },
            where: {
              status: VIDEOS_COMMON.status.success
            },
            take: 1,
          },
          _count: {
            select: {
              videos: {
                where: {
                  status: VIDEOS_COMMON.status.success
                }
              }
            },
          },
        },
        where: _filter,
        skip,
        take,
        orderBy: sort,
      }),
    ])
    return { total, list };
  }

  async findNames (filter: fileterType) {
    const page = filter.page || 1;
    const pageSize  = filter.pageSize || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    let sort: sortType = {
      created_time: 'desc',
    }
    sort = {
      ...sort,
      ...(filter.sort || {})
    }
    const _filter = {
      OR: [
        {
          series_name: {
            contains: filter.seriesName
          }
        },
        {
          series_alias: {
            contains: filter.seriesName
          }
        }
      ],
    };
    const list = await this.#series.findMany({
      select: {
        series_id: true,
        series_name: true,
      },
      where: _filter,
      skip,
      take,
      orderBy: sort
    })
    return list
  }
}

type seriesType = {
  id?: number,
  seriesId?: number,
  seriesName?: string,
  region?: string,
  type?: number,
  alias?: string,
  introduction?: string,
  originalWorker?: string,
  company?: string,
  premiereDate?: number,
  status?: number,
  tags?: string,
  coverPath?: string,
  createdUserId?: number,
  updatedUserId?: number,
  createdTimezone?: number,
  updatedTimezone?: number,
  createdTime?: number,
  updatedTime?: number,
}

type UpdatedSeriesType = seriesType & {userId: number, timezone?: number}

type fileterType = {
  page?: number,
  pageSize?: number,
  sort?: sortType,
  seriesName?: string,
}

type sortType = {
  created_time?: OrderType,
  updated_time?: OrderType,
}

