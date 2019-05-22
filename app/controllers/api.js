const lex = require("../components/lex")();
const pollyClient = require('../components/polly')();
const cars = require("../controllers/cars.json");
const Fuse = require("fuse-js-latest");

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

	const chatWithAudio = (req, res, next) => {
		res.send("chatWithAudio");
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

	const getBotDefinition = (req,res) => {
		lex.getBotDefinition((err, botDefinition)=>{
			res.send(botDefinition);
		})
	};


	const getCars = (req,res) => {
		res.send(cars);
	};

	const getBrands = (req,res) => {
		var lookup = {};
		var items = cars;
		var result = [];

		for (var item, i = 0; item = items[i++];) {
		  var name = item.brand_name;

		  if (!(name in lookup)) {
		    lookup[name] = 1;
		    var tmp = {};
		    tmp.id = item.brand_id;
		    tmp.name = item.brand_name;
		    result.push(tmp);
		  }
		}
		res.send(result);
	};

	const getCarsByBrand = (req,res) => {
		var id = req.params.id;
		var items = cars;
		var result = [];

		for (var item, i = 0; item = items[i++];) {
		  var brand_id = item.brand_id;
		  if (brand_id == id) {
		    result.push(item);
		  }
		}
		res.send(result);
	};

	const getCarsByBrandBodyType = (req,res) => {
		var brandId = req.params.brandId;
		var bodyType = req.params.bodyType;
		var id = req.params.id;
		var items = cars;
		var result = [];

		for (var item, i = 0; item = items[i++];) {
		  var brand_id = item.brand_id;
		  var body_type_id = item.body_type_id;
		  if (brand_id == brandId && body_type_id == bodyType) {
		    result.push(item);
		  }
		}
		res.send(result);
	};

	const getCarsByBodyType = (req,res) => {
		var id = req.params.id;
		var items = cars;
		var result = [];
		for (var item, i = 0; item = items[i++];) {
		  var body_type_id = item.body_type_id;
		  if (body_type_id == id) {
		    result.push(item);
		  }
		}
		res.send(result);
	};

	const getCarById = (req,res) => {
		var id = req.params.id;
		var items = cars;
		var result = {};
		for (var item, i = 0; item = items[i++];) {
		  var car_id = item.car_id;
		  if (car_id == id) {
		    result = item;
		    break;
		  }
		}
		res.send(result);
	};

	const getCarByName = (req,res) => {
		var name = req.params.name;
		var options = {
		  shouldSort: true,
		  tokenize: true,
		  threshold: 0.6,
		  location: 0,
		  distance: 100,
		  maxPatternLength: 32,
		  minMatchCharLength: 1,
		  keys: [
		    "title",
		    "car_name"
		]
		};
		var fuse = new Fuse(cars, options); 
		var result = fuse.search(name);
		if(result.length){
			res.send(result[0]);
		} else {
			res.send({});
		}
		
	};

	const getBrandByName = (req,res) => {
		var name = req.params.name;
		var options = {
		  shouldSort: true,
		  tokenize: true,
		  threshold: 0.6,
		  location: 0,
		  distance: 100,
		  maxPatternLength: 32,
		  minMatchCharLength: 1,
		  keys: [
		    "title",
		    "brand_name"
		]
		};
		var fuse = new Fuse(cars, options); 
		var result = fuse.search(name);
		if(result.length){
			res.send(result[0]);
		} else {
			res.send({});
		}
	};

	const getBodyTypeByName = (req,res) => {
		var name = req.params.name;
		var options = {
		  shouldSort: true,
		  tokenize: true,
		  threshold: 0.6,
		  location: 0,
		  distance: 100,
		  maxPatternLength: 32,
		  minMatchCharLength: 1,
		  keys: [
		    "title",
		    "body_type_name"
		]
		};
		var fuse = new Fuse(cars, options); 
		var result = fuse.search(name);
		if(result.length){
			res.send(result[0]);
		} else {
			res.send({});
		}
	};

	const getBodyTypes = (req,res) => {
		var lookup = {};
		var items = cars;
		var result = [];

		for (var item, i = 0; item = items[i++];) {
		  var name = item.body_type_name;

		  if (!(name in lookup)) {
		    lookup[name] = 1;
		    var tmp = {};
		    tmp.id = item.body_type_id;
		    tmp.name = item.body_type_name;
		    result.push(tmp);
		  }
		}
		res.send(result);
	};

	const getBodyTypeById = (req,res) => {
		var id = req.params.id;
		var items = cars;
		var result = {};

		for (var item, i = 0; item = items[i++];) {
		  var body_type_id = item.body_type_id;

		  if (id == body_type_id) {
		    var tmp = {};
		    tmp.id = item.body_type_id;
		    tmp.name = item.body_type_name;
		    result = tmp;
		    break;
		  }
		}
		res.send(result);
	};

	return {
		chatWithText: chatWithText,
		chatWithAudio: chatWithAudio,
		getSpeechMarks: getSpeechMarks,
		getAudio: getAudio,
		login: login,
		logout: logout,
		getBotDefinition: getBotDefinition,
		getCars: getCars,
		getBrands: getBrands,
		getCarsByBrand: getCarsByBrand,
		getCarsByBrandBodyType: getCarsByBrandBodyType,
		getCarsByBodyType: getCarsByBodyType,
		getCarById: getCarById,
		getCarByName: getCarByName,
		getBrandByName: getBrandByName,
		getBodyTypes: getBodyTypes,
		getBodyTypeById: getBodyTypeById,
		getBodyTypeByName: getBodyTypeByName
	}
};