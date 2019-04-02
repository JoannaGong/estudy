import Vue from 'vue'

import axios from 'axios'
const HOST = "http://sandbox_api.estudy.chanke.xyz/"

const api = axios.create({
  baseURL: `${HOST}/`,
  timeout: 10000,
});
api.defaults.withCredentials = true;
api.defaults.headers.post['Content-Type'] = 'application/json';
// api.defaults.headers.common['Access-Control-Allow-Origin'] = "*";
api.interceptors.response.use(function (response) {
    return response.data.data;  // 后端结构统一用 data 字段
  }, function (error) {
    const originalRequest = error.config;
    const resp = error.response;
    if (!originalRequest._silent) {
      Vue.$notify.error({
        message: 'API Error',
        description: resp ? resp.data.errorMessage : error.message
      });
    }
    console.log(111);
    return Promise.reject(error);
  });

export { axios, api }