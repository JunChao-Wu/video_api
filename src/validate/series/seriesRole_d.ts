import { baseRole } from "../baseRole_d";


export interface SeriesList extends baseRole {
  page: number;
  pageSize: number;
}
export interface SeriesName extends baseRole {
  page: number;
  pageSize: number;
  seriesName: string;
}
export interface SeriesAdd extends baseRole {
  seriesName: string;
  region: string;
  type: number;
  alias: string;
  originalWorker: string;
  company: string;
  premiereDate: number;
  coverPath: string;
  status: number;
  introduction: string;
}
export interface SeriesUpdate extends baseRole {
  seriesId: number;
  seriesName: string;
  region: string;
  type: number;
  alias: string;
  originalWorker: string;
  company: string;
  premiereDate: number;
  coverPath: string;
  status: number;
}
export interface SeriesInfo extends baseRole {
  seriesId: number;
}