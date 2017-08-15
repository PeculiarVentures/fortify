const fs = require("fs");
const path = require("path");

function Remove(_path) {
    if (fs.existsSync(_path)) {
        if (fs.statSync(_path).isFile()) {
            fs.unlinkSync(_path);
        } else {
            fs.readdirSync(_path).forEach((item) => {
                var curPath = path.join(_path, item);
                Remove(curPath);
            });
            fs.rmdirSync(_path);
        }
    }
};

function Clear() {
    console.log("Removing odd files");
    // read JSON with file list
    const fileList = require(path.join(__dirname, "clear.json"));
    fileList.forEach((item) => {
        const _path = path.join(__dirname, item);
        if (fs.existsSync(_path)) {
            console.log(`  - ${_path}`);
            Remove(_path);
        }
    })
}

(function main() {
    Clear();
})();