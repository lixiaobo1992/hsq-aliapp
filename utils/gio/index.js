var gio = require("./gio-alip.js").default;
const config =  {
  projectId: 'ae08570d515c7766',
  appId: '2017112000051610',
  version: '1.0'
};

function gioInit() {
  gio('setConfig', config);
}

export default gioInit;
