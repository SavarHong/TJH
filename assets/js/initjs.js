 /*
 * 依赖ZeptoJs
*/

$(function () {
    'use strict';

    /*===========================
        TJH init js
    ===========================*/

    //页面浮动菜单
    $(document).on("pageInit", ".page", function(e, id, page){
        var mark = "<div class='page-mark'></div>";
        $(".page-nav").on("click", ".menu", function(){
            if($(".page-mark").length == 0){
                $(".page").append(mark);
            }
            if(!$(this).closest("ul").hasClass("active")){
                $(this).closest("ul").addClass("active");
            }
            else{
                $(this).closest("ul").removeClass("active");
                $(".page-mark").remove();
            }
        });
        $(".page").on("click", ".page-mark", function(){
            $(this).remove();
            $(".page-nav").find("ul").removeClass("active");
        });
    });

    //客服电话弹窗
    $(document).on("pageInit", ".page", function(e, id, page) {
        $(this).on('click', '.actions-phone', function () {
            var phoneNum = $(this).attr("data-phone");
            var phoneHtml = "<a class='phone-box' href='tel:"
                                            + phoneNum
                                        +"'>"
                                        + "<span class='phone-icon'><i class='icon icon-phone'></i></span>"
                                        + "<span class='phone-type'>客服电话</span>"
                                        + "<span class='phone-num'>"
                                            + phoneNum
                                        + "</span>"
                                    + "</a>";
            var buttons = [
                {
                    text: phoneHtml,
                    extend: 'list-item'
                },
                {
                    text: '关闭'
                }
            ];
            var groups = [buttons];
            $.actions(groups);
        });
    });

    //分享弹窗
    $(document).on("pageInit", ".page", function(e, id, page) {
        $(this).on('click', '.actions-share', function () {
            var shareHtml = "<div class='share-box'>"
                                        + "<a class='qq'>"
                                            + "<i class='icon icon-blue icon-qq'></i>"
                                            + "<p>QQ</p>"
                                        + "</a>"
                                        + "<a class='weixin'>"
                                            + "<i class='icon icon-green-dark icon-weixin'></i>"
                                            + "<p>微信</p>"
                                        + "</a>"
                                        + "<a class='weibo'>"
                                            + "<i class='icon icon-pink-light icon-weibo'></i>"
                                            + "<p>微博</p>"
                                        + "</a>"
                                        + "<a class='sms'>"
                                            + "<i class='icon icon-green icon-sms'></i>"
                                            + "<p>信息</p>"
                                        + "</a>"
                                    + "</div>";
            var buttons = [
                {
                    text: shareHtml,
                    extend: 'list-item'
                },
                {
                    text: '关闭'
                }
            ];
            var groups = [buttons];
            $.actions(groups);
        });
    });

    // 层折叠
    $(document).on("pageInit", ".page", function(e, id, page) {
        $(this).on('click', '.div-collapse-operation', function(){
            if($(this).prev().hasClass("div-collapse")){
                $(this).prev().removeClass("div-collapse");
                if($(this).hasClass("mark-show")){
                    var modalMark = "<div class='modal-overlay modal-overlay-visible'></div>";
                    $(page).append(modalMark);
                    if($(this).hasClass("filter-info-text")){
                        $(".bar-nav").css("z-index", "10601");
                    }
                    if($(this).hasClass("tip-info-text")){
                        $(".bar-footer").css("z-index", "10601");
                    }
                }
            }
            else{
                $(this).prev().addClass("div-collapse");
                if($(this).hasClass("mark-show")){
                    $(".modal-overlay").remove();
                    $(".bar-footer").removeAttr("style");
                }
            }
            if($(this).next().hasClass("div-collapse")){
                $(this).next().removeClass("div-collapse");
            }
            else{
                $(this).next().addClass("div-collapse");
            }
            if($(this).find(".icon").hasClass("icon-arrow-bottom")){
                $(this).find(".icon").attr("class", "icon icon-arrow-top");
            }
            else{
                $(this).find(".icon").attr("class", "icon icon-arrow-bottom");
            }
        });
    });

    // 点击激活
    $(document).on("pageInit", ".page", function(e, id, page) {
        var node = $.tjhConfig.clickStatusActive;
        var radioType = $.tjhConfig.radioType;
        $(this).on('click', node, function(){
            if(!$(this).hasClass("status-active")){
                $(this).addClass("status-active");
            }
            else{
                $(this).removeClass("status-active");
            }
        });
        $(this).on('click', radioType, function(){
            $(this).closest(".btn-radio-group").find(radioType).removeClass("status-active");
            $(this).addClass("status-active");
        });
    });

    // 预定页预定按钮激活
    $(document).on("pageInit", "#page-reserve", function(e, id, page) {
        var reserve = $(".reserve-info");
        var reserveInput = reserve.find(".type-info-input").children("input");
        var reserveLength = reserveInput.length;
        reserve.on("change", "input", function(){
            if(reserve.find(".type-info-input").children("input[type='text']").val() != "" && reserve.find(".type-info-input").children("input[type='number']").val() != ""){
                $(page).find(".footer-tip").removeClass("disabled");
            }
            else{
                $(page).find(".footer-tip").addClass("disabled");
            }
        });
    });

    // 打开日历，其他input失焦
    $(document).on("pageInit", ".page", function(e, id, page) {
        $(this).on("click", "input[data-toggle='date']", function(){
            $("input").blur();
        });
    });

    // 找方案条件过滤重置
    $(document).on("pageInit", ".page", function(e, id, page) {
        var radioType = $.tjhConfig.radioType;
        $(this).on("click", ".bar-nav #btn-reset", function(){
            $(".content-type-filter").each(function(){
                $(this).children().find(radioType).removeClass("status-active");
                $(this).children().first().find(radioType).addClass("status-active");
            });
        });
    });

    // 输入框显示清空按钮
    $(document).on("pageInit", ".page", function(e, id, page) {
        $(this).on("keyup", ".input-operation", function(){
            if($(this).val() != ""){
                $(this).next().show();
            }
            else{
                $(this).next().hide();
            }
        });
        $(this).on("click", "[data-operation-reset]", function(){
            $(this).prev().val("");
            $(this).hide();
        });
    });

    $(document).on("pageInit", function() {
        //时间选择器
        $("[data-toggle='datetime']").datetimePicker({
          toolbarTemplate: '<header class="picker-modal-header">\
          <button class="header-link pull-left cancel-picker">取消</button>\
          <button class="header-link pull-right close-picker">确定</button>\
          <h5 class="title">选择活动时间</h5>\
          </header>'
        });
        // 选项卡跳转
        if($("[data-tab]").length > 0){
            var hash = window.location.hash;
            if(hash != ""){
                $("[data-tab]").find("a").removeClass("active");
                $("[data-tab]").find("a[href='" + hash + "']").addClass("active");
                $(hash).siblings().removeClass("active");
                $(hash).addClass("active");
                $.initWaterFallScroll();
            }

        }
    });

    $.init();
});

