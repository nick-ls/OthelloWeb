const fs = require("fs");
const path = require("path");
const dest = path.join(__dirname,"build");
const src = path.join(__dirname, "src");

const remove = false;

function copyFolder(source, dest) {
	let contents = [];
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, {recursive: true});
	}
	if (fs.statSync(source).isDirectory()) {
		contents = fs.readdirSync(source);
		contents.forEach(file => {
			let name = path.join(source, file);
			if (fs.statSync(name).isDirectory()) {
				copyFolder(name, path.join(dest, file));
			} else {
				copyFile(name, path.join(dest, file));
			}
		});
	}
}
function deleteDestination() {
	if (fs.existsSync(dest)) {
		fs.rmdirSync(dest, {recursive: true});
	}
}
function copyFile(source, dest) {
	if (source.match(/\.ts$/)) return;
	fs.copyFileSync(source, dest);
}
function init() {
	if (remove) deleteDestination();
	copyFolder(src, dest);
}
init()