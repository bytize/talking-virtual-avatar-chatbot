const lex = require("../components/lex")();
const pollyClient = require('../components/polly')();

module.exports = () => {
	
	const chatWithText = (req, res, next) => {
		lex.postText(req.body.text,req.session.user.id,{},function(err, data) {
			if (err) {
				res.send(err);
			} else {
				console.log(data);
				res.send(data);
			}
		});
	}

	const getAudio = (req, res) => {
		pollyClient.getMp3(req.query.text,(err,data)=>{
			if(err){
				res.send(err);
			} else if (data.AudioStream instanceof Buffer){
				res.writeHead(200, {'Content-Type': 'audio/mpeg'});
				res.end(data.AudioStream);
			} else {
				res.send({error: "Something went wrong"});
			}
		});
	}

	const getSpeechMarks = (req, res) => {
		pollyClient.getSpeechMarks(req.body.text,(err,data)=>{
			if(err){
				res.send(err);
			} else {
				var marks = data.AudioStream.toString('utf8');
				marks = "["+marks+"]";
				marks = marks.replace(new RegExp("}\n{","g"), "},{");
				marksJson = JSON.parse(marks);
				var frames = [];
				var words = [];
				var counter = 0;
				var wordCounter = 0;
				for (var i = 0; i < marksJson.length; i++) {
					var tmp = {};
					if(marksJson[i].type == "word" && wordCounter < 6){
						words.push(marksJson[i].value.toLowerCase());
						wordCounter++;
					}
					if(marksJson[i].type == "word" && !frames[counter]){
						tmp.time = marksJson[i].time;
						tmp.start = marksJson[i].time;
						tmp.end = 0;
						frames.push(tmp);
					} else if(marksJson[i].type == "viseme" && marksJson[i].value == "sil" && frames.length){
						frames[counter].end = marksJson[i].time;
						counter++;
					}
				}
				res.send({frames: frames, words: words});
			}
		});
	}

	const login = (req, res) => {
		if(req.body.id)
			req.session.user = req.body;
		res.send({status: "success"});
	};

	const logout = (req, res) => {
		req.session.user = null;
		res.send({status: "success"});
	};

	return {
		chatWithText: chatWithText,
		getSpeechMarks: getSpeechMarks,
		getAudio: getAudio,
		login: login,
		logout: logout
	}
};