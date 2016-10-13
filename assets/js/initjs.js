/*
 * 依赖ZeptoJs
*/

$(function () {
    'use strict';

    /*===========================
        TJH init js
    ===========================*/

    //首页banner滚动
    $(".content-banner > .swiper-container").swiper({
        loop: true,
        autoplay: 3000,
        autoplayDisableOnInteraction: false
    });

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
            var phoneHtml = "<a class='phone-box' href='tel:0592-57156278'>"
                                        + "<span class='phone-icon'><i class='icon icon-phone'></i></span>"
                                        + "<span class='phone-type'>客服电话</span>"
                                        + "<span class='phone-num'>0592-57156278</span>"
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

    // 层折叠
    $(document).on("pageInit", ".page", function(e, id, page) {
        $(this).on('click', '.div-collapse-operation', function(){
            if($(this).prev().hasClass("div-collapse")){
                $(this).prev().removeClass("div-collapse");
                if($(this).hasClass("tip-info-text")){
                    var modalMark = "<div class='modal-overlay modal-overlay-visible'></div>";
                    $(page).append(modalMark);
                    $(".bar-footer").css("z-index", "10601");
                }
            }
            else{
                $(this).prev().addClass("div-collapse");
                if($(this).hasClass("tip-info-text")){
                    $(".modal-overlay").remove();
                    $(".bar-footer").removeAttr("style");
                }
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
        var node = ".input-operation";
        $(this).on('change', node, function(){
            if(!$(this).val() != ""){
                $(this).next().show();
            }
            else{
                $(this).next().hide();
            }
        });
        $(this).on("blur", node, function(){
            $(this).next().hide();
        });
    });

    $.init();
});

