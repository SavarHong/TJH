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

    //操作表
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
                $(this).children().attr("class", "icon icon-arrow-top");
            }
            else{
                $(this).prev().addClass("div-collapse");
                $(this).children().attr("class", "icon icon-arrow-bottom");
            }
        });
    });

    // 点击激活
    $(document).on("pageInit", ".page", function(e, id, page) {
        var node = $.tjhConfig.clickStatusActive;
        $(this).on('click', node, function(){
            if(!$(this).hasClass("status-active")){
                $(this).addClass("status-active");
            }
            else{
                $(this).removeClass("status-active");
            }
        });
    });

    $.init();
});

