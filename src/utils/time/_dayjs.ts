import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const _dayjs = dayjs;
