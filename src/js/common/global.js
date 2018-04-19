/* global document:true */
/**
 * 扩展Array对象的方法(判断数组中是否包含指定值)
 * @param  {[type]} item 指定值
 * @return {[type]}      [description]
 */

try {
    if (!Array.prototype.contains) {
        // 利用Array的原型prototype点出一个我想要封装的方法名contains 
        Array.prototype.contains = function(element) {
            for (var i = 0; i < this.length; i++) {
                //如果数组中某个元素和你想要测试的元素对象element相等，则证明数组中包含这个元素，返回true
                if (this[i] === element) {
                    return true;
                }
            }
        };
    }
} catch (e) {
    console.error(e);
}
// forEach方法的兼容解决方法
try {
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function(callback, thisArg) {
            var T, k;
            if (this === null) {
                throw new TypeError(' this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0; // jshint ignore:line
            if (typeof callback !== "function") {
                throw new TypeError(callback + ' is not a function');
            }
            if (arguments.length > 1) {
                T = thisArg;
            }
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }
} catch (e) {
    console.error(e);
}

/**
 * 提供命名管理，管理全局变量。
 * 所有全局变量必须命名在GLOBAL里面的命名空间下，将变量冲突、覆盖问题降到最小。
 * @type {{}}
 */
var GLOBAL = {};
/**
 * 给创建命名空间提供一个统一接口
 * 调用方法：GLOBAL.namespace('Ie');这样便创建了一个ie的命名空间。
 * 创建完命名空间后，如果需要定义一个全局变量，方法如下：GLOBAL.Ie.isIe6;
 * 使用该变量的方法也是：GLOBAL.Ie.isIe6
 * @param str
 */
GLOBAL.namespace = function(str) {
    var arr = str.split("."),
        o = GLOBAL;
    for (var i = (arr[0] === "GLOBAL") ? 1 : 0; i < arr.length; i++) {
        o[arr[i]] = o[arr[i]] || {};
        o = o[arr[i]];
    }
};

GLOBAL.namespace('Util');
GLOBAL.namespace('Cookie');
GLOBAL.namespace('Array');
GLOBAL.namespace('Os');
GLOBAL.namespace('Browser');
GLOBAL.namespace('Online');

/* 公用的工具方法(头条H5) */
GLOBAL.Util = {
    /**
     * Object 转 JSON String
     * @param {Object} c
     * @return {String}
     */
    toJSON: function(c) {
        var JSON = window.JSON;
        if (typeof(JSON) == "object" && JSON.stringify) {
            return JSON.stringify(c)
        }
        var m = typeof(c);
        if (c === null) {
            return "null";
        }
        if (m == "undefined") {
            return undefined;
        }
        if (m == "number" || m == "boolean") {
            return c + "";
        }
        if (m == "string") {
            return $.quoteString(c);
        }
        if (m == "object") {
            if (typeof c.toJSON == "function") {
                return $.toJSON(c.toJSON());
            }
            if (c.constructor === Date) {
                var l = c.getUTCMonth() + 1;
                if (l < 10) {
                    l = "0" + l;
                }
                var p = c.getUTCDate();
                if (p < 10) {
                    p = "0" + p;
                }
                var n = c.getUTCFullYear();
                var q = c.getUTCHours();
                if (q < 10) {
                    q = "0" + q;
                }
                var f = c.getUTCMinutes();
                if (f < 10) {
                    f = "0" + f;
                }
                var r = c.getUTCSeconds();
                if (r < 10) {
                    r = "0" + r;
                }
                var h = c.getUTCMilliseconds();
                if (h < 100) {
                    h = "0" + h;
                }
                if (h < 10) {
                    h = "0" + h;
                }
                return '"' + n + "-" + l + "-" + p + "T" + q + ":" + f + ":" + r + "." + h + 'Z"';
            }
            if (c.constructor === Array) {
                var j = [];
                for (var g = 0; g < c.length; g++) {
                    j.push($.toJSON(c[g]) || "null");
                }
                return "[" + j.join(",") + "]";
            }
            var b = [];
            for (var e in c) {
                var a;
                var m = typeof e;
                if (m == "number") {
                    a = '"' + e + '"';
                } else {
                    if (m == "string") {
                        a = $.quoteString(e);
                    } else {
                        continue;
                    }
                }
                if (typeof c[e] == "function") {
                    continue;
                }
                var d = $.toJSON(c[e]);
                b.push(a + ":" + d);
            }
            return "{" + b.join(", ") + "}";
        }
    },

    /**
     * 获取随机数
     * @param  {number} min 随机数下限
     * @param  {number} max 随机数上限
     * @return {number}     大于等于min且小于max的数
     */
    getRandom: function(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    },

    /**
     * 动态加载js文件
     * @param  {string}   url      js文件的url地址
     * @param  {Function} callback 加载完成后的回调函数
     */
    getScript: function(url, callback, element) {
        var head = document.getElementsByTagName('head')[0],
            js = document.createElement('script');

        js.setAttribute('type', 'text/javascript');
        js.setAttribute('src', url);
        if (element) {
            element.appendChild(js);
        } else {
            head.appendChild(js);
        }
        //执行回调
        var callbackFn = function() {
            if (typeof callback === 'function') {
                callback();
            }
        };

        if (document.all) { // IE
            js.onreadystatechange = function() {
                if (js.readyState === 'loaded' || js.readyState === 'complete') {
                    callbackFn();
                }
            };
        } else {
            js.onload = function() {
                callbackFn();
            };
        }
    },

    /**
     * 动态创建广告代码
     * @param  {string}   scriptCode     脚本代码
     * @param  {Function} callback   回调
     * @param  {DOM}   element  广告js代码父级标签
     * @return {undefined}    
     */
    createScript: function(scriptCode, callback, element) {
        if (scriptCode) {
            var head = document.getElementsByTagName('head')[0],
                js = document.createElement('script');
            js.setAttribute('type', 'text/javascript');
            js.innerHTML = scriptCode;
            if (element) {
                element.appendChild(js);
            } else {
                head.appendChild(js);
            }
            //执行回调
            callback();
        }
    },

    /**
     * 动态引入css 文件
     * @param  {[type]}   url      css路径
     * @return {[type]}            [description]
     */
    createCss: function(url, id) {
        var head = document.getElementsByTagName('head')[0],
            css = document.createElement('link');

        css.setAttribute('type', 'text/css');
        css.setAttribute('rel', 'stylesheet');
        css.setAttribute('href', url);
        id && css.setAttribute('id', id);
        head.appendChild(css);
    },

    /**
     * 过滤html标签
     * @param  {String} str 源字符串
     * @return {String}     过滤之后的字符串
     */
    filterHtmlTags: function(str) {
        if (!str || typeof str !== 'string') {
            return;
        }
        return str.replace(/<\/?[^>]*>/g, '');
    },

    /**
     * 获取url中参数的值
     * @param  {[type]} name 参数名
     * @return {[type]}      参数值
     */
    getQueryString: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    },

    /**
     * 打乱数组
     * @param  {[type]} arr 目标数组
     * @return {[type]}     [description]
     */
    dislocateArr: function(arr) {
        return arr.sort(function() {
            return 0.5 - Math.random();
        });
    },

    /**
     * 对数量进行处理，过万的数据显示“xxx万”（xxx：向上取整, 如：10.2万以及10.9万 都会转化成 11万）
     * @param  {String|Number} num 数量
     * @return {String}    处理后的数据
     */
    getSpecialCountStr: function(num) {
        if (typeof num !== 'string' && typeof num !== 'number') {
            return num;
        }
        num = parseInt(num, 10);
        if (num > 9999) {
            return Math.ceil(num / 10000) + '万';
        }
        return '' + num;
    },


    /**
     * 计算指定时间与当前时间的时间差 并转换成相应格式字符串
     * 如：xx分钟前，xx小时前，昨天 xx:xx，前天 xx:xx，xx-xx xx:xx
     * 超过一年的显示年份
     * @param  {[type]} d 时间戳
     */
    formatTimestamp: function(d) {
        var t = 0;
        if (typeof(d) === 'string') {
            if (isNaN(d)) {
                t = Date.parse(d);
            } else {
                t = parseInt(d);
            }
        } else {
            t = d;
        }
        // var t = typeof(d) === 'String' ? parseInt(d) : d;
        if (!t) return;

        function add0(n) {
            return n < 10 ? '0' + n : n
        }
        var date = new Date(t),
            year = date.getFullYear(),
            month = (date.getMonth() + 1),
            day = date.getDate(),
            h = date.getHours(),
            m = date.getMinutes(),
            s = date.getSeconds();

        var c = new Date().getTime();
        var diff = Number(c - t), // 相差ms
            dy = 365 * 24 * 60 * 60 * 1000, // 1年
            dd = 24 * 60 * 60 * 1000, // 1天
            dh = 60 * 60 * 1000, // 1小时
            dm = 60 * 1000; // 1分钟
        if (diff < dy) {
            var days = (diff) / dd - 1; // 相差天数
            if (days > 2) {
                return add0(month) + '-' + add0(day) + ' ' + add0(h) + ':' + add0(m);
            } else if (days > 1) {
                return '前天 ' + add0(h) + ':' + add0(m);
            } else if (days > 0) {
                return '昨天 ' + add0(h) + ':' + add0(m);
            } else {
                if (diff >= dh) {
                    return Math.floor(diff / dh) + '小时前';
                } else if (diff >= dm) {
                    return Math.floor(diff / dm) + '分钟前';
                } else {
                    // return Math.floor(diff / 1000) + '秒前';
                    return '最新';
                }
            }
        } else {
            return year + '-' + add0(month) + '-' + add0(day) + ' ' + add0(h) + ':' + add0(m);
        }
    },

    /**
     * 计算指定时间与当前时间的时间差 并转换成相应格式字符串
     * 如：xx分钟前，xx小时前，昨天 xx:xx，前天 xx:xx，xx-xx xx:xx
     * @param  {[type]} str 时间字符串（格式：2016-02-26 09:12）
     * @return {[type]}     [description]
     */
    getSpecialTimeStr: function(str) {
        var targetTime = typeof(str) === 'String' ? this.strToTime(str) : str;
        if (!targetTime) {
            return false;
        }
        var currentTime = new Date().getTime();
        var tdoa = Number(currentTime - targetTime),
            dayTime = 24 * 60 * 60 * 1000, // 1天
            hourTime = 60 * 60 * 1000, // 1小时
            minuteTime = 60 * 1000; // 1分钟

        if (tdoa >= dayTime) { // 天
            var h = tdoa / dayTime;
            if (h > 2) {
                return this.timeToString(targetTime);
            } else if (h > 1) {
                return '前天';
            } else {
                return '昨天';
            }
        } else if (tdoa >= hourTime) { // 小时
            return Math.floor(tdoa / hourTime) + '小时前';
        } else if (tdoa >= minuteTime) {
            return Math.floor(tdoa / minuteTime) + '分钟前';
        } else {
            return '最新';
            // return Math.floor(tdoa / 1000) + '秒前';
        }
    },
    /**
     * 字符串转换成时间（毫秒）
     * @param  {[type]} str 时间字符串（格式：2016-02-26 09:12）
     * 注意：iphone不支持（格式：2016-02-26 09:12）需要转换成：（格式：2016/02/26 09:12）
     * @return {[type]}     [description]
     */
    strToTime: function(str) {
        try {
            return Date.parse(str.replace(/-/g, "/"));
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    /**
     * 字符串转中文时间
     * @param  {[type]} str 时间字符串（格式：'Jan 21, 2014 11:24:23 AM'）
     * @return {[type]}     中文时间（格式：2014年01月21日 11:24:23）
     */
    strToCTime: function(str) {
        var d = 0;
        if (isNaN(str)) {
            d = new Date(str)
        } else {
            d = new Date(Number(str))
        }
        var year = d.getFullYear().toString(),
            month = (d.getMonth() + 1).toString(),
            date = d.getDate().toString(),
            h = d.getHours().toString(),
            m = d.getMinutes().toString(),
            s = d.getSeconds().toString();

        function add0(n) {
            return n < 10 ? '0' + n : n
        }
        if ((new Date().getTime()) - d.getTime() < 24 * 60 * 60 * 1000) {
            return this.getSpecialTimeStr(str)
        } else {
            return year + '年' + add0(month) + '月' + add0(date) + '日 ' + add0(h) + ':' + add0(m) + ':' + add0(s);
        }
    },

    /**
     * 时间戳转换为字符串
     * @param  {[type]} t 时间戳
     * @param  {[type]} splitStr 分隔符
     * @return {[type]}   [description]
     */
    timeToString: function(t, splitStr) {
        return this.dateToString(this.timeToDate(t), splitStr);
    },

    /**
     * 毫秒级时间转日期时间
     * @param  {[type]} t 毫秒时间戳
     * @return {[type]}   日期时间（格式：'2014-01-24 11:24:23'）
     */
    timeFormatDate: function(t) {
        var d = new Date(t),
            year = d.getFullYear().toString(),
            month = (d.getMonth() + 1).toString(),
            date = d.getDate().toString(),
            h = d.getHours().toString(),
            m = d.getMinutes().toString(),
            s = d.getSeconds().toString();

        function add0(n) {
            return n < 10 ? '0' + n : n
        }

        return year + '-' + add0(month) + '-' + add0(date) + ' ' + add0(h) + ':' + add0(m) + ':' + add0(s);
    },

    /**
     * 日期转字符串
     * @param  {[type]} d           日期时间
     * @param  {[type]} splitStr 分隔符
     * @return {[type]}             默认返回 yyyy-MM-dd HH:mm
     */
    dateToString: function(d, splitStr) {
        var year = d.getFullYear().toString(),
            month = (d.getMonth() + 1).toString(),
            day = d.getDate().toString(),
            h = d.getHours().toString(),
            m = d.getMinutes().toString();
        month = month.length > 1 ? month : ('0' + month);
        day = day.length > 1 ? day : ('0' + day);
        h = h.length > 1 ? h : ('0' + h);
        m = m.length > 1 ? m : ('0' + m);
        // var str = year + '-' + month + '-' + day + ' ' + h + ':' + m; // yyyy-MM-dd HH:mm
        var str = month + '-' + day + ' ' + h + ':' + m; // MM-dd HH:mm
        if (splitStr) {
            str = str.replace(/-/g, splitStr);
        }
        return str;
    },

    /**
     * 毫秒转成时间字符串
     * @param  {Number}  seconds 毫秒[必需]
     * @param  {Boolean} hasHour 是否需要区分小时[可选]
     * @return {String}          hasHour[true]: hh:mm:ss；否则[默认]：mm:ss。
     */
    msToTimestr: function(ts, hasHour) {
        var seconds = (ts ? Number(ts) / 1000 : 0);
        return GLOBAL.Util.secondsToTimestr(seconds, hasHour);
    },

    /**
     * 秒转成时间字符串
     * @param  {Number}  seconds 秒[必需]
     * @param  {Boolean} hasHour 是否需要区分小时[可选]
     * @return {String}          hasHour[true]: hh:mm:ss；否则[默认]：mm:ss。
     */
    secondsToTimestr: function(seconds, hasHour) {
        var hh, mm, ss;
        // 传入的时间为空或小于0
        if (seconds == null || seconds < 0) {
            return;
        }
        seconds = Math.ceil(seconds);
        // 得到小时
        hh = seconds / 3600 | 0;
        seconds = parseInt(seconds) - hh * 3600;
        if (parseInt(hh) < 10) {
            hh = '0' + hh;
        }
        // 得到分
        mm = seconds / 60 | 0;
        if (parseInt(mm) < 10) {
            mm = '0' + mm;
        }
        // 得到秒
        ss = parseInt(seconds) - mm * 60;
        if (ss < 10) {
            ss = '0' + ss;
        }
        if (hasHour) {
            return hh + ':' + mm + ':' + ss;
        }
        return mm + ':' + ss;
    },

    /**
     * 获取滚动高度
     * @return {[type]} [description]
     */
    getScrollTop: function() {
        var scrollTop = 0,
            bodyScrollTop = 0,
            documentScrollTop = 0;
        try {
            if (document.body) {
                bodyScrollTop = document.body.scrollTop;
            }
            if (document.documentElement) {
                documentScrollTop = document.documentElement.scrollTop;
            }
        } catch (e) {}
        scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
        return scrollTop;
    },

    getScrollHeight: function() {　　
        var scrollHeight = 0,
            bodyScrollHeight = 0,
            documentScrollHeight = 0;
        try {
            if (document.body) {
                bodyScrollHeight = document.body.scrollHeight;
            }
            if (document.documentElement) {
                documentScrollHeight = document.documentElement.scrollHeight;
            }
        } catch (e) {}
        scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
        return scrollHeight;
    },

    /**
     * 获取文档高度
     * @return {[type]} [description]
     */
    getClientHeight: function() {
        if (document.body.clientHeight && document.documentElement.clientHeight) {
            return (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
        } else {
            return (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
        }
    },

    //浏览器视口的高度
    getWindowHeight: function() {
        var windowHeight = 0;
        if (document.compatMode === "CSS1Compat") {
            windowHeight = document.documentElement.clientHeight;
        } else {
            windowHeight = document.body.clientHeight;
        }
        return windowHeight;
    },

    /**
     * browser的判断
     * @return {[type]} [description]
     */
    getBrowserType: function() {
        var agent = navigator.userAgent.toLowerCase();
        var browser_type = "";
        if (agent.indexOf("msie") > 0) {
            browser_type = "IE";
        }
        if (agent.indexOf("firefox") > 0) {
            browser_type = "firefox";
        }
        if (agent.indexOf("chrome") > 0 && agent.indexOf("mb2345browser") < 0 && agent.indexOf("360 aphone browser") < 0) {
            browser_type = "chrome";
        }
        if (agent.indexOf("360 aphone browser") > 0 || agent.indexOf("qhbrowser") > 0) {
            browser_type = "360";
        }
        if (agent.indexOf("ucbrowser") > 0) {
            browser_type = "UC";
        }
        if (agent.indexOf("micromessenger") > 0) {
            browser_type = "WeChat";
        }
        if ((agent.indexOf("mqqbrowser") > 0 || agent.indexOf("qq") > 0) && agent.indexOf("micromessenger") < 0) {
            browser_type = "QQ";
        }
        if (agent.indexOf("miuibrowser") > 0) {
            browser_type = "MIUI";
        }
        if (agent.indexOf("mb2345browser") > 0) {
            browser_type = "2345";
        }
        if (agent.indexOf("sogoumobilebrowser") > 0) {
            browser_type = "sogou";
        }
        if (agent.indexOf("liebaofast") > 0) {
            browser_type = "liebao";
        }
        if (agent.indexOf('weibo') > 0) {
            browser_type = "weibo";
        }
        if (agent.indexOf("safari") > 0 && agent.indexOf("chrome") < 0 && agent.indexOf("ucbrowser") < 0 && agent.indexOf("micromessenger") < 0 && agent.indexOf("mqqbrowser") < 0 && agent.indexOf("miuibrowser") < 0 && agent.indexOf("mb2345browser") < 0 && agent.indexOf("sogoumobilebrowser") < 0 && agent.indexOf("liebaofast") < 0 && agent.indexOf("qhbrowser") < 0 && agent.indexOf("weibo") < 0) {
            browser_type = "safari";
        }
        return browser_type;
    },

    /**
     * OS的判断
     * @return {[type]} [description]
     */
    getOsType: function() {
        var agent = navigator.userAgent.toLowerCase(),
            os_type = '',
            index = '',
            version = '';
        if (/android/i.test(navigator.userAgent)) {
            index = agent.indexOf("android");
            version = agent.substr(index + 8, 3);
            os_type = "Android " + version;
        }
        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
            index = agent.indexOf("os");
            version = agent.substr(index + 3, 3);
            os_type = "iOS " + version;
        }
        if (/Linux/i.test(navigator.userAgent) && !/android/i.test(navigator.userAgent) && !/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
            os_type = "Linux";
        }
        if (/windows|win32/i.test(navigator.userAgent)) {
            os_type = "windows32";
        }
        if (/windows|win64/i.test(navigator.userAgent)) {
            os_type = "windows64";
        }
        return os_type;
    },

    /**
     * 判断是否是手机访问
     * @return {Boolean} [description]
     */
    isMobile: function() {
        var u = navigator.userAgent,
            Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"),
            mobile = false;
        for (var v = 0; v < Agents.length; v++) {
            if (u.indexOf(Agents[v]) > -1) {
                mobile = true;
            }
        }
        return mobile
    },

    /**
     * 获取ip地址
     * @return {Object} 当前访问IP
     */
    // getIpAddress: function () {
    //     this.getScript('http://pv.sohu.com/cityjson?ie=utf-8', function () {
    //         var ip = returnCitySN.cip;
    //         return ip
    //     });
    // },

    /**
     * 获取当前手机屏幕分辨率的高宽
     * @return {json} {w: xxx, h: xxx}
     */
    getPixel: function() {
        var width = window.screen.width;
        var height = window.screen.height;
        return { w: width, h: height };
    },

    /**
     * 获取字符串字节数
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    getBytes: function(str) {
        var byteLen = 0,
            len = str.length;
        if (str) {
            for (var i = 0; i < len; i++) {
                if (str.charCodeAt(i) > 255) {
                    byteLen += 2;
                } else {
                    byteLen++;
                }
            }
            return byteLen;
        } else {
            return 0;
        }
    },

    /**
     * Javascript获取页面来源(referer)
     * @from http://www.au92.com/archives/javascript-get-referer.html
     * @return {[type]} [description]
     */
    getReferrer: function() {
        var referrer = '';
        try {
            referrer = window.top.document.referrer;
        } catch (e) {
            if (window.parent) {
                try {
                    referrer = window.parent.document.referrer;
                } catch (e2) {
                    referrer = '';
                }
            }
        }
        if (referrer === '') {
            referrer = document.referrer;
        }
        return referrer;
    },

    /**
     * 获取url（排除url中参数）
     * @return {[type]} [description]
     */
    getUrlNoParams: function() {
        var locaUrl = window.location.href,
            endIndex = 0;
        if (locaUrl.indexOf("?") >= 0) {
            endIndex = locaUrl.indexOf("?");
            return locaUrl.substring(0, endIndex);
        }
        if (locaUrl.indexOf("#") >= 0) {
            endIndex = locaUrl.indexOf("#");
            return locaUrl.substring(0, endIndex);
        }
        return locaUrl;
    },

    /**
     * 获取url
     * @return {[type]} [description]
     */
    getUrl: function() {
        var locaUrl = window.location.href,
            endIndex = 0;
        if (locaUrl.indexOf("?") >= 0) {
            endIndex = locaUrl.indexOf("?");
            return locaUrl.substring(0, endIndex);
        }
        if (locaUrl.indexOf("#") >= 0) {
            endIndex = locaUrl.indexOf("#");
            return locaUrl.substring(0, endIndex);
        }
        return locaUrl;
    },

    /**
     * 获取iframe外的body
     * @return {[type]} [description]
     */
    getIframeBody: function() {
        var $body;
        // 判断是否在iframe中
        // if (window.frames.length != parent.frames.length) {  
        //     $body = $(parent.frames.document.body);
        // } else {
        //     $body = $('body');
        // }
        if (self != top) {
            $body = $(window.top.document.body);
        } else {
            $body = $('body');
        }
        return $body
    },

    /**
     * 设置iframe宽高
     * @param {[type]} ifm iframe DOM对象
     */
    setIframe: function(ifm) {
        var ifm = ifm || window.frames['iframe'] || document.getElementById('iframe') || null;
        if (ifm) {
            var subWeb = document.frames ? document.frames["iframe"].document : ifm.contentDocument;
            if (ifm != null && subWeb != null) {
                ifm.height = subWeb.body.scrollHeight;
                ifm.width = subWeb.body.scrollWidth;
            }
        }
    },

    /**
     * 设置iframe content宽高
     * @param {[type]} ifm iframe DOM对象
     */
    setIframeContent: function(ifm) {
        var ifm = ifm || window.frames['iframe'] || document.getElementById('iframe') || null;
        if (ifm) {
            var subWeb = document.frames ? document.frames["iframe"].document : ifm.contentDocument;
            if (ifm != null && subWeb != null) {
                subWeb.documentElement.width = ifm.parentNode.offsetWidth;
                subWeb.documentElement.height = ifm.parentNode.offsetHeight;
                subWeb.body.setAttribute('width', ifm.parentNode.offsetWidth);
                subWeb.body.setAttribute('height', ifm.parentNode.offsetHeight);
            }
        }
    },

    createStyle: function(style, callback, element) {
        if (style) {
            var head = document.getElementsByTagName('head')[0],
                css = document.createElement('style');
            css.innerHTML = style;
            if (element) {
                element.appendChild(css);
            } else {
                head.appendChild(css);
            }
            //执行回调
            callback && callback();
        }
    },

    /**
     * 替换字符串
     * 支持原生
     * @param {String} template
     * @param {Object} map
     */
    substitute: function(template, map) {
        return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function(match, key, format) {
            if (map[key]) {
                return map[key];
            } else if (map[key] === 0) {
                return "0";
            } else {
                return "";
            }
        });
    },



};


/* cookie扩展 */
GLOBAL.Cookie = {
    /**
     * 设置cookie
     * @param name 名称
     * @param value 值
     * @param expires 有效时间（单位：小时）（可选） 默认：24h
     */
    set: function(name, value, expires, domain) {
        var expTimes = expires ? (Number(expires) * 60 * 60 * 1000) : (24 * 60 * 60 * 1000); // 毫秒
        var expDate = new Date();
        expDate.setTime(expDate.getTime() + expTimes);
        var expString = expires ? '; expires=' + expDate.toUTCString() : '';
        var pathString = '; path=/';
        var domain = '; domain=' + domain;
        document.cookie = name + '=' + encodeURI(value) + expString + pathString + domain;
    },
    /**
     * 读cookie
     * @param name
     */
    get: function(name) {
        var cookieStr = '; ' + document.cookie + '; ';
        var index = cookieStr.indexOf('; ' + name + '=');
        if (index !== -1) {
            var s = cookieStr.substring(index + name.length + 3, cookieStr.length);
            return decodeURI(s.substring(0, s.indexOf('; ')));
        } else {
            return null;
        }
    },
    /**
     * 删除cookie
     * @param name
     */
    del: function(name, domain) {
        var exp = new Date(new Date().getTime() - 1);
        var s = this.get(name);
        if (s !== null) {
            document.cookie = name + '=' + s + '; expires=' + exp.toUTCString() + '; path=/; domain=' + domain;
        }
    }
};

// 操作系统
GLOBAL.Os = function() {
    var u = navigator.userAgent,
        Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"),
        mobile = false;
    for (var v = 0; v < Agents.length; v++) {
        if (u.indexOf(Agents[v]) > -1) {
            mobile = true;
            break;
        }
    }
    return {
        //移动终端浏览器版本信息 
        mobile: mobile, //是否为移动终端 
        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端 
        android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器 
        iphone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器 
        ipad: u.indexOf('iPad') > -1, //是否iPad 
        webapp: u.indexOf('Safari') === -1 //是否web应该程序，没有头部与底部 
    };
}();

// 浏览器
GLOBAL.Browser = function() {
    var ua = navigator.userAgent, //获取判断用的对象
        mobile = GLOBAL.Os.mobile;
    if (mobile) { // mobile
        //移动终端浏览器版本信息
        return {
            wechat: ua.indexOf('MicroMessenger') > -1, // 在微信中打开  
            weibo: ua.toLowerCase().indexOf('weibo') > -1, // 在新浪微博客户端打开
            qq: ua.indexOf('QQ/') > -1, // 在QQ、QQ空间中打开 
            qqbrowser: ua.indexOf('MQQBrowser') > -1 // 在QQ空间打开
        };
    }
    return {};
}();

// 在线链接
GLOBAL.Online = {
    // 发布上线
    preUrl: '//www.mop.com/', // 在线地址
    hostUrl: '//www.mop.com/', // 在线地址
    loginUrl: '//www.mop.com/login.html', // 登录
    registerUrl: '//www.mop.com/register.html', // 注册
    perfectUrl: '//www.mop.com/perfect.html', // 完善信息
    postUrl: '//dzh.mop.com/dzhpost.html', // 大杂烩发帖页面
    ttpostUrl: '//tt.mop.com/ttpost.html', // 贴贴发帖页面

    // 测试
    // preUrl: '//www.mop.com/moptest/', // 在线地址
    // hostUrl: '//www.mop.com/moptest/', // 在线地址
    // loginUrl: '//www.mop.com/moptest/login.html', // 登录
    // registerUrl: '//www.mop.com/moptest/register.html', // 注册
    // perfectUrl: '//www.mop.com/moptest/perfect.html',  // 完善信息
    // postUrl: '//dzh.mop.com/moptest/dzhpost.html', // 大杂烩发帖页面
    // ttpostUrl: '//tt3.mop.com/subject/add', // 贴贴发帖页面

    // preUrl: '',  // 在线地址
    // loginUrl: 'login.html',  // 登录
    // registerUrl: 'register.html',  // 注册
    // perfectUrl: 'perfect.html',  // 完善信息
    // postUrl: 'http://dzh.mop.com/subject/add', // 发帖页面
}