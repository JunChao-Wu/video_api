import * as _ from 'lodash';

import { Controller, Get, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common'
import { BaseController } from './impl/base.controller';

import { BASE_ROUTE, API } from '../routes/Routes'
import { AuthGuard } from 'src/guards/auth.guard';
import { SeriesService } from 'src/service/db_video/series.service';
import { Validate } from 'src/decorator/validate.decorator';
import { SeriesRole } from 'src/validate/series/SeriesRole';
import { SeriesAdd, SeriesInfo, SeriesList, SeriesName, SeriesUpdate } from 'src/validate/series/seriesRole_d';
import { _copyFile } from 'src/utils/fsUtil/FsUtil';
import { CacheInterceptor } from 'src/interceptors/cache.interceptor';
import { RedisService } from 'src/service/redis/redis.service';
import { processRemoveKey } from 'src/service/redis/impl/keyGenerator';
import { SeriesKeyReflect, REDIS_KEY_COMMON, SERIES_COMMON } from 'src/common/common';
import { convertFields } from 'src/utils/convertFields';
import { RabbitmqService } from 'src/service/mq/rabbitmq.service';

@Controller(BASE_ROUTE.series)
export class SeriesController extends BaseController {
  #cacheName: string;
  constructor(
    private seriesService: SeriesService,
    private redisService: RedisService,
    private rabbitmqService: RabbitmqService,
  ) {
    super();
    this.#cacheName = REDIS_KEY_COMMON.cacheName.seriesList;
  }

  @UseGuards(AuthGuard)
  @Post(API.series.add_post)
  async setSeries (@Validate(SeriesRole.add) reqClone: SeriesAdd): Promise<object> {
    let result = this.makeBaseResult();
    const { user } = reqClone;
    try {
      let targetPath = "";
      if (reqClone.coverPath) {
        // 先复制到outputs目录
        const sourcePath = reqClone.coverPath;
        targetPath = sourcePath.replace(/uploads\/file/g, "outputs");
        _copyFile(sourcePath, targetPath)
      }
      await this.seriesService.createOne({
        seriesName: reqClone.seriesName,
        alias: reqClone.alias,
        introduction: reqClone.introduction,
        originalWorker: reqClone.originalWorker,
        premiereDate: reqClone.premiereDate,
        company: reqClone.company,
        region: reqClone.region,
        status: reqClone.status,
        coverPath: targetPath,
        type: reqClone.type,
        userId: reqClone.user?.id as number,
        timezone: user?.timezone
      });
      this.redisService.removeCache(processRemoveKey(this.#cacheName))
      result = this.makeSuccessResult({succ: true}, "setSeries");
    } catch (error) {
      result = this.makeErrorResult(error, "setSeries");
    }
    return result;
  }

  @UseGuards(AuthGuard)
  @Put(API.series.update_put)
  async updateSeries (@Validate(SeriesRole.update) reqClone: SeriesUpdate): Promise<object> {
    let result = this.makeBaseResult();
    try {
      let targetPath = "";
      if (reqClone.coverPath) {
        // 复制到outputs目录
        const sourcePath = reqClone.coverPath;
        targetPath = sourcePath.replace(/uploads\/file/g, "outputs");
        _copyFile(sourcePath, targetPath)
      }
      await this.seriesService.updateOne({
        seriesId: reqClone.seriesId,
        seriesName: reqClone.seriesName,
        alias: reqClone.alias,
        originalWorker: reqClone.originalWorker,
        premiereDate: reqClone.premiereDate,
        company: reqClone.company,
        region: reqClone.region,
        status: reqClone.status,
        coverPath: targetPath,
        type: reqClone.type,
        userId: reqClone.user?.id as number,
        timezone: reqClone.user?.timezone,
      });
      // 清缓存
      this.redisService.removeCache(processRemoveKey(this.#cacheName))
      result = this.makeSuccessResult({succ: true}, "updateSeries")
    } catch (error) {
      result = this.makeErrorResult(error, "updateSeries");
    }
    return result;
  }

  // @UseInterceptors(new CacheInterceptor(REDIS_KEY_COMMON.cacheName.seriesList, true))
  @Get(API.series.list_get)
  async seriesPublcList (@Validate(SeriesRole.list) reqClone: SeriesList): Promise<object> {
    let result = this.makeBaseResult();
    try {
      const { total, list } = await this.seriesService.findMany({
        page: reqClone.page,
        pageSize: reqClone.pageSize,
      });

      const res = convertFields(list, "series");
      result = this.makeSuccessResult({succ: true, data: {
        total: total,
        data: res,
        statusMap: SERIES_COMMON.statusMap,
      }}, "seriesList");
    } catch (error) {
      this.makeErrorResult(error, "seriesList");
    }
    return result;
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(new CacheInterceptor(REDIS_KEY_COMMON.cacheName.seriesList, true))
  @Get(API.series.mime_get)
  async mimeSeriesList (@Validate(SeriesRole.list) reqClone: SeriesList): Promise<object> {
    let result = this.makeBaseResult();
    try {
      const { total, list } = await this.seriesService.findMany({
        page: reqClone.page,
        pageSize: reqClone.pageSize,
      });
      const res = list.map((data) => {
        return _.mapKeys(data, function(v, k: SeriesKeyReflect) {
          return SERIES_COMMON.keyReflect[k] ? SERIES_COMMON.keyReflect[k] : k;
        })
      })
      result = this.makeSuccessResult({succ: true, data: {
        total: total,
        data: res
      }}, "mimeSeriesList");
    } catch (error) {
      this.makeErrorResult(error, "mimeSeriesList");
    }
    return result;
  }

  @UseGuards(AuthGuard)
  @Get(API.series.getNames_get)
  async seriesNames (@Validate(SeriesRole.getNames) reqClone: SeriesName): Promise<object> {
    let result = this.makeBaseResult();
    try {
      const list = await this.seriesService.findNames({
        page: reqClone.page,
        pageSize: reqClone.pageSize,
        seriesName: reqClone.seriesName,
      });
      const res = list.map((data) => {
        return _.mapKeys(data, function(v, k: SeriesKeyReflect) {
          return SERIES_COMMON.keyReflect[k] ? SERIES_COMMON.keyReflect[k] : k;
        })
      })
      result = this.makeSuccessResult({succ: true, data: {
        data: res
      }}, "seriesNames");
    } catch (error) {
      this.makeErrorResult(error, "seriesNames");
    }
    return result;
  }

  @UseGuards(AuthGuard)
  @Get(API.series.info_get)
  async seriesInfo (@Validate(SeriesRole.info) reqClone: SeriesInfo): Promise<object> {
    const { seriesId } = reqClone
    let result = this.makeBaseResult();
    try {
      const seriesInfo = await this.seriesService.findSimplyById(seriesId);
      const info = convertFields(seriesInfo, "series");
      const vList = convertFields(seriesInfo?.videos, "videos")
      delete info.videos;
      result = this.makeSuccessResult({succ: true, data: {
        info: info,
        videos: vList
      }}, "seriesInfo");
    } catch (error) {
      this.makeErrorResult(error, "seriesInfo");
    }
    return result;
  }


}
