/**
 * public
 */
export type OrderType = "desc" | "asc";

/**
 * users
 */
export const USERS_DB_FIELDS_MAP = {
  id: "id",
  user_id: "user_id",
  user_name: "user_name",
  user_email: "user_email",
  user_password: "user_password",
  user_role_id: "user_role_id",
  timezone: "timezone",
  created_at: "created_at",
  updated_at: "updated_at",
} as const;
export type UsersDBFieldsType = keyof typeof USERS_DB_FIELDS_MAP;

/**
 * roles
 */
export const ROLES_DB_FIELDS_MAP = {
  id: "id",
  roles_name: "roles_name",
}
export type RolesDBFieldsType = keyof typeof ROLES_DB_FIELDS_MAP;

/**
 * series
 */
export const SERIES_DB_FIELDS_MAP = {
  id: "id",
  series_id: "series_id",
  series_name: "series_name",
  series_region: "series_region",
  series_type: "series_type",
  series_alias: "series_alias",
  series_introduction: "series_introduction",
  series_original_worker: "series_original_worker",
  series_production_company: "series_production_company",
  series_premiere_date: "series_premiere_date",
  series_status: "series_status",
  series_tags: "series_tags",
  series_cover_path: "series_cover_path",
  created_user_id: "created_user_id",
  updated_user_id: "updated_user_id",
  created_timezone: "created_timezone",
  updated_timezone: "updated_timezone",
  created_time: "created_time",
  updated_time: "updated_time",
} as const;
export type SeriesDBFieldsType = keyof typeof SERIES_DB_FIELDS_MAP;

/**
 * series
 */
export const VIDEOS_DB_FIELDS_MAP = {
  id: "id",
  video_id: "video_id",
  video_series_id: "video_series_id",
  video_title: "video_title",
  video_resource_path: "video_resource_path",
  video_remote_path: "video_remote_path",
  video_hash: "video_hash",
  video_aspect_ratio: "video_aspect_ratio",
  video_duration: "video_duration",
  video_size: "video_size",
  video_bitrate: "video_bitrate",
  video_ext: "video_ext",
  video_sequence: "video_sequence",
  status: "status",
  created_user_id: "created_user_id",
  updated_user_id: "updated_user_id",
  created_timezone: "created_timezone",
  updated_timezone: "updated_timezone",
  created_time: "created_time",
  updated_time: "updated_time",
} as const;

export type VideosDBFieldsType = keyof typeof VIDEOS_DB_FIELDS_MAP;


