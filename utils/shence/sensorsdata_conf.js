import env from '../../config/env';
const server_url = env.env === 'prod' ? 'https://scpoc.doweidu.com/sa?project=production' : 'https://scpoc.doweidu.com/sa?project=default';
var conf ={
  // 神策分析数据接收地址
  server_url,
  // 传入的字符串最大长度限制
  max_string_length: 300
};

export default conf;
