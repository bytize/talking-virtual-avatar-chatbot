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

	const getLexModelObject = () => {
		return  new AWS.LexModelBuildingService({
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

	const postContent = (streamObject, userId, sessionAttributes) => {
		var params = {
			botAlias: botAlias,
			botName: botName,
			contentType: 'text/plain; charset=utf-8',
			inputStream: streamObject,
			userId: userId,
			accept: 'text/plain; charset=utf-8',
			sessionAttributes: sessionAttributes
		};
		lexruntime = getLexObject();
		lexruntime.postContent(params, function(err, data) {
			if (err) {
				console.log(err);
			} else {
				console.log(data);
			}
		});
	}

	const getSlotTypeDefinitions = (intentDefinitions, callback) => {

		// first let's get a list of the slot types we need to collect
		let slotTypes = [];
		let slotTypeDefinitions = [];
		lexModels = getLexModelObject();
		intentDefinitions.forEach(function(intentDefinition) {

			intentDefinition.slots.forEach(function(slot) {

				if (slot.slotTypeVersion) {

					// we only want custom slot types
					slotTypes.push({
						slotType: slot.slotType,
						slotTypeVersion: slot.slotTypeVersion
					});
				}
			});
		});

		if (slotTypes.length > 0) {
			// now let's get the slotTypes we need
			slotTypes.forEach(function(slotType) {

				let params = {
					name: slotType.slotType,
					version: slotType.slotTypeVersion
				};
				lexModels.getSlotType(params, function(err, slotTypeDefinition) {

					if (err) {
						console.error(err);
						callback(err, null);

					} else {

						slotTypeDefinitions.push(slotTypeDefinition);
						// callback if we have collected all the definitions we need
						if (slotTypeDefinitions.length >= slotTypes.length) {
							callback(null, slotTypeDefinitions);
						}
					}
				});
			});
		} else {
			callback(null, []);
		}
	};

	const getIntentDefinitions = (intents, callback)=>{

		let intentDefinitions = [];
		lexModels = getLexModelObject();
		intents.forEach(function(intent) {

			let params = {
				name: intent.intentName,
				version: intent.intentVersion
			};
			lexModels.getIntent(params, function(err, intentDefinition) {

				if (err) {
					callback(err, null);

				} else {

					// console.log(`adding intent ${intentDefinition.name}`);
					intentDefinitions.push(intentDefinition);
					// callback if we have collected all the definitions we need
					if (intentDefinitions.length >= intents.length) {

						callback(null, intentDefinitions);
					}
				}
			});
		});
	};

	const getBotDefinition = (callback) => {

		let params = {
			name: botName,
			versionOrAlias: "$LATEST"
		};
		lexModels = getLexModelObject();
		lexModels.getBot(params, function(err, botDefinition) {

			if (err) {
				callback(err, null);

			} else {

				getIntentDefinitions(botDefinition.intents, function(err, intentDefinitions) {

					if (err) {
						console.log(err);
						callback(err, null);

					} else {
						botDefinition.dependencies = {};
						botDefinition.dependencies.intents = intentDefinitions;
						getSlotTypeDefinitions(botDefinition.dependencies.intents, function(err, slotTypeDefinitions) {

							if (err) {
								console.log(err);
								callback(err, null);

							} else {
								botDefinition.dependencies.slotTypes = slotTypeDefinitions;
								callback(null, botDefinition);
							}
						});
					}
				});
			}
		});
	};

	return {
		postText: postText,
		postContent: postContent,
		getBotDefinition: getBotDefinition
	}
};