$(document).ready(function(){

	// a,a14
	var actions = {
		"a": {
			type: "idle",
			start: 0,
			end: 90
		},
		"a1": {
			type: "left_normal",
			start: 90,
			end: 180
		},
		"a4": {
			type: "explain_left",
			start: 370,
			end: 470
		},
		"a7": {
			type: "me_left_round",
			start: 645,
			end: 755
		},
		"a9": {
			type: "explain_you",
			start: 855,
			end: 945
		},
		"a13": {
			type: "explain_you_alt",
			start: 1200,
			end: 1285
		},
		"a14": {
			type: "hands_down", // Yes you can but 
			start: 1285,
			end: 1400
		}
	};

	var enableSpeech = localStorage.getItem("speech");
	if(enableSpeech == null){
		localStorage.setItem("speech",true);
		enableSpeech = 'true';
	}

	var enableCharAnimation = localStorage.getItem("avatar");
	if(enableCharAnimation == null){
		localStorage.setItem("avatar",true);
		enableCharAnimation = 'true';
	}
	enableSpeech = (enableSpeech == 'true');
	enableCharAnimation = (enableCharAnimation == 'true');
	
	$('input[value="speech"]').prop("checked",enableSpeech);
	$('input[value="avatar"]').prop("checked",enableCharAnimation);

	var pre = prelodr({
		container: $(".chat")[0]
	});

	var listening = false;
	var commands = {'start listening': function(){
		toggleChatInput(true);
	}, 'stop listening': function(){
		toggleChatInput(false);
	}};

	function toggleChatInput(prop){
		if($("#js_facebook").hasClass("hide")){
			listening = prop;
			$("#js_message").prop("disabled",prop);
			$("#js_send").prop('disabled', prop);
			$("#js_animate").prop("disabled",prop);
			$("#js_message_animate").prop("disabled",prop);
			if(prop){
				$('#js_siriwave').show();
				initSiriWave();
			} else if(siriwave) {
				$('#js_siriwave').html('');
				$('#js_siriwave').hide();
				siriwave.stop();
				siriwave = null;
			}
		}
	}

	var siriwave = null;

	function initSiriWave(){
		siriwave = new SiriWave({
			width: 259,
			height: 40,
			speed: 0.2,
			amplitude: 0.5,
			container: document.getElementById('js_siriwave'),
			autostart: true,
			color: "#000"
		});
	}

	if(enableSpeech)
	{
		initSpeechRec();
	}

	function initSpeechRec(){
		annyang.debug();
		annyang.addCommands(commands);
		annyang.start();
	}

	function intro(){
		if($("#js_animate").length != 0) return;
		if(!$("#js_facebook").hasClass("hide")){
			var text = "Hi, My name is Alize. Please login with your facebook account for me to help you buy a new Car.";
			insertBotMessage(text);
			talk(text);
		} else if($("#js_message").data('user') != ""){
			greetUser($("#js_message").data('user'));
		}
	}

	var startFrame = actions.a.start;
	var endFrame = actions.a.end;
	var speechMarks = [];
	var speechMarkIndex = 0;
	var framesRendered = 0;
	var nextAction = actions.a;
	var idleActionCounter = 0;
	var avatarDialog = [];

	var audioFrames = 0;

	var audio;
	var openVideo,closeVideo;
	var playAudio,isOpenVideoDownloaded,isCloseVideoDownloaded,isVideosDownloaded = false;
	
	$("#js_animate").click(function(e){
		e.preventDefault();
		animateMessageSubmit();
	});

	$("#js_message_animate").keypress(function (e) {
	  if (e.which == 13) {
	    animateMessageSubmit();
	  }
	});

	$("#js_send").click(function(e){
		e.preventDefault();
		messageSubmit();
	});

	$("#js_message").keypress(function (e) {
	  if (e.which == 13) {
	    messageSubmit();
	  }
	});

	function messageSubmit(){
		var text = $("#js_message").val();
		if(text!="" && text.length < 300){
			$("#js_message").val('');
			insertUserMessage(text);
			getBotResponse(text);
		}
	}

	function getBotResponse(text){
		$.ajax({
			url: '/api/chat-text',
			data: {text:text},
			dataType: "JSON",
			method: "POST",
			success: function(data){
				if(data.message){
					insertBotMessage(data.message);
					insertResponseCard(data);
					talk(data.message);
				}
			}
		})
	}


	function insertResponseCard(data){
		if(data.responseCard){
			var responseCards = data.responseCard;
			if(responseCards.genericAttachments.length){
				var responseCard = responseCards.genericAttachments[0];
				if(responseCard.buttons.length){
					var buttons = responseCard.buttons;
					var type = responseCard.subTitle;
					var html = "";
					if(type == "buttonImage"){
						html = renderButtonImage(buttons);
					} else {
						html = renderButton(buttons);
					}
					if(html!="")
						insertBotMessage(html);
				}
			}

		}
	}

	function renderButtonImage(buttons){
		var html = "<ul>";
		$.each(buttons,function(i,v){
		 	html = html+"<li><a class='js_click' data-value='"+v.value+"' href='#'>"+v.text+"</a></li>"
		});
		return html = html + "</ul>";
	}
	function renderButton(buttons){
		var html = "<ul>";
		$.each(buttons,function(i,v){
		 	html = html+"<li><a class='js_click' data-value='"+v.value+"' href='#'>"+v.text+"</a></li>"
		});
		return html = html + "</ul>";
	}

	$(document).on("click",".js_click",function(e){
		e.preventDefault();
		var text = $(this).attr("data-value");
		$(this).closest("ul").find("a").removeClass("js_click");
		insertUserMessage(text);
		getBotResponse(text);
	});

	function animateMessageSubmit(){
		var text = $("#js_message_animate").val();
		if(text!="" && text.length < 300){
			$("#js_message_animate").val('');
			insertBotMessage(text);
			talk(text);
		}
	}

	$(window).on('beforeunload blur', function(){
		resetVideos();
		resetAudio();
	});

	$(window).focus(function(){
		triggerVideoDownloaded();
	});

	function resetVideos(){
		startFrame = 0;
		endFrame = 90;
		nextAction = actions.a;

		if(openVideo && !openVideo.video.paused)
		{
			openVideo.video.pause();
	  		openVideo.stopListen();
	  		openVideo.seekTo({frame:startFrame});
		}

		if(closeVideo && !closeVideo.video.paused)
		{
			closeVideo.video.pause();
	  		closeVideo.stopListen();
	  		closeVideo.seekTo({frame:startFrame});
		}
	}

	$(document).on("click","#js_start",function(e){
		e.preventDefault();
		init();
		$(this).parent().hide();
	});

	

	function init(){
		openVideo = initVideo('js_open',renderOpen);
		isOpenVideoDownloaded = true;
		triggerVideoDownloaded();
		
		closeVideo = initVideo('js_close',renderClose);
		isCloseVideoDownloaded = true;
		triggerVideoDownloaded();
	}

	var previousFrameOpen = 0;
	function renderOpen(frame){
		if(previousFrameOpen != frame){
			framesRendered++;
			if(frame == (endFrame - 2)){
				if(nextAction.type == "left_normal" || 
					nextAction.type == "explain_left" ||  
					nextAction.type == "me_left_round" ||  
					nextAction.type == "explain_you" ||  
					nextAction.type == "explain_you_alt"){
					nextAction = actions.a;
				} else if(idleActionCounter%5 == 0 && idleActionCounter !=0){
					nextAction = actions.a14;
				} else {
					nextAction = actions.a;
				}
				idleActionCounter++;
			}
			render(openVideo,frame);
		}
		previousFrameOpen = frame;
	}

	var previousFrameClose = 0;
	function renderClose(frame){
		if(previousFrameClose != frame){
			if(playAudio && (frame == (endFrame -2) || audio.playState))
			{
				setAction();
				sync(frame);
			}
			render(closeVideo,frame);
		}
		previousFrameClose = frame;
	}

	var isActionSet = false;
	function setAction(){
		if(((audio.duration/1000)*50) > 100 && !isActionSet){
			isActionSet = true;
			if($.inArray("hi",avatarDialog) != -1){
				nextAction = actions.a7;
			} else if($.inArray("what",avatarDialog) != -1 || $.inArray("which",avatarDialog) != -1){
				nextAction = actions.a13;
			} else if($.inArray("how",avatarDialog) != -1){
				nextAction = actions.a9;
			} else if($.inArray("choose",avatarDialog) != -1 || 
				$.inArray("he",avatarDialog) != -1 ||
				$.inArray("she",avatarDialog) != -1 ||
				$.inArray("they",avatarDialog) != -1 ||
				$.inArray("this",avatarDialog) != -1 ||
				$.inArray("them",avatarDialog) != -1 ||
				$.inArray("there",avatarDialog) != -1 ||
				$.inArray("it",avatarDialog) != -1 ||
				$.inArray("her",avatarDialog) != -1 ||
				$.inArray("him",avatarDialog) != -1 ||
				$.inArray("select",avatarDialog) != -1){
				nextAction = actions.a1;
			} else if($.inArray("you",avatarDialog) != -1){
				nextAction = actions.a4;
			}
		}
	}


	function switchAction(action){
		openVideo.video.pause();
		openVideo.stopListen();
		closeVideo.video.pause();
		closeVideo.stopListen();
		startFrame = action.start;
		endFrame = action.end;
		openVideo.seekTo({frame: startFrame});
		openVideo.video.play();
		openVideo.listen("frame");
		closeVideo.seekTo({frame: startFrame});
		closeVideo.video.play();
		closeVideo.listen("frame");
	}	

	function render(video,frame){
		if(frame == endFrame){
			if(nextAction){
				switchAction(nextAction);
			}
         	video.seekTo({ frame: startFrame });
        }
	}

	function pauseSpeechRec(){
		if(enableSpeech && annyang.isListening() && listening){
			annyang.pause();
		}
	}

	function resumeSpeechRec(){
		if(enableSpeech && listening && !annyang.isListening()){
			annyang.resume();
		}
	}

	function sync(frame){
		if(playAudio && speechMarks.length && speechMarkIndex < speechMarks.length){
			if(!audio.playState){
				audio.play();
				pre.hide();
				pauseSpeechRec();
			}
			
			audioFrames++;
			var time = speechMarks[speechMarkIndex].time;
			var endTime = speechMarks[speechMarkIndex].end;
			var startTime = speechMarks[speechMarkIndex].start;
			var startTimeFrame = Math.round((startTime/1000)*50);
			var endTimeFrame = Math.round((endTime/1000)*50);
			if(audioFrames >= startTimeFrame && audioFrames <= endTimeFrame){
				$("#js_close").addClass("hide");
				$("#js_open").removeClass("hide");
				if(audioFrames == endTimeFrame){
					speechMarkIndex++;
				}
			} else {
				$("#js_open").addClass("hide");
				$("#js_close").removeClass("hide");
			}
		} else {
			resetAudio();
		}
	}

	var introInitiated = false;

	function triggerVideoDownloaded(){
		isVideosDownloaded = isOpenVideoDownloaded && isCloseVideoDownloaded;
		if(isVideosDownloaded){
			$('.canvasAvatar').removeClass("canvasAvatarLoading");
			if(enableCharAnimation){
				initVideos();
			}

			if(!introInitiated){
				intro();
				introInitiated = true;
			}
		}
	}


	function initVideos(){
		nextAction = actions.a;
		openVideo.seekTo({frame: 0});
		openVideo.video.play();
		openVideo.listen("frame");

		closeVideo.seekTo({frame: 0});
		closeVideo.video.play();
		closeVideo.listen("frame");
	}

	function initVideo(id,callback){
		return VideoFrame({
		    id : id,
		    frameRate: 25,
		    callback : callback
		});
	}

	function talk(text){
		if(enableCharAnimation) {
			if(!isVideosDownloaded) return;
			initSoundManager("/api/audio?text="+text+"&t="+new Date().getTime(),text);
		}
	}

	function resetAudio(){
		speechMarks = [];
		playAudio = false;
		speechMarkIndex = 0;
		audioFrames = 0;
		avatarDialog = [];
		isActionSet = false;
		$("#js_open").addClass("hide");
		$("#js_close").removeClass("hide");
		if(audio && soundManager.getSoundById('audio')){
			soundManager.destroySound('audio');
		}
		audio = null;
		pre.hide();
		resumeSpeechRec();
	}

	function getSpeechMarks(text,callback){
		$.ajax({
			url: "/api/speech-marks",
			method: "POST",
			data: {
				text: text
			},
			dataType: "JSON",
			success: function(data){
				callback(data);
			}
		})
	}

	function insertBotMessage(text){
		var time = getTime();
		var bubble = $('.message:last-child .message-right').length?"no-bubble":"";

		var html = '<div class="message clearfix"><div class="message-body message-right '+bubble+'">'+text+'<div class="message-meta"><small>'+time+'</small></div></div></div>';
		$('.chat-messages').append(html);
		$('.chat-container').animate({scrollTop: $('.chat-container')[0].scrollHeight},"fast");
	}

	function insertUserMessage(text){
		var time = getTime();
		var bubble = $('.message:last-child .message-left').length?"no-bubble":"";

		var html = '<div class="message clearfix"><div class="message-body message-left '+bubble+'">'+text+'<div class="message-meta"><small>'+time+'</small></div></div></div>';
		$('.chat-messages').append(html);
		$('.chat-container').animate({scrollTop: $('.chat-container')[0].scrollHeight},"fast");
	}

	function getTime(){
		var time = new Date();
		return ("0" + time.getHours()).slice(-2)   + ":" + ("0" + time.getMinutes()).slice(-2);
	}

	var startConversation = true;
	function initSoundManager(url, text){
		console.log("soundManager");
		pre.show("Loading...");
		audio = soundManager.createSound({
		  id: 'audio',
		  url: url,
		  autoLoad: true,
		  autoPlay: false,
		  stream: false,
		  onload: function() {
		    getSpeechMarks(text,function(data){
				avatarDialog = data.words;
				speechMarks = data.frames;
				playAudio = true;
				speechMarkIndex = 0;
				audioFrames = 0;
			});
		  },
		  onfinish: function() {
		  	if(!startConversation){
				startConversation = true;
				getBotResponse("buy a new car");
			}
		    resetAudio();
		  }
		});
	}

	$(document).on("facebook:init",".fb-root", function() {
		initFacebookBtn();
	});


	function initFacebookBtn(){
		$('#js_facebook').click(function(e){
			e.preventDefault();
			FB.login(function(response) {
			    if (response.authResponse) {
			     FB.api('/me', function(response) {
			     	login(response.id,response.name);
			     });
			    } else {
			     	console.log('User cancelled login or did not fully authorize.');
			    }
			});
		});

		$('#js_logout').click(function(e){
			e.preventDefault();
			logout();
		});
	}

	function login(id, name){
		$.ajax({
			url: "/api/login",
			data: {id: id, name: name},
			method: "post",
			dataType: "JSON",
			success: function(data){
				if(data.status == "success"){
					$('#js_facebook').addClass("hide");
					$('.chat-input .input-group').removeClass("hide");
					$('.chat header img').attr("src","https://graph.facebook.com/"+id+"/picture?type=small");
					$('.chat header h3').text(name);
					$('.chat .dropdown').removeClass("hide");
					greetUser(name);
				}
			}
		})
	}

	function greetUser(name){
		var text = "Hi "+name+", I will assist you to select a brand new car.";
		insertBotMessage(text);
		talk(text);
		if(!enableCharAnimation){
			getBotResponse("buy a new car");
		} else {
			startConversation = false;
		}
	}

	function logout(id, name){
		$.ajax({
			url: "/api/logout",
			method: "post",
			dataType: "JSON",
			success: function(data){
				if(data.status == "success"){
					$('.chat-messages').html('');
					$('#js_facebook').removeClass("hide");
					$('.chat-input .input-group').addClass("hide");
					$('.chat header img').attr("src","/images/no-user.jpg");
					$('.chat header h3').text("Hi, Guest");
					$('.chat .dropdown').addClass("hide");
					FB.logout(function(response) {});
					intro();
					$('#js_siriwave').hide();
				}
			}
		});
		
	}

	annyang.addCallback('result', function(results) {
		if($("#js_facebook").hasClass("hide")){
			results = $.map(results, $.trim);
			if(results.length && !($.inArray("start listening",results) != -1 || $.inArray("stop listening",results) != -1 && listening)){
				insertUserMessage(results[0]);
				getBotResponse(results[0]);
			}
		}
	});

	$(document).on("click",".js_avatar_options",function(e){
		var checked = $(this).is(":checked");
		localStorage.setItem($(this).val(), checked);
		$(this).attr("checked",checked);
		if($(this).val() == "speech" && checked){
			enableSpeech = true;
			initSpeechRec();
		}else if($(this).val() == "avatar" && checked){
			enableCharAnimation = true;
			initVideos();
		} else if($(this).val() == "avatar" && !checked){
			enableCharAnimation = false;
			resetVideos();
			resetAudio();
		}else if($(this).val() == "speech" && !checked){
			enableSpeech = false;
			if(annyang.isListening())
				annyang.abort();
			toggleChatInput(false);
		}
	});

});