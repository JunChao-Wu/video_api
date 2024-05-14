const prefix = 'service'
const version = 'v1'

export const BASE_ROUTE = {
  auth: `${prefix}/${version}/auth`,
  upload: `${prefix}/${version}/upload`,
  user: `${prefix}/${version}/user`,
  examine: `${prefix}/${version}/examine`,
  series: `${prefix}/${version}/series`,
} as const;

export const API = {
  auth: {
    login_post: "/login",
    token_get: "/token",
    refresh_get: "/token/rt",
    checkRole_get: "/checkRole",
  },
  upload: {
    upload_post: "",
    merge_post: "/merge",
    vertify_post: "/vertify",
    transform_post: "/transform",
  },
  user: {
    login_post: "/login",
  },
  examine: {
    list_get: "",
  },
  series: {
    list_get: "",
    mime_get: "/mime",
    add_post: "",
    update_put: "",
    getNames_get: "/names",
    info_get: "/info",
  }
} as const;