import { Injectable } from '@nestjs/common';
import { db_video } from "../../utils/db_client/db_video";
import { VIDEOS_COMMON } from 'src/common/common';
import { OrderType } from './impl/CommonDB';
import { IDGenerator } from 'src/utils/IDGenerator';
import { _dayjs } from 'src/utils/time/_dayjs';
import { _lodash } from 'src/utils/_lodash';
import { convertDBFields } from 'src/utils/convertFields';

// video表status字段 0: 待审核 1: 完成 2: 已审核,正在转换视频格式 11： 拒绝

@Injectable()
export class VideoService {
  #videos;
  #invertReflect: any;
  constructor() {
    this.#videos = db_video.video;
    this.#invertReflect = _lodash.invert(VIDEOS_COMMON.keyReflect)
  }

  findBySeriesIdAndSequence (config: {seriesId: number, sequence: number}) {
    return this.#videos.count({
      where: {
        video_series_id: config.seriesId,
        video_sequence: config.sequence,
      }
    })
  }

  async findById (videoId: number) {
    const result = await this.#videos.findFirst({
      where: {
        video_id: videoId
      }
    });
    return result;
  }

  createOne (config: CreateVideoInfoType) {
    console.log("🚀 ~ VideoService ~ createOne ~ config:", config)
    config.videoId = IDGenerator.getId();
    if (config.userId) {
      config.updatedUserId = config.userId;
      config.createdUserId = config.userId;
    }
    if (config.timezone !== null || config.timezone !== undefined) {
      config.createdTimezone = config.timezone;
      config.updatedTimezone = config.timezone;
    }
    config.createdTime = +_dayjs().utcOffset(config.createdTimezone || 8).format("YYYYMMDDHHmmss");
    config.updatedTime = config.createdTime;

    const create: {
      [key:string]: any
    } = {};
    convertDBFields(create, config, "videos")
    console.log("🚀 ~ VideoService ~ _lodash.mapKeys ~ create:", create)
    return this.#videos.create({
      data: create as any
    });
  }




  updateOne(config: UpdateVideoInfoType) {
    console.log("🚀 ~ VideoService ~ updateOne ~ config:", config)
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
    convertDBFields(update, config, "videos");
    console.log("🚀 ~ VideoService ~ updateOne ~ update:", update)

    return this.#videos.updateMany({
      data: update,
      where: {
        video_id: config.videoId,
      }
    })
  }

  async list (filter: filterType) {
    console.log("🚀 ~ VideoService ~ list ~ filter:", filter)
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
    const [total, list] = await db_video.$transaction([
      this.#videos.count({
        where: {
          status: {
            in: filter.status || [1]
          }
        }
      }),
      this.#videos.findMany({
        select: {
          video_id: true,
          video_title: true,
          // video_series_id: true,
          video_source_path: true,
          video_hash: true,
          status: true,
          video_duration: true,
          video_bitrate: true,
          video_size: true,
          video_aspect_ratio: true,
          created_time: true,
          // created_user_id: true,
          createdUser: {
            select: {
              user_name: true,
            }
          },
          seriesInfo: {
            select: {
              series_name: true
            }
          }
        },
        where: {
          status: {
            in: filter.status || [1]
          }
        },
        skip,
        take,
        orderBy: sort
      })
    ])
    return { total, list }
  }

}


export type videoInfoType = {
  id?: number;
  videoId?: number;
  seriesId?: number;
  title?: string;
  sourcePath?: string;
  remotePath?: string;
  videoHash?: string;
  aspectRatio?: string;
  duration?: number;
  size?: number;
  bitrate?: number;
  extName?: string;
  sequence?: number;
  status?: number;
  createdUserId?: number;
  updatedUserId?: number;
  createdTimezone?: number;
  updatedTimezone?: number;
  createdTime?: number;
  updatedTime?: number;
}

export type CreateVideoInfoType = videoInfoType & {userId: number, timezone?: number};
export type UpdateVideoInfoType = videoInfoType & {userId: number, timezone?: number};

type filterType = {
  page?: number,
  pageSize?: number,
  videoIds?: Array<number>,
  sort?: sortType,
  status?: Array<number>,
}

type sortType = {
  video_size?: OrderType
  created_time?: OrderType
  videoOrder?: OrderType
}
