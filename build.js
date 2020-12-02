const fs = require('fs');
const path = require('path');
const opencvBuf = fs.readFileSync(path.join(__dirname, 'opencv.js'));
const opencvData ={
    buffer:opencvBuf.toJSON()
};
fs.writeFileSync(path.join(__dirname, 'opencv.json'), JSON.stringify(opencvData));
