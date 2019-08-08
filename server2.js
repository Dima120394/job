
const exec = require('child_process').exec,
  path = require("path"),
  helmet = require('helmet'),
 	$ = require('jquery'),
 	io = require("socket.io")(10092, {
		path: '/ynical',
		transports: ['websocket'],
		pingInterval: 500,
		pingTimeout: 10000
	}),
	trans = require('google-translate-api'),
	cheerio = require('cheerio'),
	rp = require('request-promise'),
	request = require("request"),
	Nightmare = require('nightmare'),
	fs = require("fs"),
	mongoose = require('mongoose'),
  Schema = new mongoose.Schema({
  	numb: 'number',
    mail: 'string',
    pass: 'string',
    timeLast: 'number'
  });

mongoose.connect("mongodb://localhost/plagiat");
var serv = mongoose.model('mailes', Schema);


var nightmare = Nightmare({show: false, pollInterval: 30,  waitTimeout: 240000, typeInterval: 30}), 
	night = Nightmare({show: false, pollInterval: 30,  waitTimeout: 240000, typeInterval: 30}), 
	google1 = Nightmare({show: false, pollInterval: 30,  waitTimeout: 120000, typeInterval: 30}), 
	google2 = Nightmare({show: false, pollInterval: 30,  waitTimeout: 120000, typeInterval: 30});

var result1 = "", result2 = "", message = "", inter, text = "", id = 0, closeNightmare = false, closeSess, func1 = true, func2 = true, func3 = true, func4 = true, time1 = 10000, time2 = 10000, time3 = 10000, time4 = 10000, queues = ["", ""], queues_num = [], emulSite1Client, emulSite2Client, queues_bd = [], data1, data2, inter1, inter2, t1, t2, start1, start2, start3, start4;

var bd = [];

var controllerFunc = {func1: {timeEnd: 10000}, func2: {timeEnd: 10000}, func3: {timeEnd: 10000}, func4: {timeEnd: 10000}};

	async function emulSite1(){
		try{
		  time1 = 0;
			var mail = "", pass = "";
			func1 = false;
			await serv.find({timeLast: {$lt: new Date().getTime()-450000}}).sort({numb: 1}).limit(1).then(async (res) => { 
				data1 = res[0];
				await serv.collection.update({mail: data1.mail}, {$set: {timeLast: (new Date().getTime()+20)}});
				bd[queues_bd[0]].logs.push("Открытие сайта");
				await nightmare
					.goto("https://users.antiplagiat.ru/")
					.wait("a.login")
					.click("a.login")
					.wait("#dialog-enter")
					.insert('#Login_Email', data1.mail)
					.insert('#Login_Password', data1.pass)
					.click("#login-button");
					// console.log("func1.Вход выполнен = "+data1.mail+"  "+data1.pass);
					await nightmare.wait("button#add-text");
					if(bd[queues_bd[0]].status != "deleted"){
						await (() => {bd[queues_bd[0]].logs.push("Вход выполнен: почта - "+data1.mail+" пароль - "+data1.pass);})();
						bd[queues_bd[0]].status = "vxod";
					} else{
						bd[queues_bd[0]].logs.push("Удалено");
						await nightmare.click("#logoff").wait("a.login").then(function(){});
						func1 = true;
						console.log("сброс");
						return 0;
					}
					time1 = 0;
					var pr = await nightmare.evaluate(() => {
						var arr = [$("#text-upload-btn").attr("disabled"), Number($(".scroll-area tr:first-child").attr("data-id"))];
						return arr;
					});
					// console.log(pr);
					if(pr[0] == null){
						var dataId1 = Number(pr[1]);

						async function getText1(){
							var fl1;
							dataId1 = dataId1 + 1;
							await nightmare
								.wait("#dialog-text-upload")
								.wait("button#add-text")
								.click("button#add-text");
							async function sendYnic1(){
								await nightmare
									.insert(".ap-dialog.ui-dialog-content.ui-widget-content textarea", bd[queues_bd[0]].value)
									.wait(1000)
									.click("#text-upload-btn");
									fl1 = await nightmare.evaluate(() => {
										return document.querySelector("#text-upload-btn").getAttribute("disabled");
									});
									console.log(fl1);
								}
								await sendYnic1();
								if(fl1 == "disabled"){
									await (() => {bd[queues_bd[0]].logs.push("Проверка на сайте  уже "+dataId1);})();
									if(bd[queues_bd[0]].status != "deleted"){
										bd[queues_bd[0]].status = "resulted";
									} else{
										await nightmare.click("#logoff").wait("a.login").then(function(){ func1 = true; });
										return 0;
									}
									time1 = 0;
									inter1 = setInterval(async() => {
										t1 = await nightmare.evaluate(() => {
											var res;
											if(document.querySelector(".scroll-area tr:first-child .original i") != null){
												res = document.querySelector(".scroll-area tr:first-child .original i").innerText;
											} else{
												res = "";
											}
											return [document.querySelector(".scroll-area tr:first-child .original i"), document.querySelector(".scroll-area tr:first-child .but-can-read"), res, "func1", Number($(".scroll-area tr:first-child").attr("data-id"))];
										});

										var inf = "";
										if((t1[0]) != null){
											inf += "появилась строка с текстом, ";
										} else{
											inf += "строка с текстом пока отсутствует, ";
										}
										if(t1[1] == null){
											inf += "ошибок не обнаружено, ";
										} else{
											inf += "ошибка проверки уникальности текста, функция будет перезагружена, ";
										}
										if(t1[2] == ""){
											inf += "процент уникальности ещё не появился, ";
										} else{
											inf += "процент уникальности обнаружен передан, ";
										}
										if(t1[3]){
											inf += "задействована "+t1[3]+", ";
										}
										if(t1[4]){
											inf += "номер строки получения процента уникальности на сайте значится - "+t1[4];
										}

										await (() => {bd[queues_bd[0]].logs.push("Ожидание процента уникальности ( "+inf+" )");})();
										if(t1[4] == dataId1){
											if(t1[0] != null){
												try{							
													if(t1[2] != ""){
														// console.log(t1);
														await clearInterval(inter1);
														if(bd[queues_bd[0]].status != "deleted"){
															bd[queues_bd[0]].status = "percent";
														} else{
															await nightmare.click("#logoff").wait("a.login").then(function(){ func1 = true; });
															return 0;
														}
														bd[queues_bd[0]].logs.push("Процент получен ( "+ t1[2] +" ), осуществляется выход с аккаунта...");
														bd[queues_bd[0]].percent = t1[2];
														await (() => {bd[queues_bd[0]].logs.push("Время выполнения: "+((new Date().getTime() - Number(start1)) / 1000)+" сек.");})();
														await nightmare.click("#logoff").wait("a.login");
														await nightmare.then(function(){
															controllerFunc.func1.timeEnd = 0;
															func1 = true;
															bd[queues_bd[0]].timeE = new Date().getTime();
															bd[queues_bd[0]].end = true;
															console.log(bd[queues_bd[0]]);
														});
													}
											 } catch(err){
											 		console.log("del obj1");
													await nightmare.click("#logoff").wait("a.login").then(function(){ func1 = true; });
											 }
											} else if(t1[1] != null){
												await (() => {bd[queues_bd[0]].logs.push("Ошибка, текст не был добавлен на проверку, пробую ещё раз, ждите...");})();
												console.log(t1);
												console.log("func1.error restart");
												clearInterval(inter1);
												await getText1();
											}
										}
									}, 1500);
								} else{
									await sendYnic1();
								}
						}
						await getText1();
						time1 = 0;
					} else{
						try{
							await nightmare.click("#logoff").wait("a.login");
							console.log("RELOAD");
							emulSite1();
						} catch(err){
							console.log("reload");
						}
					}
				});
			} catch(err){
				console.log("del obj1");
				await nightmare.click("#logoff").wait("a.login").then(function(){ func1 = true; });
			}
		}
		async function emulSite2(){
			try{
			var mail = "", pass = "";
			time2 = 0;
			func2 = false;
			await serv.find({timeLast: {$lt: new Date().getTime()-450000}}).sort({numb: -1}).limit(1).then(async (res) => { 
				data2 = res[0];
				await serv.collection.update({mail: data2.mail}, {$set: {timeLast: (new Date().getTime()+20)}});

			bd[queues_bd[1]].logs.push("Открытие сайта");
			await night
					.goto("https://users.antiplagiat.ru/")
					.wait("a.login")
					.click("a.login")
					.wait("#dialog-enter")
					.insert('#Login_Email', data2.mail)
					.insert('#Login_Password', data2.pass)
					.click("#login-button");
					await night.wait("button#add-text");
					if(bd[queues_bd[1]].status != "deleted"){
						await (() => {bd[queues_bd[1]].logs.push("Вход выполнен: почта - "+data1.mail+" пароль - "+data1.pass)})();
						bd[queues_bd[1]].status = "vxod";
					} else{
						bd[queues_bd[1]].logs.push("Удалено");
						await night.click("#logoff").wait("a.login").then(function(){ });
						func2 = true;
						return 0;
					}
					time2 = 0;
					var pr = await night.evaluate(() => {	
						var arr = [$("#text-upload-btn").attr("disabled"), Number($(".scroll-area tr:first-child").attr("data-id"))];
						return arr;
					});	

					bd[queues_bd[1]].logs.push("Проверка на сайте  уже "+(pr[1]+1));
					if(pr[0] == null){
						var dataId2 = Number(pr[1]);
						async function getText2(){
							var fl2;
							dataId2 = dataId2 + 1;
							await night
								.wait("#dialog-text-upload")
								.wait("button#add-text")
								.click("button#add-text");
							async function sendYnic2(){
								await night
									.insert(".ap-dialog.ui-dialog-content.ui-widget-content textarea", bd[queues_bd[1]].value)
									.wait(1000)
									.click("#text-upload-btn");
								fl2 = await night.evaluate(() => {
									return document.querySelector("#text-upload-btn").getAttribute("disabled");
								});
								console.log(fl2);
							}
							await sendYnic2();
							if(fl2 == "disabled"){
								if(bd[queues_bd[1]].status != "deleted"){
									bd[queues_bd[1]].status = "resulted";
								} else{
									await night.click("#logoff").wait("a.login").then(function(){ func2 = true; });
									return 0;
								}
								time2 = 0;
									inter2 = setInterval(async() => {
										t2 = await night.evaluate(() => {
											var res;
											if(document.querySelector(".scroll-area tr:first-child .original i") != null){
												res = document.querySelector(".scroll-area tr:first-child .original i").innerText;
											} else{
												res = "";
											}
											return [document.querySelector(".scroll-area tr:first-child .original i"), document.querySelector(".scroll-area tr:first-child .but-can-read"), res, "func2", Number($(".scroll-area tr:first-child").attr("data-id"))];
										});
										var inf = "";
										if(t2[0] != null){
											inf += "появилась строка с текстом, ";
										} else{
											inf += "строка с текстом пока отсутствует, ";
										}
										if(t2[1] == null){
											inf += "ошибок не обнаружено, ";
										} else{
											inf += "ошибка проверки уникальности текста, функция будет перезагружена, ";
										}
										if(t2[2] == ""){
											inf += "процент уникальности ещё не появился, ";
										} else{
											inf += "процент уникальности обнаружен, ";
										}
										if(t2[3]){
											inf += "задействована "+t2[3]+", ";
										}
										if(t2[4]){
											inf += "номер строки получения процента уникальности на сайте значится - "+t2[4];
										}

										await (() => {bd[queues_bd[1]].logs.push("Ожидание процента уникальности ( "+inf+" )");})();

										if(t2[4] == dataId2){
											if(t2[0] != null){
												try{
													if(t2[2] != ""){
														// console.log(t2);
														await clearInterval(inter2);								
														if(bd[queues_bd[1]].status != "deleted"){
															bd[queues_bd[1]].status = "percent";
														} else{
															await night.click("#logoff").wait("a.login").then(function(){ func2 = true; });
															return 0;
														}
														bd[queues_bd[1]].logs.push("Процент получен ( "+ t2[2] +" ), осуществляется выход с аккаунта...");
														bd[queues_bd[1]].percent = t2[2];
														await (() => {bd[queues_bd[1]].logs.push("Время выполнения: "+((new Date().getTime() - Number(start2)) / 1000)+" сек.");})();
														await night.click("#logoff").wait("a.login");
														await night.then(function(){
															func2 = true;
															bd[queues_bd[1]].timeE = new Date().getTime();
															controllerFunc.func2.timeEnd = 0;
															bd[queues_bd[1]].end = true;
															console.log(bd[queues_bd[1]]);
															// await bot.sendMessage(bd[queues_bd[0]].id, bd[queues_bd[0]].value+"\n Результат: "+result1);
															// setResSite1(bd[queues_bd[0]], "percent");
														});
													}
												} catch(err){
													console.log("del obj2");
													await night.click("#logoff").wait("a.login").then(function(){ func2 = true; });
												}
											} else if (t2[1] != null){
												await (() => {bd[queues_bd[1]].logs.push("Ошибка, текст не был добавлен на проверку, пробую ещё раз, ждите...");})();
												console.log(t2);
												clearInterval(inter2);
												console.log("restart func2 error");
												await getText2();
											}
										}
									}, 1500);
								} else{
									await sendYnic2();
								}
							}
							await getText2(dataId2);
					} else{
						try{
							await night.click("#logoff").wait("a.login");
							console.log("RELOAD");
							emulSite2();
						} catch(err){
							console.log("reload");
						}
					}
				});
			} catch(err){
				console.log("del obj2");
				await night.click("#logoff").wait("a.login").then(function(){ func2 = true; });
			}
		}

// const MyToken = "539519220:AAGXpj4X3JblDLCBpOplxqbNq9lh746W_rs";

// var Agent = require('socks5-https-client/lib/Agent');

// const TelegramBot = require('node-telegram-bot-api');

// var bot;

// function connect(){
// bot = new TelegramBot(MyToken, {
//    polling: true,
//    request: {
//       agentClass: Agent,
//       agentOptions: {
//         socksHost: '185.36.191.39',
//         socksPort: 7913,
//         socksUsername: 'userid73yR',
//         socksPassword: '7oq82T8n'
//       }
//     }
//   });
// }
// connect();
// bot.on("polling_error", function(err){
//   console.log(err);
// });


// bot.on("message", function(msg){
// 	bd.push({value: msg.text, id: msg.from.id, active: false, percent: '', status: ''});
// });


var sinomiFlag = true;
function sinoni(s){
	function tParseYnic(){
		request({
			url: 'https://api.sinoni.men',
			method: 'POST',
			host: 'api.sinoni.men',
			form: {token: 'tolya', text: s.resYa, lang: 'ru'},
			json: true
		}, async (err, resur, body) => {
			console.log(body);
			console.log("sinoni"+s.fn);
			function result1(){
				request({
					url: 'https://api.sinoni.men',
					method: 'POST',
					host: 'api.sinoni.men',
					form: {token: 'tolya', id: body.result.id},
					json: true
				}, (err, resur, b) => {
					console.log(b);
					if(b.error == undefined){
						if(s.obj.percent.length == 2){
							s.obj.percent.push(b.result.text);
						} else{
							s.obj.percent[3] = b.result.text;
						}
						console.log(("sinoni"+s.fn+" :"+b.result.text));
						s.obj.logs.push("Время выполнения: "+((new Date().getTime() - Number(s.start)) / 1000)+" сек.")
						s.obj.timeE = new Date().getTime();
						s.obj.end = true;
						if(s.fn == 3){
							func3 = true;
							controllerFunc.func3.timeEnd = 0; 
						} else{	
							controllerFunc.func4.timeEnd = 0;
							func4 = true;
						}
						sinomiFlag = true;
						// flag = false;
					} else{
						if(b.error.code == 181){
							setTimeout(result1, 2000);
						} else{
							if(b.error.code == 183){
								s.obj.percent.push("Ошибка "+b.error.code+"( Ошибка сервера. Попробуйте позднее ).");
								s.obj.logs.push("Время выполнения: "+((new Date().getTime() - Number(s.start)) / 1000)+" сек.")
								s.obj.end = true;
								if(s.fn == 3){
									func3 = true;
									controllerFunc.func3.timeEnd = 0; 
								} else{	
									controllerFunc.func4.timeEnd = 0;
									func4 = true;
								}
								sinomiFlag = true;
							}
						}
					}
				});
			}
			if(body != undefined){
				if(body.result != undefined){
					await result1();
				}
			} else{
				if(body == undefined){
					s.obj.percent.push("Сервер не отвечает, попробуйте позже.");
					s.obj.logs.push("Время выполнения: "+((new Date().getTime() - Number(s.start)) / 1000)+" сек.")
					s.obj.end = true;
					s.fn == 3 ? func3 = true : func4 = true;
					sinomiFlag = true;
				}
			}
		});
	}
	tParseYnic();
}
 
async function translate1(o){
	var inter1, inter2, inter3, inter4;
	async function nextTransl(){
		o.obj.logs.push("Результат перевода \""+o.obj.value+"\" на английский - "+ o.resGoog);
		async function endPars(){
			async function endPars1(){
				inter1 = setInterval(async () => {
					if(sinomiFlag == true){
						sinomiFlag = false;
						clearInterval(inter1);
						await sinoni(o);
					}
				}, 1500);					
			}
			function yandex(t){
				request({
					url: 'https://translate.yandex.net/api/v1.5/tr.json/translate?lang=en-ru',
					method: 'POST',
					host: 'translate.yandex.net',
					form: {text: t, key: 'trnsl.1.1.20190522T170939Z.035ab62ecfca7e8e.f9ff10ab7664c1751225be85e0e4e63f7c978836'},
					json: true
				}, (err, resur, body) => {
					if(body.text[0] != undefined){
						if(body.text[0] != ""){
							o.obj.percent.push(body.text[0]);
							o.resYa = body.text[0];
							console.log((o.fn+" :"+o.resYa));
							endPars1();
						}
					} else{
						yandex(o.resGoogEn);			
					}
				});
			}
			yandex(o.resGoogEn);
		}
		endPars();
	}
	o.f = false;
	o.obj.percent = [];
	o.obj.logs.push("Открытие гугл-переводчика");
	await o.google.goto("https://translate.google.com/?hl=ru#view=home&op=translate&sl=ru&tl=en&text=").insert("#source", o.obj.value);
	if(o.count == 0){
		// await o.bing.goto("https://www.bing.com/translator");
		// await o.paraphrase.goto("https://www.paraphrase-online.com/").evaluate(() => {
		// 	document.getElementById("field1").setAttribute("maxlength", 20000);
		// });
	}
	inter2 = setInterval(async () => {
		o.resGoogEn = await o.google.evaluate(() => {	
			return document.querySelector(".result-shield-container .translation").innerText;
		}).catch((err) => {});
		if(o.resGoogEn != "" && o.resGoogEn != undefined){
			console.log((o.fn+" :"+o.resGoogEn));
			clearInterval(inter2);
			// await o.paraphrase.wait("#field1").type("#field1", "")
			// 	.insert("#field1", o.resGoogEn)
			// 	.click("#synonym");
			// inter3 = setInterval(async () => {
			// 	o.resParaph = await o.paraphrase.evaluate(() => {
			// 		let r = document.querySelector("#field2").innerText;
					// return r;
				// }).catch((err) => {});
				// if(o.resParaph != "" && o.resParaph != null){
					// o.resGoog = "";
					// clearInterval(inter3);
					// await o.paraphrase.evaluate(() => {
						// document.location.reload();
					// 	document.querySelector("#field2").innerText = "";
					// 	document.querySelector("#field1").value = "";
					// }).catch((err) => {});
					// console.log((o.fn+" :"+o.resParaph));
					await o.google.goto("https://translate.google.com/?hl=en#view=home&op=translate&sl=en&tl=ru&text=").insert("#source", o.resGoogEn);
					inter4 = setInterval(async () => {
						o.resGoogRu = await o.google.evaluate(() => {
							return document.querySelector(".result-shield-container .translation").innerText;
						}).catch((err) => {});
						if(o.resGoogRu != "" && o.resGoogRu != undefined){
							o.obj.percent.push(o.resGoogRu);
							o.obj.status = "percent";
							clearInterval(inter4);
							console.log((o.fn+" :"+o.resGoogRu));
							nextTransl();
						}
					}, 700);
				// }
			// }, 700);	
		}
	}, 700);
}

async function translate2(o){
	var inter1, inter2, inter3, inter4;
	async function nextTransl(){
		o.obj.logs.push("Результат перевода \""+o.obj.value+"\" на английский - "+ o.resGoog);
		async function endPars(){
			async function endPars1(){
				inter1 = setInterval(async () => {
					if(sinomiFlag == true){
						sinomiFlag = false;
						clearInterval(inter1);
						await sinoni(o);
					}
				}, 1500);					
			}
			function yandex(t){
				request({
					url: 'https://translate.yandex.net/api/v1.5/tr.json/translate?lang=en-ru',
					method: 'POST',
					host: 'translate.yandex.net',
					form: {text: t, key: 'trnsl.1.1.20190522T170939Z.035ab62ecfca7e8e.f9ff10ab7664c1751225be85e0e4e63f7c978836'},
					json: true
				}, (err, resur, body) => {
					if(body.text[0] != undefined){
						if(body.text[0] != ""){
							o.obj.percent.push(body.text[0]);
							o.resYa = body.text[0];
							console.log((o.fn+" :"+o.resYa));
							endPars1();
						}
					} else{
						yandex(o.resGoogEn);			
					}
				});
			}
			yandex(o.resGoogEn);
		}
		endPars();
	}
	o.f = false;
	o.obj.percent = [];
	o.obj.logs.push("Открытие гугл-переводчика");
	await o.google.goto("https://translate.google.com/?hl=ru#view=home&op=translate&sl=ru&tl=en&text=").insert("#source", o.obj.value);
	if(o.count == 0){
		// await o.bing.goto("https://www.bing.com/translator");
		// await o.paraphrase.goto("https://www.paraphrase-online.com/").evaluate(() => {
		// 	document.getElementById("field1").setAttribute("maxlength", 20000);
		// });
	}
	inter2 = setInterval(async () => {
		o.resGoogEn = await o.google.evaluate(() => {	
			return document.querySelector(".result-shield-container .translation").innerText;
		}).catch((err) => {});
		if(o.resGoogEn != "" && o.resGoogEn != undefined){
			console.log((o.fn+" :"+o.resGoogEn));
			clearInterval(inter2);
			// await o.paraphrase.wait("#field1").type("#field1", "")
			// 	.insert("#field1", o.resGoogEn)
			// 	.click("#synonym");
			// inter3 = setInterval(async () => {
			// 	o.resParaph = await o.paraphrase.evaluate(() => {
			// 		let r = document.querySelector("#field2").innerText;
					// return r;
				// }).catch((err) => {});
				// if(o.resParaph != "" && o.resParaph != null){
					// o.resGoog = "";
					// clearInterval(inter3);
					// await o.paraphrase.evaluate(() => {
						// document.location.reload();
					// 	document.querySelector("#field2").innerText = "";
					// 	document.querySelector("#field1").value = "";
					// }).catch((err) => {});
					// console.log((o.fn+" :"+o.resParaph));
					await o.google.goto("https://translate.google.com/?hl=en#view=home&op=translate&sl=en&tl=ru&text=").insert("#source", o.resGoogEn);
					inter4 = setInterval(async () => {
						o.resGoogRu = await o.google.evaluate(() => {
							return document.querySelector(".result-shield-container .translation").innerText;
						}).catch((err) => {});
						if(o.resGoogRu != "" && o.resGoogRu != undefined){
							o.obj.percent.push(o.resGoogRu);
							o.obj.status = "percent";
							clearInterval(inter4);
							console.log((o.fn+" :"+o.resGoogRu));
							nextTransl();
						}
					}, 700);
				// }
			// }, 700);	
		}
	}, 700);
}

var invait1 = 0, invait2 = 0;
setInterval(async () => {
	if(bd.length > 0){
		if(func1 == true || func2 == true || func3 == true || func4 == true){
			var d = func1 ? 1 : 2;
			for(var u = 0; u < bd.length; u++){
				if(bd[u].active == false && bd[u].status != "edit"){
					if(bd[u].status != "deleted"){
						// console.log(bd[u]);
						if(bd[u].translate == "false"){
							switch(d){
								case 1:
									if(func1 == true){
										start1 = new Date().getTime();
										if(nightmare.ending == true){
											nightmare = Nightmare({show: false, pollInterval: 30,  waitTimeout: 120000, typeInterval: 30});	
										}
										controllerFunc.func1.timeEnd = 0;
										bd[u].active = true;
										bd[u].f = "func1";
										bd[u].status = "load";
										bd[u].nomer = u;

										bd[u].logs.push("Проверка началась в 1ой функции");
										queues_bd[0] = u;
										time1 = 0;
										await emulSite1();
									}
								break;
								case 2:
									if(func2 == true){
										start2 = new Date().getTime();
										if(night.ending == true){
											night = Nightmare({show: false, pollInterval: 30,  waitTimeout: 120000, typeInterval: 30});	
										}
										controllerFunc.func2.timeEnd = 0;
										bd[u].active = true;
										bd[u].f = "func2";
										bd[u].status = "load";
										bd[u].nomer = u;
										bd[u].logs.push("Проверка началась во 2ой функции");
										queues_bd[1] = u;
										// console.log(bd[u]);
										time2 = 0;
										// bot.sendMessage(bd[u].id, "Ожидайте результата");
										await emulSite2();
									}
								break;
							}
						} else{
							if(func3 == true || func4 == true){
								d = func3 ? 1 : 2;
								switch(d){
									case 1: 
										if(func3 == true){
											start3 = new Date().getTime();
											if(google1.ending == true){
												google1 = Nightmare({show: false, pollInterval: 30,  waitTimeout: 120000, typeInterval: 30});	
											}
											controllerFunc.func3.timeEnd = 0;
											bd[u].active = true;
											bd[u].f = "func3";
											bd[u].status = "load";
											bd[u].nomer = u;
											bd[u].logs.push("Перевод текста начался");
											func3 = false;
											translate1({obj: bd[u], count: invait1, fn: 3, start: start3, resGoogEn: '', resGoogRu: '', resParaph: '', resBing: '', resYa: '', f: func3, google: google1});
											invait1++;
										}
										break;
									case 2:
										if(func4 == true){
											start4 = new Date().getTime();
											if(google2.ending == true){
												google2 = Nightmare({show: false, pollInterval: 30,  waitTimeout: 120000, typeInterval: 30});	
											}
											controllerFunc.func4.timeEnd = 0;
											bd[u].active = true;
											bd[u].f = "func4";
											bd[u].status = "load";
											bd[u].nomer = u;
											bd[u].logs.push("Перевод текста начался");
											func4 = false;
											translate2({obj: bd[u], count: invait2, fn: 4, start: start4, resGoogEn: '', resGoogRu: '', resParaph: '', resBing: '', resYa: '', f: func4, google: google2});
											invait2++;
										}
										break; 
								}
							}
						}
					} else{

					}
				}
			}
		}
	}

	Object.keys(controllerFunc).forEach((v, k) => {
		if(controllerFunc[v].timeEnd == 7200 && controllerFunc[v].timeEnd < 8000){
			switch(k){
				case 0: nightmare.end(() => {}).then(); console.log("nightmare sleep"); break;
				case 1: night.end(() => {}).then(); console.log("night sleep"); break;
				case 2: google1.end(() => {}).then(); console.log("google1 sleep"); break;
				case 3: google2.end(() => {}).then(); console.log("google2 sleep"); break;				
			}
			controllerFunc[v].timeEnd = 10000;
		}
		if(controllerFunc[v].timeEnd != 10000){
			controllerFunc[v].timeEnd++;
		}
	});
	// console.log(controllerFunc);
}, 1000);

setInterval(() => {
	var h = 1, inspect;
	bd.forEach((v, k) => {
		if(bd[k].status == "wait"){
			bd[k].wait = h;
			h++;
		}
	});
	io.sockets.emit("data", bd);
}, 1100);


io.sockets.on("connection", function(socket){
	socket.on("message", async function(msg){
		// console.log("serv2");
		if(msg.new == true){
			var pr = bd.filter((w) => {return (w.id == msg.id && w.time == msg.time && w.user == msg.user)});
			if(pr.length == 0){
				bd.push({value: msg.text, id: msg.id, active: false, percent: '', user: msg.user, time: msg.time, status: 'wait', f: '', nomer: 0, wait: '', timeE: '', logs: ["Добавлено в очередь"], translate: msg.translate, end: false});
			}
		}
		if(msg.del == true){
			bd.forEach((v, k) => {
				if(v.id == msg.id && v.time == msg.time && v.user == msg.user){
					bd[k].status = "deleted";
					if(bd[k].f != ""){
						bd[k].f = "";
					}
				}
			});
		}
		if(msg.edit == true){
			bd.forEach((v, k) => {
				if(v.id == msg.id && v.time == msg.time && v.user == msg.user){
					bd[k].status = "edit";
					bd[k].active = false;
					if(bd[k].f != ""){
						switch(bd[k].f){
							case "func1": func1 = true; break;
							case "func2": func2 = true; break;
						}
						bd[k].f = "";
					}
				}
			});
		}
		if(msg.edited == true){
			bd.forEach((v, k) => {
				if(v.id == msg.id && v.time == msg.time && v.user == msg.user){
					bd[k].status = "";
					bd[k].value = msg.text;
				}
			});
		}
		if(msg.translateResult == true){
				var search = await bd.filter((w) => {return (w.id == msg.id && w.time == msg.time && w.user == msg.user)});
				console.log(search);
				if(search.length != 0){
					await io.sockets.emit("message", {id: search[0].id, res: search[0].percent, user: search[0].user, time: search[0].time});
				}
			}
	});
});
