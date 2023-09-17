import fs from "fs";
import path from "path";

const deleteFile = (filePath: string) => {
    fs.unlink(path.join(filePath), (err) => {
        if (err) {
            throw err;
        }
    });
};

export default deleteFile;
