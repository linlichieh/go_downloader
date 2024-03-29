$(document).ready(function(){
    var ws = {};
    $("#shutdown").click(function(){
        $.ajax({
            url: '/',
            type: "POST",
            data: {shutdown: 1}
        })
        location.reload();
    })
    $(".url-play-container").click(function(){
        num = $(this).data("num");
        if ($("#ffmpeg-path").val() != "") {
            $.ajax({
                url: '/playVideo/',
                type: "POST",
                data: {FFmpegPath: $("#ffmpeg-path").val(), FilePath: $(this).attr("data-filepath")},
                Success: function(response) {
                    var res = JSON.parse(response);
                    if (res["Status"] == "fail") {
                        alert(res["Msg"]);
                    }
                }
            })
        } else {
            alert("請選擇 ffmpeg 播放器路徑");
            $("#ffmpeg-path").focus();
        }
    })
    $(".url-download-container").click(function() {
        num = $(this).data("num");
        var data = {
            "Target" : "#url-" + num ,
            "Url"    : $("#url-" + num).val()
        };

        if (typeof ws[num] === "undefined") {
            ws[num] = new WebSocket("ws://" + window.location.host + "/download/");
            connect_websocket(ws[num]);
        }
        $(this).addClass("hide");
        $("#url-" + num + "-wait-container").removeClass("hide");
        set_list_item_warning($("#url-" + num + "-list-group-item"))

        // 0->connecting  1->open 2->closing 3->closed
        setTimeout(function(){
            if (ws[num].readyState === 1) {
                ws[num].send(JSON.stringify(data))
            } else {
                alert("Can't connect.");
            }
        }, 300);
    })
})

function set_list_item_success($this) {
    $this.removeClass("list-group-item-warning");
    $this.addClass("list-group-item-success");
}

function set_list_item_warning($this) {
    if ($this.hasClass("list-group-item-info")) {
        $this.removeClass("list-group-item-info");
        $this.addClass("list-group-item-warning");
    }
    if ($this.hasClass("list-group-item-danger")) {
        $this.removeClass("list-group-item-danger");
        $this.addClass("list-group-item-warning");
    }
}

function set_list_item_error($this) {
    $this.removeClass("list-group-item-warning");
    $this.addClass("list-group-item-danger");
}

function connect_websocket(ws) {
    // First connect
    ws.onopen = function() {
        console.log("[onopen] connect ws uri.");
    }

    // Sending from server
    ws.onmessage = function(e) {
        var target
        var res = JSON.parse(e.data);
        if (res["PartNum"] == 0) {  // single download
            target = res["Target"];
        } else {                    // multi download
            target = res["Target"] + "-" + res["PartNum"];
        }
        console.log(target + " -> " + res["Progress"]);
        if (res["Status"] == "ok") {
            setTimeout(function(){
                $(res["Target"] + "-download-container").addClass("hide");
                $(res["Target"] + "-" + res["SingleOrMulti"]  + "-progress-container").addClass("hide");
                $(res["Target"] + "-status-ok").removeClass("hide");
                $(res["Target"] + "-status-fail").addClass("hide");
                $(res["Target"] + "-wait-container").addClass("hide");
                $(res["Target"] + "-play-container").removeClass("hide");
                $(res["Target"]).attr("disabled", "disabled");
                set_list_item_success($(res["Target"] + "-list-group-item"));
                if ($(res["Target"] + "-play-container").data("filepath") != "undefined") {
                    $(res["Target"] + "-play-container").attr("data-filepath", res["FilePath"]);
                }
                console.log(res["Msg"])
            }, 1000);
        } else if (res["Status"] == "keep") {
            if ($(res["Target"] + "-play-container").hasClass("hide")) {
                $(res["Target"] + "-play-container").attr("data-filepath", res["FilePath"]);
                $(res["Target"] + "-play-container").removeClass("hide");
            }
            $(target + "-" + res["SingleOrMulti"] + "-progress-bar").css("width", res["Progress"]+"%");
        } else if (res["Status"] == "fail") {
            $(res["Target"] + "-play-container").addClass("hide");
            $(res["Target"] + "-wait-container").addClass("hide");
            $(res["Target"] + "-download-container").removeClass("hide");
            $(res["Target"] + "-" + res["SingleOrMulti"]  + "-progress-container").addClass("hide");
            $(res["Target"] + "-status-ok").addClass("hide");
            $(res["Target"] + "-status-fail").removeClass("hide");
            set_list_item_error($(res["Target"] + "-list-group-item"));
            console.log(res["Msg"])
        } else if (res["Status"] == "UpdateUI") {
            $(res["Target"] + "-" + res["SingleOrMulti"] + "-progress-container").removeClass("hide");
        }
    }

    // Server close connection
    ws.onclose = function(e) {
        console.log("[onclose] connection closed (" + e.code + ")");
        delete ws;
    }

    // Occur error
    ws.onerror = function (e) {
        console.log("[onerror] error!");
    }
}
