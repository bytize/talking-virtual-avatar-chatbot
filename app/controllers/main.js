const fs = require('fs');
module.exports = () => {
	const index = (req, res, next) => {
		res.render("index");
	}

	const animate = (req, res, next) => {
		res.render("animate");
	}

	const video = (req, res, next) => {
		var path = "./public/images/"+req.params.ls+".mp4";
		var stat = fs.statSync(path);
		var total = stat.size;
			if (req.headers['range']) {
			var range = req.headers.range;
			var parts = range.replace(/bytes=/, "").split("-");
			var partialstart = parts[0];
			var partialend = parts[1];

			var start = parseInt(partialstart, 10);
			var end = partialend ? parseInt(partialend, 10) : total-1;
			var chunksize = (end-start)+1;
			console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

			var file = fs.createReadStream(path, {start: start, end: end});
			res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
			file.pipe(res);
		} else {
			res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
			fs.createReadStream(path).pipe(res);
		}
	}

	return {
		index: index,
		animate: animate,
		video: video
	}
};