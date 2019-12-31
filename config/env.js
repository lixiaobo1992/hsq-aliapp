// ENV

const apiEnv = 'beta'; // dev beta prod

export const ENV = {
  prod: {
    host: 'm.haoshiqi.net',
    baseUrl: 'https://m.haoshiqi.net',
    apiBaseUrl: 'https://m.api.haoshiqi.net',
  },
  dev: {
    host: 'm.dev.haoshiqi.net',
    baseUrl: 'http://m.dev.haoshiqi.net',
    apiBaseUrl: 'https://m.devapi.haoshiqi.net',
  },
  beta: {
    host: 'm.beta.haoshiqi.net',
    baseUrl: 'http://m.beta.haoshiqi.net',
    apiBaseUrl: 'https://m.betaapi.haoshiqi.net',
  },
  test: {
    baseUrl: 'https://127.0.0.1',
    apiBaseUrl: 'https://m.betaapi.haoshiqi.net',
  },
};

const baseEnv = {
  port: 8001,
  debug: false,
  publicPath: '',
  baseUrl: '',
  apiBaseUrl: '',
};

function createEnv(opts = {}) {
  const { env = 'prod' } = opts;
  return Object.assign({}, baseEnv, ENV[env], opts);
}

// 默认会有个 api 配置，之后会读取 store
export default createEnv({
  env: apiEnv,
});
