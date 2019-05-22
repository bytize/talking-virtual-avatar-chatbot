const config = require("../config/index")();
const AWS = require("aws-sdk");
const Fs = require('fs');

module.exports = () => {
	var creds = new AWS.Credentials(
		config.awsCredentials.accessKeyId, 
		config.awsCredentials.secretAccessKey
	);
	const getPollyObject = () => {

		return  new AWS.Polly({
			credentials : creds,
		    signatureVersion: 'v4',
		    region: 'us-east-1'
		});
	}

	const getMp3 = (text,callback) => {
		var Polly = getPollyObject();
		let params = {
		    'Text': text,
		    'OutputFormat': 'mp3',
		    'VoiceId': 'Joanna'
		};
		Polly.synthesizeSpeech(params,callback);
	}

	const getSpeechMarks = (text,callback) => {
		var Polly = getPollyObject();
		let params = {
		    'Text': text,
		    'OutputFormat': "json",
		    'VoiceId': 'Joanna',
		    'SpeechMarkTypes': [
		    	"viseme","word"
		  	]
		};
		Polly.synthesizeSpeech(params, callback);
	}

	return {
		getMp3: getMp3,
		getSpeechMarks: getSpeechMarks
	}
};