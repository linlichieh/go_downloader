$(document).ready(function(){
    connect_websocket();
    $("#url1").change(function() {
        $("#url1-btn").removeAttr("disabled");
        $("#url1-btn").removeClass("btn-danger btn-success").addClass("btn-default");
        $("#url1-btn").html("Download");
        $("#url1-progress").show();
        $("#url1-show").css("width", "1%");
    })
    $("#url1-btn").click(function() {
        $.ajax({
                url: '/api/',        //指向你要請求的PHP
                type: "POST",                        //如果要使用GET, 就改成 type: "GET",
                data: {target: "url1", url: $("#url1").val()},                //或是用這種寫法 data: {test:1, test2:33},
                beforeSend: function() {
                    $("#url1-btn").removeClass("btn-default btn-danger btn-success").addClass("btn-warning");
                    $("#url1-btn").html("Downloading...")
                    $("#url1-btn").attr("disabled", "disabled");
                    $("#url1-progress").show();
                },
                success: function(response) {
                    $("#url1-btn").removeClass("btn-warning");
                    var res = JSON.parse(response);
                    if (res["status"] == "ok") {
                        $("#url1-btn").addClass("btn-success");
                        $("#url1-btn").html("Success");
                    } else {
                        $("#url1-btn").removeAttr("disabled");
                        $("#url1-btn").addClass("btn-danger");
                        $("#url1-btn").html("Retry");
                    }
                    $("#url1-progress").hide();
                },
        })
    })
})

function connect_websocket() {
    ws = new WebSocket("ws://192.168.1.67:9090/progress/");

    // First connect
    ws.onopen = function() {
        console.log("[onopen] connect ws uri.");
    }

    // Sending from server
    ws.onmessage = function(e) {
        console.log("[onmessage] message received: " + e.data);
    }

    // Server close connection
    ws.onclose = function(e) {
        console.log("[onclose] connection closed (" + e.code + ")");
    }

    // Occur error
    ws.onerror = function (e) {
        console.log("[onerror] error!");
    }
}