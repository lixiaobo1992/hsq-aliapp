import { mapTo } from './map';
import miniConfig from '/app.json';


const { pages = [], tabBar = {} } = miniConfig;
const tabBarList = tabBar.items || [];

const tabPages = mapTo(tabBarList, (item) => {
  return item.pagePath;
});

// 自定义菜单时使用
// const { pages = [], tabBarPath: tabPages = [] } = miniConfig; // tabBarPath 自定义菜单路径


// const regPages = pages.map(item => item.split('/').slice(2)[0]);
function pagesMap(pageArr) {
  return pageArr.reduce((obj, item) => {
    const page = item.split('/').reverse()[0] || '';
    /* eslint no-param-reassign: 0 */
    obj[page] = `${item}`;
    return obj;
  }, {});
}

function pagesObj(allPages, tabPages) {
  return {
    allPages: pagesMap(allPages),
    tabPages: pagesMap(tabPages),
    defaultPage: allPages[0].split('/').reverse(),
  }
}

const miniPages = pagesObj(pages, tabPages);

console.log('注册页面：');
console.log(miniPages);

export default miniPages;
