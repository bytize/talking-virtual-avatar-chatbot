exports.assetPath = path => {
	const manifest = require("../../public/dist/manifest.json");
	if (manifest[path] === undefined) {
      return path;
    } else {
      return manifest[path];
    }
};