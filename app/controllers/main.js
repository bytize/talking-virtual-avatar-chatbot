module.exports = () => {
	const index = (req, res, next) => {
		res.render("index");
	}

	return {
		index: index
	}
};