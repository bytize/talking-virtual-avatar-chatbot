const config = require("../config/index")();
const AWS = require("aws-sdk");

module.exports = () => {
	var creds = new AWS.Credentials(
		config.awsCredentials.accessKeyId, 
		config.awsCredentials.secretAccessKey
	);

	const botAlias = "challenge";
	const botName = "BuyNewCar";

	const getLexObject = () => {
		return  new AWS.LexRuntime({
			credentials : creds,
		    lexruntime: '2016-11-28',
		    region: 'us-east-1'
		});
	}

	const postText = (text, userId, sessionAttributes, callback) => {
		var params = {
			botAlias: botAlias,
			botName: botName, 
			inputText: text,
			userId: userId,
			sessionAttributes: sessionAttributes
		};
		lexruntime = getLexObject();

		lexruntime.postText(params, callback);
	}

	return {
		postText: postText
	}
};