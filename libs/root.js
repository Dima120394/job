
var queues = [], queues_num = [], textArea = "", queues_wait = [], flag = 0, sended = false, inter, func1 = true, func2 = true, localS = ["auto_send"], bd = {}, memOpenResTranslate = 0;
var socket = io.connect({path:"/ynical/socket.io", transports: ['websocket'], upgrade: true, reconnect: false, 'reconnectionDelay': 1000, 'forceNew': true, 'reconnectionDelayMax': 5000, 'randomizationFactor': 0, 'reconnectionAttempts': 50});

var active, editSelector;

$(document).mousedown(function(event){
	// console.log(event.target.className); 
	if(event.which == 3){
		// console.log(event.target.className);
		if(event.target.className.match(/item-1|item-2|text_parse|percent|status_scan|date_two|date_one|percent_text|status_text/) != null){
			document.oncontextmenu = function() {return false;};
			for(var g = 0; g < $(event.target).parents().length; g++){
				if($($(event.target).parents()[g]).attr("class") != undefined){
					if($($(event.target).parents()[g]).attr("class").indexOf("result_text") != -1){
						active = $(event.target).parents()[g];
					}
				}
			}
			$(".menu-popup").addClass("active");
			$(".menu-popup").css({top: event.clientY-5, left: event.clientX-5});
		} else{
			document.oncontextmenu = function() {return true;};
		}
	} else{
		if(event.target.className.indexOf("item-1") != -1){
			var spl = bd[$(active).attr("data-id")].text.split(".");
			for(var i = 0; i < spl.length; i++){
				var t = '<div class="row col-12 m-0 p-0 result_text wait" data-id="'+ ($(".result_text").length+1) +'" data-time="'+ time +'"><div class="col-12 lh-auto px-3 p-1 text_parse" title="'+ textArea +'">'+ textSokr +'</div><div class="row align-items-center col-sm-12 m-0 p-0 info_tablo"><div class="col-auto h-100 m-0 p-0 w-75 col-sm-6 col-md-8 justify-content-between text-center date_inspect_text"><div class="row col-auto m-0 p-0 col-sm-8 col-md-11 pl-2 justify-content-left text-sm-center percent">Результат: <div class="text-center percent_text"></div></div><div class="row col-auto m-0 p-0 col-sm-12 col-md-12 pl-2 justify-content-left text-sm-top pb-1 pt-2 status status_scan">Статус:<div class="status_text">ожидание</div></div></div><div class="col-auto m-0 p-0 col-sm-6 h-100 w-25 col-md-4 justify-content-between text-right date_inspect" d-time="'+ dat.getTime() +'"><div class="col-auto p-0 col-sm-12 pr-2 col-md-12 text-right date_one">'+ dat.getDateIsNull()+'/'+dat.getMonthIsNull()+'/'+dat.getFullYear() +'</div><div class="col-auto p-0 text-right col-sm-12 col-md-12 pt-2 pr-2 text-md-bottom date_two">'+ dat.getHoursIsNull()+':'+dat.getMinutesIsNull() +'</div></div></div></div>';
			}
		}
		if(event.target.className.indexOf("item-2") != -1){
			var st = '';
			if(bd[$(active).attr("data-id")] != undefined){
				delete bd[$(active).attr("data-id")];
				st = "active";
			} else{
				st = "inactive";
			}

			socket.json.send({del: true, id: $(active).attr("data-id"), user: window.localStorage.getItem("ident"), time: $(active).find(".date_inspect").attr("d-time"), status: st});
			$(active).remove();
			$(".count_zapros .count").text($(".result_text.success").length+"/"+$(".result_text").length);
		}
		if(event.target.className.indexOf("item-3") != -1){
			editSelector = active;
			$("#parse_textarea")[0].value = bd[$(active).attr("data-id")].text;
			$(".parse_button").text("Сохранить");
			$(".parse_button").addClass("edit_save");
			bd[$(active).attr("data-id")].edit = true;
			// console.log(bd);
			$(active).find(".status_text").text("редактирование");
			$(active).removeClass("loading").addClass("wait");
			socket.json.send({edit: true, id: $(active).attr("data-id"), user: window.localStorage.getItem("ident"), time: $(active).find(".date_inspect").attr("d-time")});
		}
		if($(".menu-popup").attr("class").indexOf("active") != -1){
			$(".menu-popup").removeClass("active");
		}
	}
});

$(function(){
	// $(".row").addcontextmenu("menu");
	if((/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i).test(navigator.userAgent)){
		$("html").addClass("noDesktop");
	}

	function server(){
		document.oncopy = () =>{
			var body_element = document.getElementsByTagName('body')[0];
			var selection;
			selection = window.getSelection();
			var copytext = selection + "%";
			if(typeof(selection) == "number"){
				var newdiv = document.createElement('div'); 
				newdiv.style.position='absolute';
				newdiv.style.left='-99999px';
				body_element.appendChild(newdiv);
				newdiv.innerHTML = copytext;
				selection.selectAllChildren(newdiv);
				window.setTimeout(function(){
					body_element.removeChild(newdiv);
				},0);
			}
		};	
		socket.on("connect", function(socket){
			$(".status_server").text("Online");
			$(".status_server").addClass("btn-success").removeClass("btn-danger");
		});
		socket.on("disconnect", function(){
			socket.open();
			$(".status_server").text("Offline");
			$(".status_server").removeClass("btn-success").addClass("btn-danger");
		});
		var text = "";
		socket.on("message", (msg) => {
			if(msg.user == window.localStorage.getItem("ident")){
				// console.log(msg);
				for(var i = 0; i < msg.res.length; i++){
					text += msg.res[i];
					if(i + 1 != msg.res.length){
						text += "\n\n     ----------------------------------------\n\n";
					} else{
						// memOpenResTranslate = i;
					}
				}
				if(msg.res.length != 3){
					// console.log(memOpenResTranslate);
					socket.json.send({id: $(".open-result-text").attr("data-id"), user: window.localStorage.getItem("ident"), time: Number($(".open-result-text .date_inspect").attr("d-time")), translate: true, translateResult: true});
				}
				$(".show-block").remove();
				$(".right_block").append("<textarea class='show-block' readonly>"+ text +"</textarea>");
				text = "";
			}
		});
		socket.on("data", function(data){
			if($(".status_server").attr("class").indexOf("btn-danger") != -1){
				$(".status_server").text("Online");
				$(".status_server").addClass("btn-success").removeClass("btn-danger");
			}
			// data.forEach((v, k) => {
			// 	// console.log(v);
			// 	if($(".log_file[data_id='"+ v.id +"'][data_time='"+ v.time +"'][data-n='"+ v.nomer +"']")[0] == undefined){
			// 		var s = '<div class="row log_file m-0 p-1 pl-2 col-12 align-self-start align-top align-items-start" data_user="'+ v.user +'" data_id="'+ v.id +'" data_time="'+ v.time +'" data-n="'+ v.nomer +'" data-c="0"><div class="text m-0 p-1">'+ v.value +'</div><div class="d-none logies"></div></div>';
			// 		if($(".logs .log_file").length != 0){
			// 			$(s).insertBefore(".logs .log_file:first-child");
			// 		} else{
			// 			$(".logs").append(s);
			// 		}
			// 	} 
			// 	if($(".log_file[data_id='"+ v.id +"'][data_time='"+ v.time +"'][data-n='"+ v.nomer +"']")[0] != undefined){
			// 		var add = 0;
			// 		for(var i = Number($(".log_file[data_id='"+ v.id +"'][data_time='"+ v.time +"'][data-n='"+ v.nomer +"']").attr("data-c")); i < v.logs.length; i++){
			// 			if($(".log_file[data_id='"+ v.id +"'][data_time='"+ v.time +"'][data-n='"+ v.nomer +"'] .logies").text().indexOf(v.logs[i]) == -1){
			// 				$(".log_file[data_id='"+ v.id +"'][data_time='"+ v.time +"'][data-n='"+ v.nomer +"'] .logies").append('<div class="info-log m-1 col-12">'+ v.logs[i] +'</div>');
			// 				if($(".log_file[data_id='"+ v.id +"'][data_time='"+ v.time +"'][data-n='"+ v.nomer +"'].active_log")[0] != undefined){
			// 					$(".logs_text").append('<div class="info-log m-1 col-12">'+ v.logs[i] +'</div>');
			// 				}
			// 				add++;
			// 				$(".log_file[data_id='"+ v.id +"'][data_time='"+ v.time +"'][data-n='"+ v.nomer +"']").attr("data-c", add);
			// 			}	
			// 		}
			// 	}
			// });

			var d = data.filter((w) => {
				if(w.timeE == ""){
					return (w.user == window.localStorage.getItem("ident"));
				} else{
					return (w.user == window.localStorage.getItem("ident") && w.timeE + 60000 > new Date().getTime());
				}
			});
			if(Object.keys(bd).length > 0){
				Object.keys(bd).forEach((v, k) => {
					var res = d.filter((w) => {return (w.time == bd[v].time && w.id == bd[v].id);});
					if(res.length == 0){
						socket.json.send({text: bd[v].text, id: bd[v].id, user: bd[v].user, time: bd[v].time, new: true, translate: window.localStorage.getItem("translate")});
					}
				});
			}
			if(d.length != 0){
				d.forEach((v, k) => {
					if($(".result_text[data-id="+ Number(v.id) +"]") != undefined && $(".result_text[data-id="+ Number(v.id) +"]").attr("data-time") == (v.time+"")){
						if(v.percent == "" && v.active == true && $(".result_text[data-id="+ Number(v.id) +"]").attr("class").indexOf("loading") == -1){
							$(".result_text[data-id="+ Number(v.id) +"]").removeClass("wait").addClass("loading");
							$(".result_text[data-id="+ Number(v.id) +"] .status div").text(" выполняется");
						} else{
							if(v.percent == "" && v.status == "vxod"){
								$(".result_text[data-id="+ Number(v.id) +"] .status div").text("вошёл в аккаунт");
							}
							if(v.percent == "" && v.status == "wait"){
								$(".result_text[data-id="+ Number(v.id) +"] .status div").text(v.wait+ " на очереди");
							}
							if(v.percent == "" && v.status == "resulted"){
								$(".result_text[data-id="+ Number(v.id) +"] .status div").text("ожидание результата");
							}
							if(v.percent != "" && v.status == "percent" && $(".result_text[data-id="+ Number(v.id) +"]").attr("class").indexOf("loading") != -1){
								// console.log(v);
								$(".result_text[data-id="+ Number(v.id) +"]").addClass("success").removeClass("loading");
								if(v.translate == "false"){
									$(".result_text[data-id="+ Number(v.id) +"] .percent div").text(v.percent);
								} else{
									$(".result_text[data-id="+ Number(v.id) +"] .percent div").append('<button class="result_show">показать</button>');
									// $(".result_text[data-id="+ Number(v.id) +"] .percent div").(v.percent[0]+'         '+v.percent[1]);
								}
								$(".result_text[data-id="+ Number(v.id) +"] .status div").text("выполнено");
								$(".count_zapros .count").text($(".result_text.success").length+"/"+$(".result_text").length);
								delete bd[v.id];
								// console.log(bd);
							}
						}
						if(typeof(v.percent) == "object" && $(".result_text[data-id="+ Number(v.id) +"] .status div").text() != "3 из 3"){
							switch(v.percent.length){
								case 1:
									$(".result_text[data-id="+ Number(v.id) +"] .status div").text("1 из 3");
									break;
								case 2: 
									$(".result_text[data-id="+ Number(v.id) +"] .status div").text("2 из 3");
									break;
								case 3:
									$(".result_text[data-id="+ Number(v.id) +"] .status div").text("3 из 3");
									break;
							}
						}
					}
				});
			}
		});
	}
	server();
	$(".app").css("height", window.innerHeight - parseInt($(".header").css("height"))-25);
	$(window).on("resize", function(e){
		$(".app").css("height", window.innerHeight - parseInt($(".header").css("height"))-25);
	});
	$(localS).each(function(k, v){
		if(window.localStorage.getItem(v) == "true"){
			$("."+v).click();
		}
	});

	$("body").on("keydown", (e) => {
		if(e.ctrlKey == true && e.shiftKey == true && e.keyCode == 76){
			if($(".box-log").css("display") == "none"){
				$(".box-log").css({display: "block"});
			} else{
				$(".box-log").css({display: "none"});
			}
		}
	});
	$("body").click((e) => {
		if((($(e.target).attr("class")+"").match(/show-block|yandex_result|bing_result/) == null) && $(".show-block")[0] != undefined){
			if(($(e.target).attr("class")+"").match(/result_show/) == null){
				$(".show-block").remove();
				if($(".result_show[disabled]")[0] != undefined){
					$(".result_show[disabled]").removeAttr("disabled");
					$("#parse_textarea").val("");
				}
			}
		}
	});
	$(".right_block").on("scroll", function(){
		$(".show-block").css("top", $(".right_block").scrollTop()+"px")
	});
	$("body").on("click", ".result_show", (event) => {
		var glass;
		if($(".result_show[disabled]")[0] != undefined){
			$(".result_show[disabled]").removeAttr("disabled");
			$(".result_text").removeClass("open-result-text");
		}
		$(".show-block").remove();
		for(var g = 0; g < $(event.target).parents().length; g++){
			if($($(event.target).parents()[g]).attr("class") != undefined){
				if($($(event.target).parents()[g]).attr("class").indexOf("result_text") != -1){
					glass = $(event.target).parents()[g];
				}
			}
		}
		// $(".right_block").append("<textarea class='show-block' readonly></textarea>");
		$(glass).addClass("open-result-text");
		$("#parse_textarea").val($(".text_parse", glass).attr("title"));
		$(event.target).attr("disabled", "disabled");
		socket.json.send({text: $(".text_parse", glass).text(), id: $(glass).attr("data-id"), user: window.localStorage.getItem("ident"), time: Number($(".date_inspect", glass).attr("d-time")), translate: true, translateResult: true});	
	});

	$("body").on("click", ".log_file .text", (e) => {
		$(".logs_text .info-log").remove();
		if($(".active_log")[0] != undefined){
			$(".active_log").removeClass("active_log");
		}
		$($(e.target).parents()[0]).addClass("active_log");
		$(".logs_text").append($($(e.target).parents()[0]).find(".logies").html());
	});

	$(window).on("focus", function(e){
		$("#parse_textarea").focus();
	});

	if(window.localStorage.getItem("auto_send") != undefined){
		if(window.localStorage.getItem("auto_send") == "true"){
			$(".auto_send").addClass("btn-success").removeClass("btn-danger");
		} else{
			$(".auto_send").removeClass("btn-success").addClass("btn-danger");
		}
	} else{
		window.localStorage.setItem("auto_send", "false");
		$(".auto_send").removeClass("btn-success").addClass("btn-danger");
	}
	if(window.localStorage.getItem("translate") != undefined){
		if(window.localStorage.getItem("translate") == "true"){
			$(".translate").addClass("btn-success").removeClass("btn-danger");
		} else{
			$(".translate").removeClass("btn-success").addClass("btn-danger");
		}
	} else{
		window.localStorage.setItem("translate", "false");
		$(".translate").removeClass("btn-success").addClass("btn-danger");
	}
	$(".auto_send").on("click", function(e){
		if(window.localStorage.getItem("auto_send") == "false"){
			$(".auto_send").addClass("btn-success").removeClass("btn-danger");
			window.localStorage.setItem("auto_send", "true");
		} else{
			$(".auto_send").removeClass("btn-success").addClass("btn-danger");
			window.localStorage.setItem("auto_send", "false");
		}
	});
	$(".translate").on("click", function(e){
		if(window.localStorage.getItem("translate") == "false"){
			$(".translate").addClass("btn-success").removeClass("btn-danger");
			window.localStorage.setItem("translate", "true");
		} else{
			$(".translate").removeClass("btn-success").addClass("btn-danger");
			window.localStorage.setItem("translate", "false");
		}
	});
	
	$(".no-padding textarea").on("keypress", function(e){
		if(e.keyCode == 13){
			if($("#parse_textarea").val().trim() != "" && $("#parse_textarea").val().trim().length > 0){
				textArea = $("#parse_textarea").val().trim();
				if(textArea != ""){
					if($(".edit_save")[0] == undefined){
						originalTextParsing("new");
					} else{
						originalTextParsing("save");
					}
				}
			}
		}
	});
	$(".parse_button").on("focus", () => {
		$(".parse_button").on("keydown", (e) => {
			if($("#parse_textarea").val().trim() != "" && $("#parse_textarea").val().trim().length > 0){
				if(e.keyCode == 13){ 
					textArea = $("#parse_textarea").val().trim();
					if(textArea != ""){
						if($(".edit_save")[0] == undefined){
							originalTextParsing("new");
						} else{
							originalTextParsing("save");
						}
					}
				}
			}
		});
	});
	$(".parse_button").on("click", function(){
		if($("#parse_textarea").val().trim() != "" && $("#parse_textarea").val().trim().length > 0){
			textArea = $("#parse_textarea").val().trim();
			if(textArea != ""){
				if($(".edit_save")[0] == undefined){
					originalTextParsing("new");
				} else{
					originalTextParsing("save");
				}
			}
		}
	});
	$("#parse_textarea").on("paste", function(e){
		// console.log(e);
		setTimeout(function(){
			if(window.localStorage.getItem("auto_send") == "true"){
				if($("#parse_textarea").val().trim() != "" && $("#parse_textarea").val().trim().length > 0){
					textArea = $("#parse_textarea").val().trim().split("\\n").join(" ").split("\\t").join("");
					if(textArea != ""){
						if($(".edit_save")[0] == undefined){
							originalTextParsing("new");
						} else{
							originalTextParsing("save");
						}
					}
				}
			}
		}, 1000);
	});
});

Date.prototype.getMonthIsNull = function(){
  return ((this.getMonth()+1)+"").length == 1 ? "0"+(this.getMonth()+1) : this.getMonth()+1;``
};
Date.prototype.getDateIsNull = function(){
  return (this.getDate()+"").length == 1 ? "0"+this.getDate() : this.getDate();
};
Date.prototype.getHoursIsNull = function(){
  return (this.getHours()+"").length == 1 ? "0"+this.getHours() : this.getHours();
};
Date.prototype.getMinutesIsNull = function(){
  return (this.getMinutes()+"").length == 1 ? "0"+this.getMinutes() : this.getMinutes();
};

var textSokr = "", txtSend = "";

function originalTextParsing(type){
	if(window.localStorage.getItem("ident") == undefined){
		window.localStorage.setItem("ident", new Date().getTime()+"user_"+Math.ceil(Math.random()*10000000000000));
	}
	if(textArea.length > 90){
		textSokr = textArea.substr(0, 90)+"...";
	} else{
		textSokr = textArea;
	}
	
	if(type == "new"){
		var dat = new Date(), time = new Date().getTime();
		txtSend = '<div class="row col-12 m-0 p-0 result_text wait" data-id="'+ ($(".result_text").length+1) +'" data-time="'+ time +'"><div class="col-12 lh-auto px-3 p-1 text_parse" title="'+ textArea.split("\"").join("'") +'">'+ textSokr +'</div><div class="row align-items-center col-sm-12 m-0 p-0 info_tablo"><div class="col-auto h-100 m-0 p-0 w-75 col-sm-6 col-md-8 justify-content-between text-center date_inspect_text"><div class="row col-auto m-0 p-0 col-sm-8 col-md-11 pl-2 justify-content-left text-sm-center percent">Результат: <div class="text-center percent_text"></div></div><div class="row col-auto m-0 p-0 col-sm-12 col-md-12 pl-2 justify-content-left text-sm-top pb-1 pt-2 status status_scan">Статус:<div class="status_text">ожидание</div></div></div><div class="col-auto m-0 p-0 col-sm-6 h-100 w-25 col-md-4 justify-content-between text-right date_inspect" d-time="'+ dat.getTime() +'"><div class="col-auto p-0 col-sm-12 pr-2 col-md-12 text-right date_one">'+ dat.getDateIsNull()+'/'+dat.getMonthIsNull()+'/'+dat.getFullYear() +'</div><div class="col-auto p-0 text-right col-sm-12 col-md-12 pt-2 pr-2 text-md-bottom date_two">'+ dat.getHoursIsNull()+':'+dat.getMinutesIsNull() +'</div></div></div></div>';

		if($(".result_text").length != 0){
			$(txtSend).insertBefore(".right_block .result_text:first-child");
		} else{
			$(".right_block div").append(txtSend);
		}
		bd[$(".result_text").length] = {text: textArea, id: $(".result_text").length, user: window.localStorage.getItem("ident"), time: time, edit: false};
		socket.json.send({text: textArea, id: $(".result_text").length, user: window.localStorage.getItem("ident"), time: time, new: true, translate: window.localStorage.getItem("translate")});
		$(".count_zapros .count").text($(".result_text.success").length+"/"+$(".result_text").length);
		$("#parse_textarea").focus();
	} else{
		if($(editSelector)[0] != undefined){
			$(".parse_button").text("Отправить");
			$(".parse_button").removeClass("edit_save");
			$(editSelector).find(".text_parse").attr("title", textArea);
			$(editSelector).find(".text_parse").text(textSokr);
			bd[$(editSelector).attr("data-id")].edit = false;
			bd[$(editSelector).attr("data-id")].text = textArea;
				socket.json.send({edited: true, id: $(editSelector).attr("data-id"), user: window.localStorage.getItem("ident"), time: $(editSelector).find(".date_inspect").attr("d-time"), text: bd[$(editSelector).attr("data-id")].text, translate: false});
		}
	}
	$("#parse_textarea").val("");
}

setInterval(() => {
	if(window.localStorage.getItem("ident") == undefined){
		window.localStorage.setItem("ident", new Date().getTime()+"user_"+Math.ceil(Math.random()*10000000000000));
	}
	if(socket.connected == false){
		socket.open();
	}
}, 2000);
