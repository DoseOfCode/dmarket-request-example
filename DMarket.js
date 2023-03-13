const axios = require('axios').default;
const tweetnacl = require('tweetnacl');

const querystring = require("querystring");

const config = {
    "public_key": "",
    "private_key": ""
}

const BASE_URL = "https://api.dmarket.com";

let DMarket = axios.create({
    baseURL: BASE_URL,
    timeout: 60000 * 2,

    paramsSerializer: querystring.stringify,

    validateStatus: () => true
});

DMarket.interceptors.request.use(
    (cfg) =>
    {
        let timestamp = Math.floor(Date.now() / 1000);

        if (!cfg.headers) cfg.headers = {};

        cfg.headers["X-Api-Key"] = config.public_key;
        cfg.headers["X-Sign-Date"] = timestamp;
        cfg.headers["Content-Type"] = "application/json";

        let data = cfg.data;

        if (typeof data === "object")
            data = JSON.stringify(data);

        let qs = querystring.stringify(cfg.params);

        if (qs !== "") 
            qs = `?${qs}`;

        let strToSign = 
            cfg.method.toUpperCase() + 
            cfg.url + 
            qs + 
            (data ?? "") + 
            timestamp;

        let signature = sign(strToSign, config.private_key);
        
        cfg.headers["X-Request-Sign"] = "dmar ed25519 " + signature;

        return cfg; 
    }, 
    (error) => console.error(error)
);

function sign(string, secret) 
{
    const signatureBytes = tweetnacl.sign(
        new TextEncoder('utf-8').encode(string), 
        hexStringToByte(secret)
    );

    return byteToHexString(signatureBytes).substr(0, 128);
}

function hexStringToByte(str) 
{
    if (typeof str !== 'string')
    {
        throw new TypeError('Wrong data type passed to convertor. Hexadecimal string is expected');
    }

    const twoNum = 2;
    const radix = 16;
    const uInt8arr = new Uint8Array(str.length / twoNum);

    for (let i = 0, j = 0; i < str.length; i += twoNum, j++)
    {
        uInt8arr[j] = parseInt(str.substr(i, twoNum), radix);
    }

    return uInt8arr;
}

function byteToHexString(uint8arr) 
{
    if (!uint8arr) return '';

    let hexStr = '';
    const radix = 16;
    const magicNumber = 0xff;

    for (let i = 0; i < uint8arr.length; i++) 
    {
        let hex = (uint8arr[i] & magicNumber).toString(radix);

        hex = (hex.length === 1) ? '0' + hex : hex;
        hexStr += hex;
    }

    return hexStr;
}

module.exports = DMarket;