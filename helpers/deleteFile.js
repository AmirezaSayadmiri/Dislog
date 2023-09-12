const fs = require('fs');
const path = require('path');

const deleteFile = (filePath) => {
    fs.unlink(path.join(filePath),err=>{
        if (err){
            throw err
        }
    })
}

module.exports.deleteFile = deleteFile;