/*
 * 依赖ZeptoJs
 * 组件是：页面浮动菜单
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
    $.init();
});

