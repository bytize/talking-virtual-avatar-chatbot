const config = require("/etc/config/talking_virtual_avatar_chatbot.json");

module.exports = () => {
	const env = process.env.NODE_ENV;
	const redis = config.redis;

	const awsCredentials = config.awsCredentials;

	return {
		appName: "Talking Virtual Avatar Chatbot",
		redis: redis[env],
		awsCredentials: awsCredentials[env],
		facebook: config.facebook
	}
};