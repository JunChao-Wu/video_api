import { Controller, Get, UseGuards } from '@nestjs/common'
import { BaseController } from './impl/base.controller';

import { BASE_ROUTE, API } from '../routes/Routes'
import { AuthGuard } from 'src/guards/auth.guard';
import { VideoService } from 'src/service/db_video/video.service';
import { convertFields } from 'src/utils/convertFields';
import { VIDEOS_COMMON } from 'src/common/common';
import { _lodash } from 'src/utils/_lodash';

@Controller(BASE_ROUTE.examine)
export class ExamineController extends BaseController {
  constructor(
    private videoService: VideoService,
  ) {
    super ()
  }

  @UseGuards(AuthGuard)
  @Get(API.examine.list_get)
  async examineList (): Promise<object> {
    let result = this.makeBaseResult();
    try {
      const { total, list } = await this.videoService.list({
        status: [0, 2]
      });
      const examineList = convertFields(list, "videos");

      result = this.makeSuccessResult({succ: true, data: {
        total: total,
        data: examineList,
        statusMap: _lodash.invert(VIDEOS_COMMON.status)
      }}, "examineList");
    } catch (error) {
      this.makeErrorResult(error, "examineList");
    }
    return result;
  }
}
