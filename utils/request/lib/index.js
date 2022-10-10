'use strict'

const axios = require('axios');

const request = axios.create({
  baseURL: process.env.WEIMOB_CLI_BASE_URL
    ? process.env.WEIMOB_CLI_BASE_URL
    : 'http://localhost:3000',
  timeout: 5000,
})

request.interceptors.response.use(
  function (response) {
    return response.data
  },
  function (error) {
    return Promise.reject(error)
  },
)

module.exports = request
