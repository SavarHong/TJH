/*
 * 依赖JQuery或者ZeptoJs
 * 组件是：下拉更新，上拉更新，页面滑动，弹层，延迟加载。
*/

(function (){
	'use strict';

	/*===========================
    	QingApp
    ===========================*/

    window.QingApp = function (params){

    	//app
    	var app = this;

    	//Version
    	app.version = "1.0.0";

    	//默认参数配置
    	app.params = {
    		// Fast clicks
            fastClicks: true,
            fastClicksDistanceThreshold: 0,
            // 激活状态
            activeState: true,
            activeStateElements: 'a, button, label, span',
            // 外部链接
            externalLinks: '.external', // 添加这个Class可以使a的正常跳转到href
            // Lazy Load
            imagesLazyLoadThreshold: 0,
            imagesLazyLoadSequential: true,

            // 自动初始化
            init: true
    	};

    	// 扩展默认参数
    	for (var param in params) {
            app.params[param] = params[param];
        }

    	// Touch 事件, 主要为处理滑动的事件和方法
    	app.touchEvents = {
			start: app.support.touch ? 'touchstart' : 'mousedown',
			move: app.support.touch ? 'touchmove' : 'mousemove',
			end: app.support.touch ? 'touchend' : 'mouseup'
    	};
        /*==================================================================
        ************   操作成功浮层，可传入不同文本 与图标样式  ************
        ==================================================================*/
        // 显示成功浮层 →_→
        // tipsText: 浮层文本
        // tipsIcon: 浮层图标对应的样式名称，succeed-tips-icon =》对勾或者failure-tips-icon =》叉叉
        app.showSucceedTips = function (tipsText, tipsIcon) {
            //如果没有传入第二个参数，则默认图标样式succeed-tips-icon
            if(!tipsIcon) tipsIcon = 'succeed-tips-icon';
            if($('.succeed-tips-overlay, .succeed-tips-modal').length) {
                app.hideSucceedTips();
            }
            $('.page-wrap').append('<div class="succeed-tips-overlay"></div><div class="succeed-tips-modal"><div class="'+tipsIcon+'"></div><div class="succeed-tips-text">'+tipsText+'</div></div>');
            setTimeout(function () {app.hideSucceedTips();}, 1000);
        };

        
        /*===============================================================================
        ************                          倒计时模块                     ************
        ===============================================================================*/
        //引用方法

        //    var d = Date.UTC(2016, 3, 4, 18, 34); 传入时间
        //    var obj = {
        //         sec: document.getElementById("sec"),  各时间所在元素
        //         mini: document.getElementById("min"),
        //         hour: document.getElementById("hour")
        //    }
        //    TAPP.fnTimeCountDown(d, obj);

        app.fnTimeCountDown = function(d, o){
            var f = {
                zero: function(n){
                    var n = parseInt(n, 10);
                    if(n > 0){
                        if(n <= 9){
                            n = "0" + n;    
                        }
                        return String(n);
                    }else{
                        return "00";    
                    }
                },
                dv: function(){
                    d = d || Date.UTC(2050, 0, 1); //如果未定义时间，则我们设定倒计时日期是2050年1月1日
                    var future = new Date(d), now = new Date();
                    //现在将来秒差值
                    var dur = Math.round((future.getTime() - now.getTime()) / 1000) + future.getTimezoneOffset() * 60, pms = {
                        sec: "00",
                        mini: "00",
                        hour: "00",
                        day: "00",
                        month: "00",
                        year: "0"
                    };
                    if(dur > 0){
                        pms.sec = f.zero(dur % 60);
                        pms.mini = Math.floor((dur / 60)) > 0? f.zero(Math.floor((dur / 60)) % 60) : "00";
                        pms.hour = Math.floor((dur / 3600)) > 0? f.zero(Math.floor((dur / 3600)) % 24) : "00";
                        pms.day = Math.floor((dur / 86400)) > 0? f.zero(Math.floor((dur / 86400)) % 30) : "00";
                        //月份，以实际平均每月秒数计算
                        pms.month = Math.floor((dur / 2629744)) > 0? f.zero(Math.floor((dur / 2629744)) % 12) : "00";
                        //年份，按按回归年365天5时48分46秒算
                        pms.year = Math.floor((dur / 31556926)) > 0? Math.floor((dur / 31556926)) : "0";
                    }
                    return pms;
                },
                ui: function(){
                    if(o.sec){
                        o.sec.innerHTML = f.dv().sec;
                    }
                    if(o.mini){
                        o.mini.innerHTML = f.dv().mini;
                    }
                    if(o.hour){
                        o.hour.innerHTML = f.dv().hour;
                    }
                    if(o.day){
                        o.day.innerHTML = f.dv().day;
                    }
                    if(o.month){
                        o.month.innerHTML = f.dv().month;
                    }
                    if(o.year){
                        o.year.innerHTML = f.dv().year;
                    }
                    setTimeout(f.ui, 1000);
                }
            };  
            f.ui();
        };

        /*======================================================
        ************   拉动页面   ************
        ======================================================*/
        app.initPullToRefresh = function (pageContainer) {
            var eventsTarget = $(pageContainer);
            if (!eventsTarget.hasClass('pull-to-refresh-content')) {
                eventsTarget = eventsTarget.find('.pull-to-refresh-content');
            }
            if (!eventsTarget || eventsTarget.length === 0) return;

            var isTouched, isMoved, touchesStart = {}, isScrolling, touchesDiff, touchStartTime, container, refresh = false, useTranslate = false, startTranslate = 0, translate, scrollTop, wasScrolled, layer;
            var page = eventsTarget.hasClass('page-wrap') ? eventsTarget : eventsTarget.parents('.page-wrap');
            var dpr = $("html").data("dprnum");
            var dprunm = parseInt(dpr, 10);
            var pullGap = 80 * dprunm || 80;

            container = eventsTarget;

            function handleTouchStart(e) {
                if (isTouched) {
                    if (app.device.os === 'android') {
                        if ('targetTouches' in e && e.targetTouches.length > 1) return;
                    }
                    else return;
                }
                isMoved = false;
                isTouched = true;
                isScrolling = undefined;
                wasScrolled = undefined;
                touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
                touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
                touchStartTime = (new Date()).getTime();
                /*jshint validthis:true */
                container = $(this);
            }

            function handleTouchMove(e) {
                if (!isTouched) return;
                var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
                var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
                if (typeof isScrolling === 'undefined') {
                    isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x));
                }
                if (!isScrolling) {
                    isTouched = false;
                    return;
                }
                if ($(container[0]).closest(".page-content").length > 0) {
                    scrollTop = $(container[0]).closest(".page-content").scrollTop();
                } else {
                    scrollTop = container[0].scrollTop;
                }

                if (typeof wasScrolled === 'undefined' && scrollTop !== 0) wasScrolled = true;

                if (!isMoved) {
                    /*jshint validthis:true */
                    container.removeClass('transitioning');
                    // layer.removeClass('transitioning');
                    if (scrollTop > container[0].offsetHeight) {
                        isTouched = false;
                        return;
                    }
                    startTranslate = container.hasClass('refreshing') ? pullGap : 0;
                    if (container[0].scrollHeight === container[0].offsetHeight || app.device.os !== 'ios') {
                        useTranslate = true;
                    }
                    else {
                        useTranslate = false;
                    }
                }
                isMoved = true;
                touchesDiff = pageY - touchesStart.y;

                if (touchesDiff > 0 && scrollTop <= 0 || scrollTop < 0) {
                    // iOS 8 fix
                    if (app.device.os === 'ios' && parseInt(app.device.osVersion.split('.')[0], 10) > 7 && scrollTop === 0 && !wasScrolled) useTranslate = true;

                    if (useTranslate) {
                        e.preventDefault();
                        translate = (Math.pow(touchesDiff, 0.85) + startTranslate);
                        container.transform('translate3d(0,' + translate + 'px,0)');
                    }
                    else {
                    }
                    if ((useTranslate && Math.pow(touchesDiff, 0.85) > pullGap) || (!useTranslate && touchesDiff >= 88)) {
                        refresh = true;
                        container.addClass('pull-up').removeClass('pull-down');
                    }
                    else {
                        refresh = false;
                        container.removeClass('pull-up').addClass('pull-down');
                    }
                }
                else {

                    container.removeClass('pull-up pull-down');
                    refresh = false;
                    return;
                }
            }
            function handleTouchEnd(e) {
                if (!isTouched || !isMoved) {
                    isTouched = false;
                    isMoved = false;
                    return;
                }
                if (translate) {
                    container.addClass('transitioning');
                    translate = 0;
                }
                container.transform('');
                if (refresh) {
                    container.addClass('refreshing');
                    container.trigger('refresh', {
                        done: function () {
                            app.pullToRefreshDone(container);
                        }
                    });
                }
                else {
                    container.removeClass('pull-down');
                }
                isTouched = false;
                isMoved = false;
            }

            // 绑定事件
            eventsTarget.on(app.touchEvents.start, handleTouchStart);
            eventsTarget.on(app.touchEvents.move, handleTouchMove);
            eventsTarget.on(app.touchEvents.end, handleTouchEnd);

            if (page.length === 0) return;
            function destroyPullToRefresh() {
                eventsTarget.off(app.touchEvents.start, handleTouchStart);
                eventsTarget.off(app.touchEvents.move, handleTouchMove);
                eventsTarget.off(app.touchEvents.end, handleTouchEnd);
            }
            eventsTarget[0].QDestroyPullToRefresh = destroyPullToRefresh;

        };

        app.pullToRefreshDone = function (container) {
            container = $(container);
            if (container.length === 0) container = $('.pull-to-refresh-content.refreshing');
            container.removeClass('refreshing').addClass('transitioning');
            container.transitionEnd(function () {
                container.removeClass('transitioning pull-up pull-down');
            });
        };
        app.pullToRefreshTrigger = function (container) {
            container = $(container);
            if (container.length === 0) container = $('.pull-to-refresh-content');
            if (container.hasClass('refreshing')) return;
            container.addClass('transitioning refreshing');
            container.trigger('refresh', {
                done: function () {
                    app.pullToRefreshDone(container);
                }
            });
        };

        app.destroyPullToRefresh = function (pageContainer) {
            pageContainer = $(pageContainer);
            var pullToRefreshContent = pageContainer.hasClass('pull-to-refresh-content') ? pageContainer : pageContainer.find('.pull-to-refresh-content');
            if (pullToRefreshContent.length === 0) return;
            if (pullToRefreshContent[0].QDestroyPullToRefresh) pullToRefreshContent[0].QDestroyPullToRefresh();
        };
        /* ===============================================================================
        ************   无限滚动   ************
        =============================================================================== */
        function handleInfiniteScroll() {
            /*jshint validthis:true */
            var inf = $(this);
            var scrollTop = inf[0].scrollTop;
            var scrollHeight = inf[0].scrollHeight;
            var height = inf[0].offsetHeight;
            var distance = inf[0].getAttribute('data-distance');
            var dpr = $("html").data("dprnum");
            var dprunm = parseInt(dpr, 10);
            if (!distance) distance = 50;
            if (typeof distance === 'string' && distance.indexOf('%') >= 0) {
                distance = parseInt(distance, 10) / 100 * height;
            }
            distance = distance * dprunm;
            if (distance > height) distance = height;
            if (scrollTop + height >= scrollHeight - distance) {
                inf.trigger('infinite');
            }
        }
        app.attachInfiniteScroll = function (infiniteContent) {
            $(infiniteContent).on('scroll', handleInfiniteScroll);
        };
        app.detachInfiniteScroll = function (infiniteContent) {
            $(infiniteContent).off('scroll', handleInfiniteScroll);
        };

        app.initInfiniteScroll = function (pageContainer) {
            pageContainer = $(pageContainer);
            var infiniteContent = pageContainer.find('.infinite-scroll');
            if (infiniteContent.length === 0) return;
            app.attachInfiniteScroll(infiniteContent);
        };
        /* ===============================================================================
        ************   瀑布流（两列简易瀑布流）   ************
        =============================================================================== */
        app.waterFall = function (data) {
            var waterFallContent = $('.waterfall-scroll');
            var column = [$('#col1'), $('#col2')];
            var appendData = data;
            var w = this;

            w.getRowByHeight = function () {
                var height = [];
                for (var i = 0; column[i]; i++) {
                  column[i].height = column[i].height();
                  height.push(column[i]);
                }
                // 对高度进行排序，低--》高,保证最矮的优先加载
                height.sort(function (a, b) {
                  return a.height - b.height;
                });
                return height;
            };
            w.createHtml = function (imageUrl, appSchemaUrl) {
                var strHtml = '<img class="waterfall-img lazy" src="'+ siteContext.waterfallLoading +'" data-src="' + imageUrl + '" alt="" >';
                var div = document.createElement('div');
                div.className = 'cell-item need-check has-link';
                div.innerHTML = strHtml;
                div.setAttribute("data-src", appSchemaUrl);
                return div;
            };

            w.lazyLoadImg = function () {
                var unloadedpic = waterFallContent.find(".waterfall-img").not(".lazy-loaded");
                unloadedpic.trigger('lazy');
            };

            w.init = function () {
                var rows = w.getRowByHeight(), div, k;
                for (var i = 0; appendData[i]; i++) {
                  div = w.createHtml(data[i].imageUrl, data[i].appSchemaUrl);
                  // 因为是4列，所以数据以4列一个轮回加载，改成2列
                  k = ((i + 1) > 2) ? i % 2 : i;
                  // 在列上添加数据
                  rows[k].append(div);
                  w.lazyLoadImg();
                }
            };

            w.init();
        }
        app.initWaterFallScroll = function (pageContainer) {
            pageContainer = $(pageContainer);
            var waterFallContent = pageContainer.find('.waterfall-scroll');
            if (waterFallContent.length === 0) return;
            app.attachInfiniteScroll(waterFallContent);
        }
        /* ===============================================================================
        ************   Tabs   ************
        =============================================================================== */
        app.showTab = function (tab, tabLink) {
            var newTab = $(tab);
            if (newTab.hasClass('active')) return false;
            if (newTab.length === 0) return false;
            var tabs = newTab.parent('.tabs');
            if (tabs.length === 0) return false;

            // Remove active class from old tabs
            var oldTab = tabs.children('.tab.active').removeClass('active');
            // Add active class to new tab
            newTab.addClass('active');
            // Trigger 'show' event on new tab
            newTab.trigger('show');

            // Find related link for new tab
            if (tabLink) tabLink = $(tabLink);
            else {
                // Search by id
                if (typeof tab === 'string') tabLink = $('.tab-link[href="' + tab + '"]');
                else tabLink = $('.tab-link[href="#' + newTab.attr('id') + '"]');
                // Search by data-tab
                if (!tabLink || tabLink && tabLink.length === 0) {
                    $('[data-tab]').each(function () {
                        if (newTab.is($(this).attr('data-tab'))) tabLink = $(this);
                    });
                }
            }
            if (tabLink.length === 0) return;

            // Find related link for old tab
            var oldTabLink;
            if (oldTab && oldTab.length > 0) {
                // Search by id
                var oldTabId = oldTab.attr('id');
                if (oldTabId) oldTabLink = $('.tab-link[href="#' + oldTabId + '"]');
                // Search by data-tab
                if (!oldTabLink || oldTabLink && oldTabLink.length === 0) {
                    $('[data-tab]').each(function () {
                        if (oldTab.is($(this).attr('data-tab'))) oldTabLink = $(this);
                    });
                }
            }

            // Update links' classes
            if (tabLink && tabLink.length > 0) tabLink.addClass('active');
            if (oldTabLink && oldTabLink.length > 0) oldTabLink.removeClass('active');

            return true;
        };
        /*======================================================
        ************   滑动组件   ************
        ======================================================*/
        var Slider = function (container, params) {
            var defaults = {
                initialSlide: 0,
                spaceBetween: 0,
                speed: 300,
                loop: false,
                slidesPerView: 1,
                onlyExternal: false,
                direction: 'horizontal',
                paginationHide: true,
                slideClass: 'slider-slide',
                slideActiveClass: 'slider-slide-active',
                slideNextClass: 'slider-slide-next',
                slidePrevClass: 'slider-slide-prev',
                wrapperClass: 'slider-wrapper',
                bulletClass: 'slider-pagination-bullet',
                bulletActiveClass: 'slider-pagination-active',
                preventClicks: true,
                preventClicksPropagation: true,
                autoplay: false,
                autoplayDisableOnInteraction: true,
                sliderCloseTouchMove: false
            };
            params = params || {};
            for (var def in defaults) {
                if (typeof params[def] === 'undefined') {
                    params[def] = defaults[def];
                }
            }

            var s = this;
            s.params = params;
            s.container = $(container);
            if (s.container.length === 0) return;
            s.container[0].QSlider = s;

            if (s.params.direction === 'vertical') {
                s.container.addClass('slider-container-vertical');
            }
            else {
                s.container.addClass('slider-container-horizontal');
            }

            s.wrapper = s.container.children('.' + s.params.wrapperClass);

            if (s.params.pagination) {
                s.paginationContainer = $(s.params.pagination);
            }

            s.activeSlideIndex = s.previousSlideIndex = s.params.initialSlide || 0;

            var isH = s.params.direction === 'horizontal';

            var inverter = isH ? (app.rtl ? -1 : 1) : 1;

            s.updateSlides = function () {
                s.slides = s.wrapper.children('.' + s.params.slideClass);

                if (s.params.spaceBetween !== 0) {
                    var marginProp = app.rtl ? 'marginLeft' : 'marginRight';
                    if (isH) {
                        s.slides.css(marginProp, s.params.spaceBetween + 'px');
                    }
                    else s.slides.css({marginBottom: s.params.spaceBetween + 'px'});
                }
                if (s.params.slidesPerView > 1) {
                    var sizeValue = '(100% - ' + (s.params.slidesPerView - 1) * params.spaceBetween + 'px)/' + s.params.slidesPerView;
                    if (isH) {
                        s.slides.css('width', '-webkit-calc(' + sizeValue + ')');
                        s.slides.css('width', '-moz-calc(' + sizeValue + ')');
                        s.slides.css('width', 'calc(' + sizeValue + ')');
                    }
                    else {
                        s.slides.css('height', '-webkit-calc(' + sizeValue + ')');
                        s.slides.css('height', '-moz-calc(' + sizeValue + ')');
                        s.slides.css('height', 'calc(' + sizeValue + ')');
                    }
                }
                // First/last
                s.isFirst = s.isBeginning = s.activeSlideIndex === 0;
                s.isLast = s.isEnd = s.activeSlideIndex === s.slides.length - s.params.slidesPerView;
            };

            s.updatePagination = function () {
                if (s.paginationContainer && s.paginationContainer.length > 0) {
                    var bulletsHTML = '';
                    var bulletsLength = s.slides.length - s.params.slidesPerView + 1;
                    if (s.params.loop) {
                        bulletsLength = s.slides.length - s.loopedSlides * 2;
                    }
                    for (var i = 0; i < bulletsLength; i++) {
                        bulletsHTML += '<span class="' + s.params.bulletClass + '"></span>';
                    }
                    s.paginationContainer.html(bulletsHTML);
                    s.bullets = s.paginationContainer.find('.' + s.params.bulletClass);
                }
            };

            s.updateSize = function () {
                s.width = s.container[0].offsetWidth;
                s.height = s.container[0].offsetHeight;
                s.size = isH ? s.width : s.height;
            };

            s.attachEvents = function (detach) {
                var action = detach ? 'off' : 'on';
                // Slide between photos
                s.container[action](app.touchEvents.start, s.onTouchStart);
                s.container[action](app.touchEvents.move, s.onTouchMove);
                s.container[action](app.touchEvents.end, s.onTouchEnd);
                $(window)[action]('resize', s.onResize);

                // Next, Prev, Index
                if (s.params.nextButton) $(s.params.nextButton)[action]('click', s.onClickNext);
                if (s.params.prevButton) $(s.params.prevButton)[action]('click', s.onClickPrev);
                if (s.params.indexButton) $(s.params.indexButton)[action]('click', s.onClickIndex);

                // Prevent Links
                if (s.params.preventClicks || s.params.preventClicksPropagation) s.container[action]('click', s.onClick, true);
            };
            s.detachEvents = function () {
                s.attachEvents(true);
            };

            s.onResize = function () {
                s.updateSize();
                s.slideTo(s.activeSlideIndex, 0, false);
            };

            var isTouched, isMoved, touchesStart = {}, touchesCurrent = {}, touchStartTime, isScrolling, currentTranslate;
            var lastClickTime = Date.now(), clickTimeout;
            s.animating = false;
            s.allowClick = true;

            s.onClick = function (e) {
                if (s.params.preventClicks && !s.allowClick) {
                    e.preventDefault();
                    if (s.params.preventClicksPropagation) {
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    }
                }
            };

            s.touchedTarget = null;
            s.onTouchStart = function (e) {
                if (s.params.onlyExternal) return;
                s.touchedTarget = e.target;
                isTouched = true;
                isMoved = false;
                isScrolling = undefined;
                touchesStart.x = touchesCurrent.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
                touchesStart.y = touchesCurrent.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
                touchStartTime = Date.now();
                s.allowClick = true;
                s.updateSize();
                if (s.params.onTouchStart) s.params.onTouchStart(s, e);

            };
            s.onTouchMove = function (e) {
                if (s.params.onTouchMove) s.params.onTouchMove(s, e);
                s.allowClick = false;
                if (e.targetTouches && e.targetTouches.length > 1) return;

                touchesCurrent.x = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
                touchesCurrent.y = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;

                if (typeof isScrolling === 'undefined') {
                    isScrolling = !!(isScrolling || Math.abs(touchesCurrent.y - touchesStart.y) > Math.abs(touchesCurrent.x - touchesStart.x));
                }
                if ((isH && isScrolling) || (!isH && !isScrolling))  {
                    if (s.params.onOppositeTouchMove) s.params.onOppositeTouchMove(s, e);
                }
                if (!isTouched) return;
                if ((isH && isScrolling) || (!isH && !isScrolling))  {
                    isTouched = false;
                    return;
                }
                if (s.params.onSliderMove) s.params.onSliderMove(s, e);

                e.preventDefault();
                e.stopPropagation();

                if (!isMoved) {
                    if (params.loop) {
                        s.fixLoop();
                    }
                    currentTranslate = $.getTranslate(s.wrapper[0], isH ? 'x' : 'y') * inverter;
                    s.wrapper.transition(0);
                    if (s.animating) s.onTransitionEnd();
                    if (params.autoplay && autoplay) {
                        if (s.params.autoplayDisableOnInteraction) s.stopAutoplay();
                        else {
                            if (autoplayTimeout) clearTimeout(autoplayTimeout);
                        }
                    }
                }
                isMoved = true;
                var diff = isH ? (touchesCurrent.x - touchesStart.x) * inverter : touchesCurrent.y - touchesStart.y;

                if ((diff > 0 && s.activeSlideIndex === 0)) diff = Math.pow(diff, 0.85);
                else if (diff < 0 && s.activeSlideIndex === s.slides.length - s.params.slidesPerView) {
                    diff = -Math.pow(-diff, 0.85);
                }
                else if (diff < 0 && s.activeSlideIndex === 0 && s.slides.length < s.params.slidesPerView) {
                    diff = -Math.pow(-diff, 0.85);
                }

                var translateX = isH ? (diff + currentTranslate) * inverter : 0, translateY = isH ? 0 : diff + currentTranslate;

                s.wrapper.transform('translate3d(' + translateX + 'px, ' + translateY + 'px,0)');
            };
            s.onTouchEnd = function (e) {
                if (s.params.onTouchEnd) s.params.onTouchEnd(s, e);
                var touchEndTime = Date.now();
                var timeDiff = touchEndTime - touchStartTime;
                if (s.allowClick) {
                    if (timeDiff < 300 && (touchEndTime - lastClickTime) > 300) {
                        if (clickTimeout) clearTimeout(clickTimeout);
                        clickTimeout = setTimeout(function () {
                            if (!s) return;
                            if (s.params.paginationHide && s.paginationContainer) {
                                s.paginationContainer.toggleClass('slider-pagination-hidden');
                            }
                            if (s.params.onClick) s.params.onClick(s, e);
                        }, 300);

                    }
                    if (timeDiff < 300 && (touchEndTime - lastClickTime) < 300) {
                        if (clickTimeout) clearTimeout(clickTimeout);
                        if (s.params.onDoubleTap) {
                            s.params.onDoubleTap(s, e);
                        }
                    }
                    if (s.params.onTap) s.params.onTap(s, e);
                }

                lastClickTime = Date.now();

                if (!isTouched || !isMoved) {
                    isTouched = isMoved = false;
                    return;
                }
                isTouched = isMoved = false;
                var touchesDiff = isH ? (touchesCurrent.x - touchesStart.x) * inverter : touchesCurrent.y - touchesStart.y;

                //Release links clicks
                if (Math.abs(touchesDiff) < 5 && (timeDiff) < 300 && s.allowClick === false) {
                    s.allowClick = true;
                }
                setTimeout(function () {
                    if (!s) return;
                    s.allowClick = true;
                }, 100);

                var continueAutoplay = s.params.autoplay && autoplay && !s.params.autoplayDisableOnInteraction;

                if (touchesDiff === 0) {
                    if (continueAutoplay) {
                        s.startAutoplay();
                    }
                    return;
                }
                var skipSlides = 1;
                var slideSize = s.size / s.params.slidesPerView;
                if (s.params.slidesPerView > 1) {
                    skipSlides = Math.abs((Math.abs(touchesDiff) + slideSize / 2) / slideSize);
                }
                if (continueAutoplay) {
                    s.wrapper.transitionEnd(function () {
                        s.startAutoplay();
                    });
                }

                if (timeDiff > 300) {
                    // Long touches
                    if (touchesDiff <= -slideSize / 2) {
                        s.slideTo(s.activeSlideIndex + Math.floor(skipSlides));
                    }
                    else if (touchesDiff > slideSize / 2) {
                        s.slideTo(s.activeSlideIndex - Math.floor(skipSlides));
                    }
                    else {
                        s.slideReset();
                    }
                }
                else {
                    if (Math.abs(touchesDiff) < 10) {
                        s.slideReset();
                    }
                    else {
                        if (touchesDiff < 0) {
                            s.slideTo(s.activeSlideIndex + Math.round(skipSlides));
                        }
                        else {
                            s.slideTo(s.activeSlideIndex - Math.round(skipSlides));
                        }
                    }

                }
            };

            s.slideTo = function (index, speed, runCallbacks) {
                if (typeof index === 'undefined') index = 0;
                if (index > s.slides.length - s.params.slidesPerView) index = s.slides.length - s.params.slidesPerView;
                if (index < 0) index = 0;

                var translate = - (s.size + s.params.spaceBetween) * index / s.params.slidesPerView;

                if (typeof speed === 'undefined') speed = s.params.speed;
                s.previousSlideIndex = s.activeSlideIndex;
                s.activeSlideIndex = Math.round(index);
                s.isFirst = s.isBeginning = s.activeSlideIndex === 0;
                s.isLast = s.isEnd = s.activeSlideIndex === s.slides.length - s.params.slidesPerView;
                s.onTransitionStart();
                var translateX = isH ? translate * inverter : 0, translateY = isH ? 0 : translate;
                if (speed === 0) {
                    s.wrapper
                        .transition(0)
                        .transform('translate3d(' + translateX + 'px,' + translateY + 'px,0)');
                    if (runCallbacks !== false) s.onTransitionEnd();
                }
                else {
                    s.animating = true;
                    s.wrapper
                        .transition(speed)
                        .transform('translate3d(' + translateX + 'px,' + translateY + 'px,0)')
                        .transitionEnd(function () {
                            if (runCallbacks !== false) s.onTransitionEnd();
                        });
                }
            };
            s.updateClasses = function () {
                s.slides.removeClass(s.params.slideActiveClass + ' ' + s.params.slideNextClass + ' ' + s.params.slidePrevClass);
                var activeSlide = s.slides.eq(s.activeSlideIndex);
                activeSlide.addClass(s.params.slideActiveClass);
                activeSlide.next().addClass(s.params.slideNextClass);
                activeSlide.prev().addClass(s.params.slidePrevClass);

                if (s.bullets && s.bullets.length > 0) {
                    s.bullets.removeClass(s.params.bulletActiveClass);
                    var activeBulletIndex = s.activeSlideIndex;
                    if (s.params.loop) {
                        activeBulletIndex = activeBulletIndex - s.loopedSlides;
                        if (activeBulletIndex < 0) activeBulletIndex = s.bullets.length + activeBulletIndex;
                        if (activeBulletIndex >= s.bullets.length) activeBulletIndex = activeBulletIndex - s.bullets.length;
                    }

                    s.bullets.eq(activeBulletIndex).addClass(s.params.bulletActiveClass);
                }
            };
            s.onTransitionStart = function () {
                s.updateClasses();
                if (s.activeSlideIndex !== s.previousSlideIndex) {
                    if (s.params.onSlideChangeStart) s.params.onSlideChangeStart(s);
                }
                if (s.params.onTransitionStart) s.params.onTransitionStart(s);
            };
            s.onTransitionEnd = function () {
                s.animating = false;
                s.wrapper.transition(0);
                if (s.activeSlideIndex !== s.previousSlideIndex) {
                    if (s.params.onSlideChangeEnd) s.params.onSlideChangeEnd(s);
                }
                if (s.params.onTransitionEnd) s.params.onTransitionEnd(s);
            };
            s.slideNext = function () {
                if (s.params.loop) {
                    if (s.animating) return;
                    s.fixLoop();
                    setTimeout(function () {
                        s.slideTo(s.activeSlideIndex + 1);
                    }, 0);
                }
                else s.slideTo(s.activeSlideIndex + 1);
            };
            s.slidePrev = function () {
                if (s.params.loop) {
                    if (s.animating) return;
                    s.fixLoop();
                    setTimeout(function () {
                        s.slideTo(s.activeSlideIndex - 1);
                    }, 0);
                }
                else s.slideTo(s.activeSlideIndex - 1);
            };
            s.slideReset = function () {
                s.slideTo(s.activeSlideIndex);
            };

            // Clicks
            s.onClickNext = function (e) {
                e.preventDefault();
                s.slideNext();
            };
            s.onClickPrev = function (e) {
                e.preventDefault();
                s.slidePrev();
            };
            s.onClickIndex = function (e) {
                e.preventDefault();
                s.slideTo($(this).index());
            };

            // Autoplay
            var autoplayTimeout;
            var autoplay;
            s.startAutoplay = function () {
                if (!s.params.autoplay) return;
                autoplay = true;
                if (autoplayTimeout) clearTimeout(autoplayTimeout);
                autoplayTimeout = setTimeout(function () {
                    s.wrapper.transitionEnd(function () {
                        s.startAutoplay();
                    });
                    if (s.params.loop) {
                        s.slideNext();
                    }
                    else {
                        var index = s.activeSlideIndex + 1;
                        if (index > s.slides.length - s.params.slidesPerView) index = 0;
                        s.slideTo(index);
                    }
                }, s.params.autoplay);
            };
            s.stopAutoplay = function () {
                autoplay = false;
                if (autoplayTimeout) clearTimeout(autoplayTimeout);
            };
            s.resetAutoplay = function () {
                s.stopAutoplay();
                s.startAutoplay();
            };

            // Create looped slides
            s.createLoop = function () {
                // Remove duplicated slides
                s.wrapper.children('.' + s.params.slideClass+'.slider-slide-duplicate').remove();

                var slides = s.wrapper.children('.' + s.params.slideClass);
                s.loopedSlides = parseInt(s.params.loopedSlides || s.params.slidesPerView, 10);
                if (s.loopedSlides > slides.length) {
                    s.loopedSlides = slides.length;
                    return;
                }
                var prependSlides = [], appendSlides = [], i;
                slides.each(function (index, el) {
                    var slide = $(this);
                    if (index < s.loopedSlides) appendSlides.push(el);
                    if (index < slides.length && index >= slides.length - s.loopedSlides) prependSlides.push(el);
                    slide.attr('data-slider-slide-index', index);
                });
                for (i = 0; i < appendSlides.length; i++) {
                    s.wrapper.append($(appendSlides[i].cloneNode(true)).addClass('slider-slide-duplicate'));
                }
                for (i = prependSlides.length - 1; i >= 0; i--) {
                    s.wrapper.prepend($(prependSlides[i].cloneNode(true)).addClass('slider-slide-duplicate'));
                }
            };
            s.fixLoop = function () {
                var newIndex;
                //Fix For Negative Oversliding
                if (s.activeSlideIndex < s.loopedSlides) {
                    newIndex = s.slides.length - s.loopedSlides * 3 + s.activeSlideIndex;
                    newIndex = newIndex + s.loopedSlides;
                    s.slideTo(newIndex, 0, false);
                }
                //Fix For Positive Oversliding
                else if (s.activeSlideIndex > s.slides.length - s.params.slidesPerView * 2) {
                    newIndex = -s.slides.length + s.activeSlideIndex + s.loopedSlides;
                    newIndex = newIndex + s.loopedSlides;
                    s.slideTo(newIndex, 0, false);
                }
            };

            // init
            s.init = function () {
                if (s.params.loop) s.createLoop();
                s.updateSlides();
                s.updatePagination();
                s.updateSize();
                if (s.params.loop) {
                    s.slideTo(s.params.initialSlide + s.loopedSlides, 0, false);
                }
                else if (s.params.initialSlide > 0) s.slideTo(s.params.initialSlide, 0, false);
                else s.updateClasses();
                s.attachEvents(s.params.sliderCloseTouchMove);
                if (s.params.autoplay) s.startAutoplay();
                if (typeof s.params.onInit === 'function') {
                    s.params.onInit();
                }
            };
            s.update = function () {
                if (s.params.loop) s.createLoop();
                s.updateSlides();
                s.updatePagination();
                s.updateSize();
                s.updateClasses();
            };

            // Destroy
            s.destroy = function () {
                s.detachEvents();
                if (s.params.onDestroy) s.params.onDestroy();
                s = undefined;
            };

            s.init();

            return s;
        };
        app.slider = function (container, params) {
            return new Slider(container, params);
        };
        app.initSlider = function (pageContainer) {
            var page = $(pageContainer);
            var sliders = page.find('.slider-init');
            if (sliders.length === 0) return;
            function destroySliderOnRemove(slider) {
                function destroySlider() {
                    slider.destroy();
                    page.off('pageBeforeRemove', destroySlider);
                }
                page.on('pageBeforeRemove', destroySlider);
            }
            for (var i = 0; i < sliders.length; i++) {
                var slider = sliders.eq(i);
                var params;
                if (slider.data('slider')) {
                    params = JSON.parse(slider.data('slider'));
                }
                else {
                    params = {
                        initialSlide: parseInt(slider.data('initialSlide'), 10) || undefined,
                        spaceBetween: parseInt(slider.data('spaceBetween'), 10) || undefined,
                        speed: parseInt(slider.data('speed'), 10) || undefined,
                        slidesPerView: parseInt(slider.data('slidesPerView'), 10) || undefined,
                        direction: slider.data('direction'),
                        pagination: slider.data('pagination'),
                        paginationHide: slider.data('paginationHide') && (slider.data('paginationHide') === 'true' ? true : false),
                        loop: slider.data('loop') && (slider.data('loop') === 'true' ? true : false),
                        onlyExternal: slider.data('onlyExternal') && (slider.data('onlyExternal') === 'true' ? true : false),
                        slideClass: slider.data('slideClass'),
                        slideActiveClass: slider.data('slideActiveClass'),
                        slideNextClass: slider.data('slideNextClass'),
                        slidePrevClass: slider.data('slidePrevClass'),
                        wrapperClass: slider.data('wrapperClass'),
                        bulletClass: slider.data('bulletClass'),
                        bulletActiveClass: slider.data('bulletActiveClass'),
                        nextButton: slider.data('nextButton'),
                        prevButton: slider.data('prevButton'),
                        indexButton: slider.data('indexButton'),
                        autoplay: slider.data('autoplay')
                    };
                }
                var _slider = app.slider(slider[0], params);
                destroySliderOnRemove(_slider);
            }
        };
        app.reinitSlider = function (pageContainer) {
            var page = $(pageContainer);
            var sliders = page.find('.slider-init');
            if (sliders.length === 0) return;
            for (var i = 0; i < sliders.length; i++) {
                var sliderInstance = sliders[0].QSlider;
                if (sliderInstance) {
                    sliderInstance.onResize();
                }
            }
        };
        /*=================================================================
        *******************   延迟加载    ********************************
        *******************               ********************************
        =================================================================*/
        app.initImagesLazyLoad = function (pageContainer) {
            pageContainer = $(pageContainer);

            // 正常的延迟加载
            var lazyLoadImages;
            if (pageContainer.hasClass('lazy')) {
                lazyLoadImages = pageContainer;
                pageContainer = lazyLoadImages.parents('.page');
            }
            else {
                lazyLoadImages = pageContainer.find('.lazy');
            }
            // if (lazyLoadImages.length === 0) return;

            // 可滚动页面内容
            var pageContent;
            if (pageContainer.hasClass('page-content'))  {
                pageContent = pageContainer;
                pageContainer = pageContainer.parents('.page');
            }
            else  {
                pageContent = pageContainer.find('.page-content');
            }
            if (pageContent.length === 0) return;

            // 图片加载
            var imagesSequence = [];
            var imageIsLoading = false;
            function loadImage(el) {
                el = $(el);

                var bg = el.attr('data-background');
                var src = bg ? bg : el.attr('data-src');
                if (!src) return;

                function onLoad() {
                    el.removeClass('lazy').addClass('lazy-loaded');
                    if (bg) {
                        el.css('background-image', 'url(' + src + ')');
                    }
                    else {
                        el.attr('src', src);
                    }

                    if (app.params.imagesLazyLoadSequential) {
                        imageIsLoading = false;
                        if (imagesSequence.length > 0) {
                            loadImage(imagesSequence.shift());
                        }
                    }
                }

                if (!app.params.imagesLazyLoadSequential) {
                    onLoad();
                    return;
                }

                if (imageIsLoading) {
                    if (imagesSequence.indexOf(el[0]) < 0) imagesSequence.push(el[0]);
                    return;
                }

                // Loading flag
                imageIsLoading = true;

                var image = new Image();
                image.onload = onLoad;
                image.onerror = onLoad;
                image.src =src;
            }
            function lazyHandler() {
                lazyLoadImages = pageContainer.find('.lazy');
                lazyLoadImages.each(function(index, el) {
                    el = $(el);
                    if (isElementInViewport(el[0])) {
                        loadImage(el);
                    }
                });
            }

            function isElementInViewport (el) {
                var rect = el.getBoundingClientRect();
                var threshold = app.params.imagesLazyLoadThreshold || 0;
                return (
                    rect.top >= (0 - threshold) &&
                    rect.left >= (0 - threshold) &&
                    rect.top <= (window.innerHeight + threshold) &&
                    rect.left <= (window.innerWidth + threshold)
                );
            }

            function attachEvents(destroy) {
                var method = destroy ? 'off' : 'on';
                lazyLoadImages[method]('lazy', lazyHandler);
                pageContent[method]('lazy', lazyHandler);
                pageContent[method]('scroll', lazyHandler);
                // $(window)[method]('resize', lazyHandler);
            }
            function detachEvents() {
                attachEvents(true);
            }

            pageContainer[0].DestroyImagesLazyLoad = detachEvents;

            // 注册事件
            attachEvents();

            // 页面加载的时候运行
            lazyHandler();

        };
        app.destroyImagesLazyLoad = function (pageContainer) {
            pageContainer = $(pageContainer);
            if (pageContainer.length > 0 && pageContainer[0].DestroyImagesLazyLoad) {
                pageContainer[0].DestroyImagesLazyLoad();
            }
        };
        app.reinitImagesLazyLoad = function (pageContainer) {
            pageContainer = $(pageContainer);
            if (pageContainer.length > 0) {
                pageContainer.trigger('lazy');
            }
        };
        /*=======================================================================
        *****************************  图片预加载  *****************************
        =======================================================================*/
        app.preLoader = function(res, params) {
            if(!res){
              return ;
            }
            var defaults = {
                'onLoading' : function(){},
                'onComplete' : function(){},
                'loadType' : 0, //0为并行加载  1为串行加载
                'minTime' : 0, //单个资源加载所需的最小时间数（毫秒）
                'dataAttr' : 'preload'
            };
            params = params || {};
            for (var def in defaults) {
                if (typeof params[def] === 'undefined') {
                    params[def] = defaults[def];
                }
            }
            var _self = this;
            if(typeof params == 'function'){
                var tempFunc = params;
                params = {
                    'onComplete' : tempFunc
                }
            }

            res = [].concat(res);

            var resourceCache = {}

            //获取页面上配置了预加载的节点
            var resDom = Array.prototype.slice.call(document.querySelectorAll('[data-'+params.dataAttr+']'));
            $(resDom).each(function(index, el){
                var _el = $(el);
                var attr = _el.attr('data-'+params.dataAttr);
                if(resourceCache[attr]){
                    resourceCache[attr].push(el);
                }else{
                    resourceCache[attr] = [el];
                    res.indexOf(attr) < 0 && res.push(attr)
                }
            })

            var len = res.length, loaded = 0;
            var sTime = new Date().getTime();
            var replaceSrc = function(src){
                if(resourceCache[src]){ //是从节点上提取到的预加载数据
                    $.each(resourceCache[src], function(index, dom){
                        dom.removeAttribute('data-'+params.dataAttr);
                        var tagName = dom.tagName.toLowerCase();
                        switch(tagName){
                            case 'img':
                                dom.src = src;
                                break;
                            default:
                                dom.style.backgroundImage = 'url('+src+')';
                        }
                    })
                }
            }
            var load = function(src, node, durTime, realCompleteBack){
                var loadedFunc = function(){
                    params.onLoading(++loaded, len, src, node);
                    replaceSrc(src);
                    realCompleteBack([loaded, len, src, node]);
                    if(loaded == len){ //加载完成
                        var times = new Date().getTime() - sTime;
                        params.onComplete(times);
                    }
                }
                var timeDiff = params.minTime - durTime;
                timeDiff > 0 ? setTimeout(loadedFunc, timeDiff) : loadedFunc();
            }
            if(res.length){
                var loadOne = function(item, resLoadBack, realCompleteBack){
                    var realCompleteBack = realCompleteBack || function(){};
                    var callFunc = function(src, fn){
                        var img = new Image(), sTime = new Date();
                        img.onload = img.onerror = function(){ //加载错误也认为是加载完成
                            fn(src, img, new Date()-sTime);
                            img.onload = null;
                        }
                        img.src = src;
                    }
                    callFunc(item, function(){
                        var args = Array.prototype.slice.call(arguments,0)
                        args.push(realCompleteBack);
                        resLoadBack.apply(null, args)
                    });
                }
                if(params.loadType == 1){//串行加载
                    var i = 0;
                    (function(){
                        var caller = arguments.callee;
                        loadOne(res[i], function(){
                            load.apply(null, arguments);
                        }, function(){
                            i++;
                            res[i] && caller();
                        })
                    })()
                }else{ //并行加载
                    $.each(res, function(index, item){
                        loadOne(item, load)
                    });
                }
            }else{
                params.onComplete(0);

            }
        }
        /*===============================================================================
        ************   引入 Fast Clicks 插件解决移动端点透问题   ************
        ************   插件来自: https://github.com/ftlabs/fastclick   ************
        ===============================================================================*/
        app.initFastClicks = function () {
            if (app.params.activeState) {
                $('html').addClass('watch-active-state');
            }

            var touchStartX, touchStartY, touchStartTime, targetElement, trackClick, activeSelection, scrollParent, lastClickTime, isMoved;
            var activableElement, activeTimeout, activeNewTimeout, needsFastClick;

            function findActivableElement(e) {
                var target = $(e.target);
                var parents = target.parents(app.params.activeStateElements);

                return (parents.length > 0) ? parents : target;
            }
            function isInsideScrollableView() {
                var pageContent = activableElement.parents('.page-wrap');

                if (pageContent.length === 0) {
                    return false;
                }

                // This event handler covers the "tap to stop scrolling".
                if (pageContent.prop('scrollHandlerSet') !== 'yes') {
                    pageContent.on('scroll', function() {
                      clearTimeout(activeTimeout);
                      clearTimeout(activeNewTimeout);
                    });
                    pageContent.prop('scrollHandlerSet', 'yes');
                }

                return true;
            }
            function addActive() {
                activableElement.addClass('active-state');
            }
            function removeActive(el) {
                activableElement.removeClass('active-state');
            }
            function addActiveNew() {
                activableElement.hasClass('active-point')?activableElement.addClass('active-state'):activableElement.parents('.active-point').addClass('active-state');
            }
            function removeActiveNew(el) {
                activableElement.hasClass('active-point')?activableElement.removeClass('active-state'):activableElement.parents('.active-point').removeClass('active-state');
            }
            function androidNeedsBlur(el) {
                var noBlur = ('button checkbox file image radio submit input textarea').split(' ');
                if (document.activeElement && el !== document.activeElement && document.activeElement !== document.body) {
                    if (noBlur.indexOf(el.nodeName.toLowerCase()) >= 0) {
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                else {
                    return false;
                }
            }
            function targetNeedsFastClick(el) {
                var $el = $(el);
                if (el.nodeName.toLowerCase() === 'input' && el.type === 'file') return false;
                if ($el.hasClass('no-fastclick') || $el.parents('.no-fastclick').length > 0) return false;
                return true;
            }
            function targetNeedsFocus(el) {
                if (document.activeElement === el) {
                    return false;
                }
                var tag = el.nodeName.toLowerCase();
                var skipInputs = ('button checkbox file image radio submit').split(' ');
                if (el.disabled || el.readOnly) return false;
                if (tag === 'textarea') return true;
                if (tag === 'select') {
                    if (app.device.os === 'android') return false;
                    else return true;
                }
                if (tag === 'input' && skipInputs.indexOf(el.type) < 0) return true;
            }
            function targetNeedsPrevent(el) {
                el = $(el);
                if (el.is('label') || el.parents('label').length > 0) {
                    if (app.device.os === 'android') {
                        var osv = app.device.osVersion.split('.');
                        if (osv[0] * 1 > 4 || (osv[0] * 1 === 4 && osv[1] * 1 >= 4)) {
                            return false;
                        }
                        else return true;
                    }
                    else return false;
                }
                return true;
            }

            // Mouse Handlers
            function handleMouseDown (e) {
                findActivableElement(e).addClass('active-state');
                if ('which' in e && e.which === 3) {
                    setTimeout(function () {
                        $('.active-state').removeClass('active-state');
                    }, 0);
                }
            }
            function handleMouseMove (e) {
                $('.active-state').removeClass('active-state');
            }
            function handleMouseUp (e) {
                $('.active-state').removeClass('active-state');
            }

            // Touch Handlers
            function handleTouchStart(e) {
                isMoved = false;
                if (e.targetTouches.length > 1) {
                    return true;
                }
                needsFastClick = targetNeedsFastClick(e.target);

                if (!needsFastClick) {
                    trackClick = false;
                    return true;
                }
                if (app.device.os === 'ios') {
                    var selection = window.getSelection();
                    if (selection.rangeCount && selection.focusNode !== document.body && (!selection.isCollapsed || document.activeElement === selection.focusNode)) {
                        activeSelection = true;
                        return true;
                    }
                    else {
                        activeSelection = false;
                    }
                }
                if (app.device.os === 'android')  {
                    if (androidNeedsBlur(e.target)) {
                        document.activeElement.blur();
                    }
                }

                trackClick = true;
                targetElement = e.target;
                touchStartTime = (new Date()).getTime();
                touchStartX = e.targetTouches[0].pageX;
                touchStartY = e.targetTouches[0].pageY;

                // Detect scroll parent
                if (app.device.os === 'ios') {
                    scrollParent = undefined;
                    $(targetElement).parents().each(function () {
                        var parent = this;
                        if (parent.scrollHeight > parent.offsetHeight && !scrollParent) {
                            scrollParent = parent;
                            scrollParent.QScrollTop = scrollParent.scrollTop;
                        }
                    });
                }
                if ((e.timeStamp - lastClickTime) < 200) {
                    e.preventDefault();
                }
                if (app.params.activeState) {
                    activableElement = findActivableElement(e);
                    // If it's inside a scrollable view, we don't trigger active-state yet,
                    // because it can be a scroll instead. Based on the link:
                    // http://labnote.beedesk.com/click-scroll-and-pseudo-active-on-mobile-webk
                    if (!isInsideScrollableView(e)) {
                        addActive();
                        addActiveNew();
                    } else {
                        activeTimeout = setTimeout(addActive, 80);
                        activeNewTimeout = setTimeout(addActiveNew, 80);
                    }
                }
            }
            function handleTouchMove(e) {
                if (!trackClick) return;
                var _isMoved = false;
                var distance = app.params.fastClicksDistanceThreshold;
                if (distance) {
                    var pageX = e.targetTouches[0].pageX;
                    var pageY = e.targetTouches[0].pageY;
                    if (Math.abs(pageX - touchStartX) > distance ||  Math.abs(pageY - touchStartY) > distance) {
                        _isMoved = true;
                    }
                }
                else {
                    _isMoved = true;
                }
                if (_isMoved) {
                    trackClick = false;
                    targetElement = null;
                    isMoved = true;
                }

                if (app.params.activeState) {
                    clearTimeout(activeTimeout);
                    clearTimeout(activeNewTimeout);
                    removeActive();
                    removeActiveNew();
                }
            }
            function handleTouchEnd(e) {
                clearTimeout(activeTimeout);
                clearTimeout(activeNewTimeout);

                if (!trackClick) {
                    if (!activeSelection && needsFastClick) e.preventDefault();
                    return true;
                }

                if (document.activeElement === e.target) {
                    return true;
                }

                if (!activeSelection) {
                    e.preventDefault();
                }

                if ((e.timeStamp - lastClickTime) < 200) {
                    return true;
                }

                lastClickTime = e.timeStamp;

                trackClick = false;

                if (app.device.os === 'ios' && scrollParent) {
                    if (scrollParent.scrollTop !== scrollParent.QScrollTop) {
                        return false;
                    }
                }

                // Add active-state here because, in a very fast tap, the timeout didn't
                // have the chance to execute. Removing active-state in a timeout gives
                // the chance to the animation execute.
                if (app.params.activeState) {
                    addActive();
                    setTimeout(removeActive, 0);
                    setTimeout(removeActiveNew, 0);
                }

                // Trigger focus when required
                if (targetNeedsFocus(targetElement)) {
                    targetElement.focus();
                }

                e.preventDefault();
                var touch = e.changedTouches[0];
                var evt = document.createEvent('MouseEvents');
                var eventType = 'click';
                if (app.device.os === 'android' && targetElement.nodeName.toLowerCase() === 'select') {
                    eventType = 'mousedown';
                }
                evt.initMouseEvent(eventType, true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
                evt.forwardedTouchEvent = true;
                targetElement.dispatchEvent(evt);

                return false;
            }
            function handleTouchCancel(e) {
                trackClick = false;
                targetElement = null;
            }

            function handleClick(e) {
                var allowClick = false;

                if (trackClick) {
                    targetElement = null;
                    trackClick = false;
                    return true;
                }

                if (e.target.type === 'submit' && e.detail === 0) {
                    return true;
                }

                if (!targetElement) {
                    allowClick =  true;
                }
                if (document.activeElement === targetElement) {
                    allowClick =  true;
                }
                if (e.forwardedTouchEvent) {
                    allowClick =  true;
                }
                if (!e.cancelable) {
                    allowClick =  true;
                }

                if (!allowClick) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    if (targetElement) {
                        if (targetNeedsPrevent(targetElement) || isMoved) {
                            e.preventDefault();
                        }
                    }
                    else {
                        e.preventDefault();
                    }
                    targetElement = null;
                }

                return allowClick;
            }
            if (app.support.touch) {
                document.addEventListener('click', handleClick, true);

                document.addEventListener('touchstart', handleTouchStart);
                document.addEventListener('touchmove', handleTouchMove);
                document.addEventListener('touchend', handleTouchEnd);
                document.addEventListener('touchcancel', handleTouchCancel);
            }
            else {
                if (app.params.activeState) {
                    document.addEventListener('mousedown', handleMouseDown);
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                }
            }

        };

        /*===========================================================
        ************   处理点击事件，确保Tap的点击速度   ************
        ************   预绑定一些点击事件，省去JS书写    ************
        ============================================================*/
        app.initClickEvents = function () {
            function handleClicks(e) {

                var clicked = $(this);
                var url = clicked.attr('href');
                var isLink = clicked[0].nodeName.toLowerCase() === 'a';
                // if (isLink) {
                //     // External
                //     if (clicked.hasClass('external')) {
                //         return;
                //     }
                //     else {
                //         e.preventDefault();
                //     }
                // }

                // Tabs
                var isTabLink;
                if (clicked.hasClass('tab-link')) {
                    isTabLink = true;
                    app.showTab(clicked.attr('data-tab') || clicked.attr('href'), clicked);
                }
            }

            // 页面一加载就绑定的点击事件
            $(document).on('click', 'a, .page-wrap, .tab-link', handleClicks);
        };

        // 需要初始化插件和方法
        app.init = function () {

            // 初始化点击事件
            if (app.initFastClicks && app.params.fastClicks) app.initFastClicks();
            if (app.initClickEvents) app.initClickEvents();
            // 初始化无限滚动
            if (app.initInfiniteScroll) app.initInfiniteScroll('.page-wrap');
            // 初始化滑动组件
            if (app.initSlider) app.initSlider('.page-wrap');
            // 初始化拉动更新
            if (app.initPullToRefresh) app.initPullToRefresh('.page-wrap');
            // 初始化简易瀑布流
            if (app.initWaterFallScroll) app.initWaterFallScroll('.page-wrap');
            // 初始化简易瀑布流
            if (app.initImagesLazyLoad) app.initImagesLazyLoad('.page-wrap');

        };
        // 执行初始化方法
        if (app.params.init) app.init();

        // 返回实例
        return app;
    };

    
    // QingApp 的原型扩展
    /*===================================
    ************  功能检测   ************
    =====================================*/
    QingApp.prototype.support = (function () {
        var support = {
            touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)
        };

        // 输出对象
        return support;
    })();

        
    /*===================================
    **********  设备/系统检测  **********
    =====================================*/
    QingApp.prototype.device = (function () {
        var device = {};
        var ua = navigator.userAgent;

        var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

        device.ios = device.android = device.iphone = device.ipad = false;

        // Android
        if (android) {
            device.os = 'android';
            device.osVersion = android[2];
            device.android = true;
        }
        if (ipad || iphone || ipod) {
            device.os = 'ios';
            device.ios = true;
        }
        // iOS
        if (iphone && !ipod) {
            device.osVersion = iphone[2].replace(/_/g, '.');
            device.iphone = true;
        }
        if (ipad) {
            device.osVersion = ipad[2].replace(/_/g, '.');
            device.ipad = true;
        }
        if (ipod) {
            device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
            device.iphone = true;
        }
        // iOS 8+ changed UA
        if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
            if (device.osVersion.split('.')[0] === '10') {
                device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
            }
        }

        // Webview
        device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);

        // 最小的用户界面
        if (device.os && device.os === 'ios') {
            var osVersionArr = device.osVersion.split('.');
            device.minimalUi = !device.webView &&
                                (ipod || iphone) &&
                                (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7) &&
                                $('meta[name="viewport"]').length > 0 && $('meta[name="viewport"]').attr('content').indexOf('minimal-ui') >= 0;
        }

        // Classes
        var classNames = [];

        // 像素比
        device.pixelRatio = window.devicePixelRatio || 1;
        if (device.pixelRatio >= 2) {
            classNames.push('retina');
        }

        // 添加系统的classes
        if (device.os) {
            classNames.push(device.os, device.os + '-' + device.osVersion.split('.')[0], device.os + '-' + device.osVersion.replace(/\./g, '-'));
            if (device.os === 'ios') {
                var major = parseInt(device.osVersion.split('.')[0], 10);
                for (var i = major - 1; i >= 6; i--) {
                    classNames.push('ios-gt-' + i);
                }
            }

        }

        // 把classes添加到html
        if (classNames.length > 0) $('html').addClass(classNames.join(' '));

        return device;
    })();

})();

// 扩展ZeptoJs的一些方法，主要是一些常用方法和CSS3动画，来自JQuery等插件
;(function($) {
    $.fn.outerWidth = function (margins) {
        if (this.length > 0) {
            if (margins)
                return this[0].offsetWidth + parseFloat(this.css('margin-right')) + parseFloat(this.css('margin-left'));
            else
                return this[0].offsetWidth;
        }
        else return null;
    }
    $.fn.outerHeight = function (margins) {
        if (this.length > 0) {
            if (margins)
                return this[0].offsetHeight + parseFloat(this.css('margin-top')) + parseFloat(this.css('margin-bottom'));
            else
                return this[0].offsetHeight;
        }
        else return null;
    };
    $.fn.transform = function (transform) {
        for (var i = 0; i < this.length; i++) {
            var elStyle = this[i].style;
            elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
        }
        return this;
    };
    $.fn.transition = function (duration) {
        if (typeof duration !== 'string') {
            duration = duration + 'ms';
        }
        for (var i = 0; i < this.length; i++) {
            var elStyle = this[i].style;
            elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
        }
        return this;
    };
    $.fn.transitionEnd = function (callback) {
        var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
            i, j, dom = this;
        function fireCallBack(e) {
            /*jshint validthis:true */
            callback.call(this, e);
            for (i = 0; i < events.length; i++) {
                dom.off(events[i], fireCallBack);
            }
        }
        if (callback) {
            for (i = 0; i < events.length; i++) {
                dom.on(events[i], fireCallBack);
            }
        }
        return this;
    };
    // 获取CSS3 Transform 的平移值
    $.getTranslate = function (el, axis) {
        var matrix, curTransform, curStyle, transformMatrix;

        // automatic axis detection
        if (typeof axis === 'undefined') {
            axis = 'x';
        }

        curStyle = window.getComputedStyle(el, null);
        if (window.WebKitCSSMatrix) {
            // Some old versions of Webkit choke when 'none' is passed; pass
            // empty string instead in this case
            transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
        }
        else {
            transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
            matrix = transformMatrix.toString().split(',');
        }

        if (axis === 'x') {
            //Latest Chrome and webkits Fix
            if (window.WebKitCSSMatrix)
                curTransform = transformMatrix.m41;
            //Crazy IE10 Matrix
            else if (matrix.length === 16)
                curTransform = parseFloat(matrix[12]);
            //Normal Browsers
            else
                curTransform = parseFloat(matrix[4]);
        }
        if (axis === 'y') {
            //Latest Chrome and webkits Fix
            if (window.WebKitCSSMatrix)
                curTransform = transformMatrix.m42;
            //Crazy IE10 Matrix
            else if (matrix.length === 16)
                curTransform = parseFloat(matrix[13]);
            //Normal Browsers
            else
                curTransform = parseFloat(matrix[5]);
        }

        return curTransform || 0;
    };

})(Zepto);

var TAPP = new QingApp(); // 实例化UI组件

