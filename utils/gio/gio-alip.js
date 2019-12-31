"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const Utils={devVer:1,guid:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(t){let e=16*Math.random()|0;return("x"==t?e:3&e|8).toString(16)})},getScreenHeight:function(t){return t.pixelRatio?Math.round(t.screenHeight*t.pixelRatio):t.screenHeight},getScreenWidth:function(t){return t.pixelRatio?Math.round(t.screenWidth*t.pixelRatio):t.screenWidth},getOS:function(t){if(t){let e=t.toLowerCase();return-1!=e.indexOf("android")?`${gioGlobal.platformConfig.name}-Android`:-1!=e.indexOf("ios")?`${gioGlobal.platformConfig.name}-iOS`:t}},getOSV:t=>`${gioGlobal.platformConfig.name} ${t}`,isEmpty:t=>{for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0},compareVersion(t,e){t=t.split("."),e=e.split(".");const i=Math.max(t.length,e.length);for(;i>t.length;)t.push("0");for(;i>e.length;)e.push("0");for(let n=0;i>n;n++){const i=parseInt(t[n]),o=parseInt(e[n]);if(i>o)return 1;if(o>i)return-1}return 0}},initGlobal=t=>{Object.defineProperty(Object.prototype,"gioGlobal",{get:()=>"quickApp"===t?global.__proto__:"my"===t?$global:global,configurable:!1,enumerable:!1})},getDataByPath=(t,e)=>{if(!t)return t;const i=e.split(".");let n=t[i.shift()];for(let t=0,e=i.length;e>t;t++){const t=i.shift();if(!n)return n;n=n[t]}return n};if(!Object.hasOwnProperty("getOwnPropertyDescriptors")){let t;t="object"==typeof Reflect&&"function"==typeof Reflect.ownKeys?Reflect.ownKeys:"function"==typeof Object.getOwnPropertySymbols?function(t){return Object.getOwnPropertyNames(t).concat(Object.getOwnPropertySymbols(t))}:Object.getOwnPropertyNames,Object.defineProperty(Object,"getOwnPropertyDescriptors",{configurable:!0,writable:!0,value:function(e){return t(e).reduce((t,i)=>Object.defineProperty(t,i,{configurable:!0,enumerable:!0,writable:!0,value:Object.getOwnPropertyDescriptor(e,i)}),{})}})}let setShareResult=t=>{let e=VdsInstrumentAgent.observer.growingio;e&&e.vdsConfig.followShare&&t&&t.path&&(t.path=-1===t.path.indexOf("?")?t.path+"?suid="+e.info.uid:t.path+"&suid="+e.info.uid)};const VdsInstrumentAgent={defaultPageCallbacks:{},defaultAppCallbacks:{},appHandlers:null,pageHandlers:null,actionEventTypes:null,originalPage:null,originalApp:null,originalComponent:null,originalBehavior:null,observer:null,hook:function(t,e){return function(){let i,n=arguments?arguments[0]:void 0;if(n&&(n.currentTarget||n.target)&&-1!=VdsInstrumentAgent.actionEventTypes.indexOf(n.type))try{VdsInstrumentAgent.observer.actionListener(n,t)}catch(t){console.error(t)}const o=gioGlobal.platformConfig.lisiteners.app,s=gioGlobal.platformConfig.lisiteners.page;if(this._growing_app_&&t!==o.appShow?i=e.apply(this,arguments):this._growing_page_&&-1===[s.pageShow,s.pageClose,s.pageLoad,s.pageHide,s.tabTap].indexOf(t)?i=e.apply(this,arguments):this._growing_app_||this._growing_page_||(i=e.apply(this,arguments)),this._growing_app_&&-1!==VdsInstrumentAgent.appHandlers.indexOf(t)){try{VdsInstrumentAgent.defaultAppCallbacks[t].apply(this,arguments)}catch(t){console.error(t)}t===o.appShow&&(i=e.apply(this,arguments))}if(this._growing_page_&&-1!==VdsInstrumentAgent.pageHandlers.indexOf(t)){let n=Array.prototype.slice.call(arguments);i&&n.push(i);try{VdsInstrumentAgent.defaultPageCallbacks[t].apply(this,n)}catch(t){console.error(t)}-1!==[s.pageShow,s.pageClose,s.pageLoad,s.pageHide,s.tabTap].indexOf(t)?i=e.apply(this,arguments):setShareResult(i)}return i}},hookComponent:function(t,e){return function(){let i,n=arguments?arguments[0]:void 0;if(n&&(n.currentTarget||n.target)&&-1!=VdsInstrumentAgent.actionEventTypes.indexOf(n.type))try{VdsInstrumentAgent.observer.actionListener(n,t)}catch(t){console.error(t)}return i=e.apply(this,arguments)}},instrument:function(t){for(let e in t)"function"==typeof t[e]&&(t[e]=this.hook(e,t[e]));return t._growing_app_&&VdsInstrumentAgent.appHandlers.map(function(e){t[e]||(t[e]=VdsInstrumentAgent.defaultAppCallbacks[e])}),t._growing_page_&&VdsInstrumentAgent.pageHandlers.map(function(e){t[e]||e===gioGlobal.platformConfig.lisiteners.page.shareApp||(t[e]=VdsInstrumentAgent.defaultPageCallbacks[e])}),t},instrumentPageComponent:function(t){if(t)return VdsInstrumentAgent.pageHandlers.map(function(e){if("function"==typeof t[e]){const i=t[e];t[e]=function(){const t=i.apply(this,arguments);let n=Array.prototype.slice.call(arguments);return t&&n.push(t),VdsInstrumentAgent.observer.pageListener(this,e,n),e===gioGlobal.platformConfig.lisiteners.page.shareApp&&setShareResult(t),t}}else e!==gioGlobal.platformConfig.lisiteners.page.shareApp&&(t[e]=function(){VdsInstrumentAgent.observer.pageListener(this,e,arguments)})}),t},instrumentComponent:function(t){if(t.methods){let e=t.methods;for(let i in e)"function"==typeof e[i]&&(t.methods[i]=this.hookComponent(i,e[i]))}return t},GrowingPage:function(t){return t._growing_page_=!0,VdsInstrumentAgent.originalPage(VdsInstrumentAgent.instrument(t))},GrowingComponent:function(t){return VdsInstrumentAgent.originalComponent(VdsInstrumentAgent.instrumentComponent(t))},GrowingBehavior:function(t){return VdsInstrumentAgent.originalBehavior(VdsInstrumentAgent.instrumentComponent(t))},GrowingApp:function(t){return t._growing_app_=!0,VdsInstrumentAgent.originalApp(VdsInstrumentAgent.instrument(t))},initPlatformInfo(t){VdsInstrumentAgent.appHandlers=t.appHandlers,VdsInstrumentAgent.pageHandlers=t.pageHandlers,VdsInstrumentAgent.actionEventTypes=t.actionEventTypes,VdsInstrumentAgent.originalApp=t.originalApp,VdsInstrumentAgent.originalPage=t.originalPage,VdsInstrumentAgent.originalComponent=t.originalComponent,VdsInstrumentAgent.originalBehavior=t.originalBehavior},initInstrument:function(t){if(VdsInstrumentAgent.initPlatformInfo(gioGlobal.platformConfig),VdsInstrumentAgent.observer=t,VdsInstrumentAgent.pageHandlers.forEach(function(t){VdsInstrumentAgent.defaultPageCallbacks[t]=function(){VdsInstrumentAgent.observer.pageListener(this,t,arguments)}}),VdsInstrumentAgent.appHandlers.forEach(function(t){VdsInstrumentAgent.defaultAppCallbacks[t]=function(){VdsInstrumentAgent.observer.appListener(this,t,arguments)}}),gioGlobal.platformConfig.canHook){const t=gioGlobal.platformConfig.hooks;t.App&&!gioGlobal.growingAppInited&&(App=function(){return VdsInstrumentAgent.GrowingApp(arguments[0])},gioGlobal.growingAppInited=!0),t.Page&&!gioGlobal.growingPageInited&&(Page=function(){return VdsInstrumentAgent.GrowingPage(arguments[0])},gioGlobal.growingPageInited=!0),t.Component&&!gioGlobal.growingComponentInited&&(Component=function(){return VdsInstrumentAgent.GrowingComponent(arguments[0])},gioGlobal.growingComponentInited=!0),t.Behavior&&!gioGlobal.growingBehaviorInited&&(Behavior=function(){return VdsInstrumentAgent.GrowingBehavior(arguments[0])},gioGlobal.growingBehaviorInited=!0)}gioGlobal.GioPage=VdsInstrumentAgent.GrowingPage,gioGlobal.GioApp=VdsInstrumentAgent.GrowingApp,gioGlobal.GioComponent=VdsInstrumentAgent.GrowingComponent,gioGlobal.GioBehavior=VdsInstrumentAgent.GrowingBehavior,gioGlobal.trackApp=function(){const t=arguments[0];return t._growing_app_=!0,VdsInstrumentAgent.instrument(t)},gioGlobal.trackPage=function(){const t=arguments[0];return t._growing_page_=!0,VdsInstrumentAgent.instrument(t)},gioGlobal.trackComponent=function(){return VdsInstrumentAgent.instrument(arguments[0])},gioGlobal.trackBehavior=function(){return VdsInstrumentAgent.instrument(arguments[0])}}};class Page$1{constructor(){this.queries={},this.pvar={}}touch(t){this.path=t.route,this.time=Date.now(),this.query=this.queries[t.route]?this.queries[t.route]:void 0}addQuery(t,e){this.queries[t.route]=e?this._getQuery(e):null}_getQuery(t){return Object.keys(t).filter(t=>"wxShoppingListScene"!==t).map(e=>`${e}=${t[e]}`).join("&")}touchRelatedPvarData(t){const e=`${t.p}?${t.q}`;this.pvar[e]?this.pvar[e].push(t):this.pvar[e]=[t]}}const eventTypeMap={tap:["tap","click"],longtap:["longtap"],input:["input"],blur:["change","blur"],submit:["submit"],focus:["focus"]},fnExpRE=/^function[^\(]*\([^\)]+\).*[^\.]+\.([^\(]+)\(.*/;function getComKey(t){return t&&t.$attrs?t.$attrs.mpcomid:"0"}function isVmKeyMatchedCompkey(t,e,i){return!(!t||!e)&&(e===t||0===e.indexOf(t+i))}function getVM(t,e,i){void 0===e&&(e=[]);var n=e.slice(1);if(!n.length)return t;var o=n.join(i),s="";return n.reduce(function(t,e){for(var n=t.$children.length,r=0;n>r;r++){var a=t.$children[r],g=getComKey(a);if(s&&(g=s+i+g),isVmKeyMatchedCompkey(g,o,i))return s=g,t=a}return t},t)}function getHandle(t,e,i){void 0===i&&(i=[]);var n=[];if(!t||!t.tag)return n;var o=t||{},s=o.data;void 0===s&&(s={});var r=o.children;void 0===r&&(r=[]);var a=o.componentInstance;a?Object.keys(a.$slots).forEach(function(t){var o=a.$slots[t];(Array.isArray(o)?o:[o]).forEach(function(t){n=n.concat(getHandle(t,e,i))})}):r.forEach(function(t){n=n.concat(getHandle(t,e,i))});var g=s.attrs,l=s.on;return g&&l&&g.eventid===e&&i.forEach(function(t){var e=l[t];"function"==typeof e?n.push(e):Array.isArray(e)&&(n=n.concat(e))}),n}const ONCE="~",CUSTOM="^";function isMatchEventType(t,e){return t===e||"regionchange"===e&&("begin"===t||"end"===t)}class VueProxy{constructor(t){this.vueVM=t}getHandle(t){var e=t.type,i=t.target;void 0===i&&(i={});var n=(t.currentTarget||i).dataset;void 0===n&&(n={});var o=n.comkey;void 0===o&&(o="");var s=n.eventid;const r=-1!==o.indexOf("_")?"_":",";var a=getVM(this.vueVM,o.split(r),r);if(a){var g=getHandle(a._vnode,s,eventTypeMap[e]||[e]);if(g.length){var l=g[0];if(l.isProxied)return l.proxiedName;try{var p=(""+l).replace("\n","");if(p.match(fnExpRE)){var h=fnExpRE.exec(p);if(h&&h.length>1)return h[1]}}catch(t){}return l.name}}}handleEvent(t){const e=t.type;let i;const n=(t.currentTarget||t.target).dataset;return(n.eventOpts||n["event-opts"]).forEach(t=>{let n=t[0];const o=t[1];n=(n=n.charAt(0)===CUSTOM?n.slice(1):n).charAt(0)===ONCE?n.slice(1):n,o&&isMatchEventType(e,n)&&o.forEach(t=>{i=t[0]})}),i}}function EventEmitter(){}var proto=EventEmitter.prototype;proto.emitEvent=function(t){};const gioEmitter=new EventEmitter;function validVar(t){return null!==t&&"[object Object]"===Object.prototype.toString.call(t)&&Object.keys(t).length>0}const CLICK_TYPE={tap:"clck",longpress:"lngprss",longtap:"lngprss"};class Observer{constructor(t){this.growingio=t,this.info=t.info,this.currentPage=new Page$1,this.scene=null,this._sessionId=null,this.cs1=null,this.lastPageEvent=null,this.lastVstArgs=void 0,this.lastCloseTime=null,this.lastScene=void 0,this.keepAlive=t.vdsConfig.keepAlive,this.isPauseSession=!1,this.isGettingUid=!1,this.esid=this.info.esid,this.uploadingMessages=[]}get sessionId(){return null===this._sessionId&&(this._sessionId=Utils.guid()),this._sessionId}resetSessionId(){this._sessionId=null}pauseSession(){this.isPauseSession=!0}getVisitorId(){return this.info.uid}getUserId(){return this.cs1}getGioInfo(){return`giou=${this.getVisitorId()}&giocs1=${this.getUserId()}&gios=${this.sessionId}&gioprojectid=${this.growingio.vdsConfig.projectId}&gioappid=${this.growingio.vdsConfig.appId}&gioplatform=${gioGlobal.platformConfig.platform}`}setUserId(t){let e=t+"";e&&100>e.length&&(this.cs1=e,gioEmitter.emitEvent("setCs1",[e]),this.lastPageEvent&&this._sendEvent(this.lastPageEvent))}clearUserId(){this.cs1=null,gioEmitter.emitEvent("clearCs1")}appListener(t,e,i){const n=gioGlobal.platformConfig.lisiteners.app;this.isPauseSession||(this.growingio.vdsConfig.debug&&console.log("App.",e,Date.now()),e==n.appShow?(gioEmitter.emitEvent("appShow"),this._parseScene(i),!this.lastCloseTime||Date.now()-this.lastCloseTime>this.keepAlive||this.lastScene&&this.scene!==this.lastScene?(this.resetSessionId(),this.sendVisitEvent(i,this.growingio.vdsConfig.getLocation.type),this.lastVstArgs=i,this.useLastPageTime=!1,this.lastPageEvent=void 0):this.lastPageEvent&&(this.useLastPageTime=!0)):e==n.appClose?(this.lastScene=this.scene,this.growingio.forceFlush(),this.info.syncStorage(),this.isPauseSession||(this.lastCloseTime=Date.now(),this.sendVisitCloseEvent())):e==n.appError&&this.sendErrorEvent(i))}pageListener(t,e,i){const n=gioGlobal.platformConfig.lisiteners.page;if(this.growingio.vdsConfig.wepy&&(t.route=t.$is),t.route||(t.route=this.info.getPagePath(t)),this.growingio.vdsConfig.debug&&console.log("Page.",t.route,"#",e,Date.now()),e===n.pageShow){const e=getDataByPath(t,"$page.query");Utils.isEmpty(e)||"quickApp"!==gioGlobal.gio__platform||this.currentPage.addQuery(t,e),this.isPauseSession?this.isPauseSession=!1:(this.currentPage.touch(t),this.useLastPageTime&&(this.currentPage.time=this.lastPageEvent.tm,this.useLastPageTime=!1),this.sendPage(t))}else if(e===n.pageLoad){const e=i[0];Utils.isEmpty(e)||"quickApp"===gioGlobal.gio__platform||this.currentPage.addQuery(t,e)}else if(e===n.pageHide)this.growingio._observer&&this.growingio._observer.disconnect();else if(e===n.pageClose)this.currentPage.pvar[`${this.currentPage.path}?${this.currentPage.query}`]=void 0;else if(e===n.shareApp){let e=null,n=null;2>i.length?1===i.length&&(i[0].from?e=i[0]:i[0].title&&(n=i[0])):(e=i[0],n=i[1]),this.pauseSession(),this.sendPageShare(t,e,n)}else if("onTabItemTap"===e){this.sendTabClick(i[0])}}actionListener(t,e){if(getDataByPath(t,"currentTarget.dataset.growingIgnore")||getDataByPath(t,"target.dataset.growingIgnore"))return;const i=gioGlobal.platformConfig.lisiteners.actions;if("_cmlEventProxy"!==e){if("handleProxy"===e&&this.growingio.vueRootVMs&&this.growingio.vueRootVMs[this.currentPage.path]){let i=new VueProxy(this.growingio.vueRootVMs[this.currentPage.path]).getHandle(t);i&&(e=i)}if("__e"===e&&this.growingio.vueRootVMs&&this.growingio.vueRootVMs[this.currentPage.path]){let i=new VueProxy(this.growingio.vueRootVMs[this.currentPage.path]).handleEvent(t);i&&(e=i)}if("_proxy"===e&&this.growingio.wepyRootVMs){const i=t.currentTarget.dataset.wpyEvt,n=t.type;getDataByPath(this,`growingio.wepyRootVMs.${i}.${n}`)&&(e=this.growingio.wepyRootVMs[i][n])}getDataByPath(this,`growingio.taroRootVMs.${e}`)&&(e=this.growingio.taroRootVMs[e]),this.growingio.vdsConfig.debug&&console.log("Click on ",e,Date.now()),-1!==i.click.indexOf(t.type)?(this.sendClick(t,e),"getuserinfo"===t.type&&getDataByPath(t,"detail.userInfo")&&this.setVisitor(t.detail.userInfo)):-1!==i.change.indexOf(t.type)?this.sendChange(t,e):-1!==i.submit.indexOf(t.type)&&this.sendSubmit(t,e)}}sendVideoCstm(t){this.track(`video-${t.type}`,t.var)}track(t,e){if("string"!=typeof t||null===t||void 0===t||0===t.length)return;let i={t:"cstm",ptm:this.currentPage.time,p:this.currentPage.path,q:this.currentPage.query,n:t};validVar(e)&&(i.var=e),this._sendEvent(i)}identify(t,e){if(void 0===t||0===t.length)return;this.growingio.login(t),this._sendEvent({t:"vstr",var:{openid:t,unionid:e}})}setVisitor(t){if(validVar(t)){this._sendEvent({t:"vstr",var:t})}}setUser(t){if(this.cs1&&validVar(t)){this._sendEvent({t:"ppl",var:t})}}setPage(t){if(validVar(t)){let e={t:"pvar",ptm:this.currentPage.time,p:this.currentPage.path,q:this.currentPage.query,var:t};this.currentPage.touchRelatedPvarData(e),this._sendEvent(e)}}setEvar(t){if(validVar(t)){this._sendEvent({t:"evar",var:t})}}getLocation(t){this.growingio.vdsConfig.getLocation.autoGet=!0,this.sendVisitEvent(this.lastVstArgs,t)}sendVisitEvent(t,e){this.info.getSystemInfo().then(i=>{const n=i||{};let o={t:"vst",tm:Date.now(),av:this.info.sdkVer,db:n.brand,dm:n.model&&n.model.replace(/<.*>/,""),sh:Utils.getScreenHeight(n),sw:Utils.getScreenWidth(n),os:Utils.getOS(n.platform),osv:Utils.getOSV(n.version),l:n.language};if(this.growingio.vdsConfig.appVer&&(o.cv=this.growingio.vdsConfig.appVer+""),t.length>0){let i=t[0];o.p=i.path||this.info.getPagePath(),Utils.isEmpty(i.query)||(o.q=this.currentPage._getQuery(i.query)),o.ch=`scn:${this.info.scnPrefix}${this.scene}`,"quickapp"===this.info.platform?o.rf=this.info.appSource.packageName:i.referrerInfo&&i.referrerInfo.appId&&getDataByPath(i,"referrerInfo.appId")&&(o.rf=i.referrerInfo.appId),this.info.getNetworkType().then(t=>{t&&(o.nt=t.networkType,this._sendEvent(o),this.growingio.vdsConfig.getLocation.autoGet&&(e&&-1!==["wgs84","gcj02",0,1,2].indexOf(e)||(e="my"===gioGlobal.gio__platform?0:"wgs84"),this.info.getLocation(e).then(t=>{t&&(o.lat=t.latitude,o.lng=t.longitude,this._sendEvent(o))})))})}})}sendVisitCloseEvent(){this._sendEvent({t:"cls",p:this.currentPage.path,q:this.currentPage.query})}sendErrorEvent(t){if(t&&t.length>0){let e,i=t[0].split("\n");if(i&&i.length>1){let t=i[1].split(";");if(t&&t.length>1){let n=t[1].match(/at ([^ ]+) page (.*) function/);e={key:i[0],error:t[0]},n&&n.length>2&&(e.page=n[1],e.function=n[2])}}else e={error:i&&i[0]};this._sendEvent({t:"cstm",ptm:this.currentPage.time,p:this.currentPage.path,q:this.currentPage.query,n:"onError",var:e})}}sendPage(t){let e={t:"page",tm:this.currentPage.time,p:this.currentPage.path,q:this.currentPage.query};e.rp=this.lastPageEvent?this.lastPageEvent.p:this.scene?`scn:${this.info.scnPrefix}${this.scene}`:null;let i=this.info.getPageTitle(t);i&&i.length>0&&(e.tl=i),this._sendEvent(e),this.lastPageEvent=e;const n=this.currentPage.pvar[`${this.currentPage.path}?${this.currentPage.query}`];n&&n.length>0&&n.map(t=>{t.ptm=this.currentPage.time,this._sendEvent(t)})}sendPageShare(t,e,i){this._sendEvent({t:"cstm",ptm:this.currentPage.time,p:this.currentPage.path,q:this.currentPage.query,n:"onShareAppMessage",var:{from:e?e.from:void 0,target:e&&e.target?e.target.id:void 0,title:i?i.title:void 0,path:i?decodeURI(i.path):void 0}})}sendClick(t,e){let i={t:CLICK_TYPE[t.type]||"clck",ptm:this.currentPage.time,p:this.currentPage.path,q:this.currentPage.query},n=t.currentTarget||t.target,o=n.id;(!o||"swan"===gioGlobal.gio__platform&&/^_[0-9a-f]+/.test(o))&&(o="");let s={x:`${o}#${e}`};n.dataset.title&&(s.v=n.dataset.title),n.dataset.src&&(s.h=n.dataset.src),void 0!==n.dataset.index&&(s.idx=/^[\d]+$/.test(n.dataset.index)?parseInt(n.dataset.index):-1),i.e=[s],this._sendEvent(i)}sendSubmit(t,e){let i={t:"sbmt",ptm:this.currentPage.time,p:this.currentPage.path,q:this.currentPage.query},n=(t.currentTarget||t.target).id;(!n||"swan"===gioGlobal.gio__platform&&/^_[0-9a-f]+/.test(n))&&(n=""),i.e=[{x:`${n}#${e}`}],this._sendEvent(i)}sendChange(t,e){let i={t:"chng",ptm:this.currentPage.time,p:this.currentPage.path,q:this.currentPage.query},n=t.currentTarget||t.target,o=n.id;(!o||"swan"===gioGlobal.gio__platform&&/^_[0-9a-f]+/.test(o))&&(o="");let s={x:`${o}#${e}`},r=getDataByPath(t,"detail.value")||getDataByPath(t,"target.attr.value");(n.dataset.growingTrack||n.dataset.growingtrack)&&("boolean"==typeof r||r&&0!==r.length)&&("[object Array]"===Object.prototype.toString.call(r)?(r=r.join(","))&&(s.v=r):s.v=r),"change"===t.type&&"autoplay"===getDataByPath(t,"detail.source")||(i.e=[s],this._sendEvent(i))}sendTabClick(t){let e={t:"clck",ptm:this.currentPage.time,p:this.currentPage.path,q:this.currentPage.query,e:[{x:"#onTabItemTap",v:t.text,idx:t.index,h:"string"==typeof t.pagePath?t.pagePath:JSON.stringify(t.pagePath)}]};this._sendEvent(e)}_sendEvent(t){if(this.info.uid&&this.esid){const e=this._buildEvent(t,this.info);this.growingio.upload(e)}else this.isGettingUid?this.uploadingMessages.push(t):(this.isGettingUid=!0,this.info.getStorage(this.info.uidKey).then(e=>{e||(e=Utils.guid()),this.info.uid=e,this.info.getStorage(this.info.esidKey).then(e=>{e||(e=1),this.esid=e,this.isGettingUid=!1;const i=this._buildEvent(t,this.info);this.growingio.upload(i);for(let t of this.uploadingMessages)this._buildEvent(t,this.info),this.growingio.upload(t)})}))}_buildEvent(t,e){if(t.u=e.uid,t.s=this.sessionId,t.tm=t.tm||Date.now(),t.d=this.growingio.vdsConfig.appId,t.b=e.platform,null!==this.cs1&&(t.cs1=this.cs1),t.var){let e=t.var;Object.keys(e).forEach(i=>{"string"!=typeof e[i]&&(t.var[i]=JSON.stringify(e[i]))})}return t.esid=this.esid++,t}_parseScene(t){if("quickapp"===this.info.platform){const t=this.info.getAppSource(),e=t.extra||{},i=t.type||"";this.scene=i,this.setVisitor({extra:JSON.stringify(e)})}else if(t.length>0){let e=t[0];this.scene=e.query&&e.query.wxShoppingListScene?e.query.wxShoppingListScene:e.scene?e.scene:"NA"}}}class Info{constructor(t){this.growing=t,this._uid=void 0,this._esid=void 0,this._systemInfo=null,this.uidKey="_growing_uid_",this.esidKey="_growing_esid_",this.platform=gioGlobal.platformConfig.platform,this.sdkVer=gioGlobal.platformConfig.sdkVer,this.scnPrefix=gioGlobal.platformConfig.scnPrefix,"quickapp"!==gioGlobal.platformConfig.platform&&this.initUserInfo()}set esid(t){this._esid=t,this.setStorage(this.esidKey,this._esid)}get esid(){return this._esid}set uid(t){this._uid=t,this.setStorage(this.uidKey,this._uid)}get uid(){return this._uid}get systemInfo(){return this._systemInfo}initUserInfo(){this.uid=this.getStorageSync(this.uidKey),this.esid=+this.getStorageSync(this.esidKey)+1}syncStorage(){this.getStorage(this.uidKey).then(t=>{t||this.setStorage(this.uidKey,this._uid)})}getAppId(){throw Error("this a interface function")}getAppSource(){throw Error("this a interface function")}getPageTitle(t){throw Error("this a interface function")}getPagePath(t){throw Error("this a interface function")}getStorage(t){throw Error("this a interface function")}getStorageSync(t){throw Error("this a interface function")}setStorage(t,e){throw Error("this a interface function")}getSystemInfo(){throw Error("this a interface function")}getNetworkType(){throw Error("this a interface function")}getLocation(t){throw Error("this a interface function")}request({url:t,header:e,method:i,data:n,success:o,fail:s}){throw Error("this a interface function")}collectImp(t,e=null){throw Error("this a interface function")}initShareAppMessage(t){throw Error("this a interface function")}}class Alipay extends Info{constructor(t){super(t),this.growingio=t}getAppId(){if(my.getAppIdSync){const t=my.getAppIdSync();return t&&t.appId}return""}getPageTitle(t){let e="";try{t.data.title&&t.data.title.length>0&&(e=Array.isArray(t.data.title)?t.data.title.join(" "):t.data.title)}catch(t){return""}return e}getStorage(t){return new Promise(e=>{my.getStorage({key:t,success:t=>e(t.data),fail:()=>e(null)})})}getStorageSync(t){const e=my.getStorageSync({key:t});return e&&e.data}setStorage(t,e){my.setStorage({key:t,data:e})}getSystemInfo(){return new Promise(t=>{my.getSystemInfo({success:e=>{this._systemInfo=e,t(e)},fail:()=>t(null)})})}getNetworkType(){return new Promise(t=>{my.getNetworkType({success:e=>t(e),fail:()=>t(null)})})}getLocation(t){return new Promise(e=>{my.getLocation({type:t,success:t=>e(t),fail:()=>e(null)})})}request({url:t,header:e,method:i,data:n,success:o,fail:s}){try{my.request?my.request({url:t,headers:e,method:i,data:n,success:o,fail:s}):my.httpRequest({url:t,header:e,method:i,data:n,success:o,fail:s})}catch(t){19===t.error&&204===t.status||console.error(t)}}collectImp(){console.log("支付宝小程序不支持 imp 哦")}}class Uploader{constructor(t){this.growingio=t,this.messageQueue=[],this.uploadingQueue=[],this.uploadTimer=null,this.projectId=this.growingio.vdsConfig.projectId,this.appId=this.growingio.vdsConfig.appId,this.host=this.growingio.vdsConfig.host,this.url=`${this.host}/projects/${this.projectId}/apps/${this.appId}/collect`}upload(t){this.messageQueue.push(t);const e=this.messageQueue.length;e>100&&(this.messageQueue=this.messageQueue.slice(e-100)),this.uploadTimer||(this.uploadTimer=setTimeout(()=>{this._flush(),this.uploadTimer=null},1e3))}forceFlush(){this.uploadTimer&&(clearTimeout(this.uploadTimer),this.uploadTimer=null),this._flush()}_flush(){this.uploadingQueue=this.messageQueue.slice(),this.messageQueue=[],this.uploadingQueue.length>0&&this.growingio.info.request({url:`${this.url}?stm=${Date.now()}`,header:{"content-type":"application/json"},method:"POST",data:this.uploadingQueue,success:()=>{this.messageQueue.length>0&&this._flush()},fail:t=>{204!==t.status&&(this.messageQueue=this.uploadingQueue.concat(this.messageQueue))}})}}const sdkVersion="3.2.2",platformConfig={wx:{name:"Weixin",path:"./weixin"},qq:{name:"QQ",path:"./qq"},my:{name:"Alipay",path:"./alipay"},swan:{name:"Baidu",path:"./baidu"},tt:{name:"Bytedance",path:"./bytedance"},quickApp:{name:"Quickapp",path:"./quickApp"},frame:{name:"Frame",path:"./multipleFrame"}},Config=Object.assign({},platformConfig.my,{platform:"alip",scnPrefix:"alip_",appHandlers:["onShow","onHide","onError"],pageHandlers:["onLoad","onShow","onShareAppMessage","onTabItemTap","onHide","onUnload"],actionEventTypes:["onclick","tap","longpress","blur","change","submit","confirm","getuserinfo","getphonenumber","contact"],originalApp:App,originalPage:Page,originalComponent:Component,canHook:!1,hooks:{App:!0,Page:!0,Component:!0,Behavior:!1},lisiteners:{app:{appShow:"onShow",appClose:"onHide",appError:"onError"},page:{pageLoad:"onLoad",pageShow:"onShow",pageHide:"onHide",pageClose:"onUnload",tabTap:"onTabItemTap",shareApp:"onShareAppMessage"},actions:{click:["tap","longpress","getuserinfo","getphonenumber","contact","onclick"],change:["blur","change","confirm"],submit:["submit"]}}});var platformConfig$1=Object.assign({},Config,{sdkVer:"3.2.2"});const duration5min=3e5;class GrowingIO{constructor(){this.uploadingMessages=[],this.start=!1}init(t,e,i){this.start||(e&&"string"!=typeof e&&(i=e,e=""),e||i||(e="",i={}),"alip"===platformConfig$1.platform&&(i.vue||i.taro||i.cml||i.wepy)&&(platformConfig$1.canHook=!0),i.usePlugin&&(platformConfig$1.canHook=!1),this.vdsConfig={projectId:t,appId:e,appVer:i.version||"",debug:i.debug||!1,forceLogin:i.forceLogin||!1,followShare:void 0===i.followShare||i.followShare,usePlugin:i.usePlugin||!1,getLocation:{autoGet:("object"==typeof i.getLocation?i.getLocation.autoGet:i.getLocation)||!1,type:"object"==typeof i.getLocation&&i.getLocation.type||"wgs84"},dataCollect:!("boolean"==typeof i.stopTrack&&i.stopTrack||"boolean"==typeof i.dataCollect&&!i.dataCollect),keepAlive:+i.keepAlive||duration5min,vue:i.vue||!1,taro:i.taro||!1,cml:i.cml||!1,wepy:i.wepy||!1,host:i.host&&i.host.indexOf("http")>=0?`https://${i.host.slice(i.host.indexOf("://")+3)}`:"https://wxapi.growingio.com",sdkVer:platformConfig$1.sdkVer},gioGlobal.vdsConfig=this.vdsConfig,gioGlobal.platformConfig=platformConfig$1,this.info=new Alipay(this),e||(this.vdsConfig.appId=this.info.getAppId()||t),this.observer=new Observer(this),this.uploader=new Uploader(this),this.start=!0,i.vue&&(this.vueRootVMs={},this._proxyVue(i.vue)),i.taro&&(this.taroRootVMs={},this._proxyTaro(i.taro)),i.cml&&(gioGlobal.platformConfig.hooks.Component=!1,this._proxyCml(i.cml)),i.wepy&&(this.wepyRootVMs={},this._proxyWepy(i.wepy)),"quickapp"===gioGlobal.platformConfig.platform&&this.info.initShareAppMessage(this),this._start())}setConfig(t){this.init(t.projectId,t.appId,t)}setVue(t){this.vueRootVMs||(this.vueRootVMs={}),this.vdsConfig.vue=!0,this._proxyVue(t)}_proxyVue(t){if(void 0!==t.mixin){let e=this;t.mixin({created:function(){if(!this.$options.methods)return;const t=Object.keys(this.$options.methods);for(let e of Object.keys(this))0>t.indexOf(e)||"function"!=typeof this[e]||(Object.defineProperty(this[e],"proxiedName",{value:e}),Object.defineProperty(this[e],"isProxied",{value:!0}))},beforeMount:function(){let t=this.$root;t.$mp&&"page"===t.$mp.mpType?t.$mp.page&&(e.vueRootVMs[t.$mp.page.route]=t):"page"===t.mpType&&"page"===this.mpType&&t.$mp.page&&(e.vueRootVMs[t.$mp.page.route||t.$mp.page.is]=t,-1!==["wx","qq","tt"].indexOf(gioGlobal.gio__platform)&&VdsInstrumentAgent.instrumentPageComponent(t.$mp.page))}})}}_proxyTaro(t){let e=this;const i=t.createComponent,n=this.vdsConfig.usePlugin;if(t.createComponent=function(t,o){let s=t;for(;s&&s.prototype;){const i=Object.keys(Object.getOwnPropertyDescriptors(s.prototype)||{});for(let n=0;i.length>n;n++)if(i[n].startsWith("func__")){const o=s.name,r=i[n].slice(6);e.taroRootVMs[i[n]]=o+"_"+(""+t.prototype[i[n]]).match(/this\.__triggerPropsFn\("(.+)",/)[1]+"_"+r}s=Object.getPrototypeOf(s)}const r=i(t,o),a=-1!==["MinP","qq"].indexOf(platformConfig$1.platform),g=a?r&&r.methods:r;return n?(VdsInstrumentAgent.instrument(g),o&&VdsInstrumentAgent.instrumentPageComponent(g)):o&&a&&VdsInstrumentAgent.instrumentPageComponent(g),r},n){const e=t.createApp;t.createApp=function(t){let i=e(t);return i._growing_app_=!0,VdsInstrumentAgent.instrument(i),i}}}_proxyCml(t){const e=t.createApp,i=t.createComponent;t.createApp=function(t){return t._growing_app_=!0,e(VdsInstrumentAgent.instrument(t))},t.createComponent=function(t){return i(t.data&&t.data.isComponent?Object.assign({},t,{methods:VdsInstrumentAgent.instrument(t.methods)}):t)}}_proxyWepy(t){const e=this,i=t.page,n=function(t){const i=Object.keys(t);for(let n=0;i.length>n;n++){const o=Object.keys(t[i[n]]);for(let s=0;o.length>s;s++)if("function"==typeof t[i[n]][o[s]]){const r=(""+t[i[n]][o[s]]).match(/_vm\.(.+)\(.*\)/);r&&r[1]&&(e.wepyRootVMs[i[n]]||(e.wepyRootVMs[i[n]]={}),e.wepyRootVMs[i[n]][o[s]]=r[1]),e.vdsConfig.usePlugin&&(t[i[n]][o[s]]=VdsInstrumentAgent.hook("_proxy",t[i[n]][o[s]]))}}};t.page=function(t,e){return e.handlers&&n(e.handlers),VdsInstrumentAgent.instrumentPageComponent(t),i(t,e)};const o=t.component;if(t.component=function(t,e){return e.handlers&&n(e.handlers),o(t,e)},this.vdsConfig.usePlugin){const e=t.app;t.app=function(t,i){return t._growing_app_=!0,e(VdsInstrumentAgent.instrument(t),i)}}}_start(){VdsInstrumentAgent.initInstrument(this.observer);try{gioGlobal&&platformConfig$1.canHook&&(platformConfig$1.hooks.App&&(gioGlobal.App=App),platformConfig$1.hooks.Page&&(gioGlobal.Page=Page),platformConfig$1.hooks.Component&&(gioGlobal.Component=Component),platformConfig$1.hooks.Behavior&&(gioGlobal.Behavior=Behavior))}catch(t){}}setDataCollect(t){this.vdsConfig.dataCollect=t}login(t){if(this.vdsConfig.forceLogin){this.info.uid=t,this.vdsConfig.forceLogin=!1;for(let e of this.uploadingMessages)e.u=t,this.upload(e)}}upload(t){this.vdsConfig.dataCollect&&(this.vdsConfig.forceLogin?this.uploadingMessages.push(t):(this.vdsConfig.debug&&console.info("generate new event",JSON.stringify(t,0,2)),gioEmitter.emitEvent("upload",[t]),this.uploader.upload(t)))}forceFlush(){this.info.esid=this.observer.esid,this.uploader.forceFlush()}proxy(t,e){try{if("setVue"===t)this.setVue(e[0]);else if("setDataCollect"===t)this.setDataCollect(e[0]);else if("setStopTrack"===t)this.setDataCollect(!e[0]);else if("collectImp"===t)this.collectImp(e[0],e[1]);else if(this.observer&&this.observer[t])return this.observer[t].apply(this.observer,e)}catch(t){console.error(t)}}collectImp(t,e=null){this.info.collectImp(t,e)}}class UserStorage{constructor(){this.namespace="push-user-status",this.duration=432e7}_get(t){return wx.getStorageSync(`${this.namespace}#${t}`)}set(t,e){const i=this._get(t),n={startAt:Date.now(),value:e};if(i){const e=JSON.parse(i);wx.setStorageSync(`${this.namespace}#${t}`,JSON.stringify(n.value===e.value?e:n))}else wx.setStorageSync(`${this.namespace}#${t}`,JSON.stringify(n))}get(t){const e=this._get(t);if(!e)return;const i=JSON.parse(e);return Date.now()>i.startAt+this.duration?void 0:i.value}}try{const t="my";initGlobal(t),"frame"!==t&&(gioGlobal.gio__platform=t)}catch(t){}const growingio=new GrowingIO;let gio=function(){let t=arguments[0];if(!t)return;let e=2>arguments.length?[]:[].slice.call(arguments,1);if("init"===t){if(1>e.length)return void console.log('初始化 GrowingIO SDK 失败。请使用 gio("init", "你的GrowingIO项目ID", "你的应用APP_ID", options);');growingio.init(e[0],e[1],e[2])}else{if("setConfig"!==t)return growingio.proxy(t,e);if(!e[0])return void console.log("初始化 GrowingIO SDK 失败。请检查你的config文件是否引入正确");if(!e[0].projectId)return void console.log("初始化 GrowingIO SDK 失败。请检查你的 GrowingIO项目ID, 你的应用APP_ID 是否填写正确");growingio.setConfig(e[0])}};console.log("init growingio...");const GioPage=VdsInstrumentAgent.GrowingPage,GioApp=VdsInstrumentAgent.GrowingApp,GioComponent=VdsInstrumentAgent.GrowingComponent,GioBehavior=VdsInstrumentAgent.GrowingBehavior,gioEmitter$1=gioEmitter,userStorage=new UserStorage;gioGlobal.__growing__={gioEmitter:gioEmitter$1,gio:gio,growingio:growingio,userStorage:userStorage},gioGlobal.gio=gio,exports.GioApp=GioApp,exports.GioBehavior=GioBehavior,exports.GioComponent=GioComponent,exports.GioPage=GioPage,exports.default=gio,exports.gioEmitter=gioEmitter$1,exports.growingio=growingio;