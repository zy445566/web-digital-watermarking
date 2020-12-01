const fs = require('fs');
const path = require('path');
const opencvBuf = fs.readFileSync(path.join(__dirname, 'opencv.js'));
const opencvData ={
    base64url:`data:application/javascript;base64,${opencvBuf.toString('base64')}`
};
fs.writeFileSync(path.join(__dirname, 'opencv.json'), JSON.stringify(opencvData));
