const redis = require('redis');

module.exports = config => {
	
	return redis.createClient({
	  host: config.redis.host,
	  port: config.redis.port,
	  db: config.redis.db
	});
};