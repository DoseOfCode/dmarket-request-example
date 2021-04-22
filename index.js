const nacl = require('tweetnacl');

const querystring = require('querystring');
const webrequest = require('web-request');

const ENDPOINT = "https://api.dmarket.com";
const PUBLIC_KEY = "your public key goes here.";
const PRIVATE_KEY = "your private key goes here.";

example();

async function example()
{
    console.log(`Fetching user inventory that is currently listed on DMarket.`);
    
    await query_dmarket(
        "GET",
        "/marketplace-api/v1/user-inventory",
        {
            "GameID": "rust",
            "BasicFilters.InMarket": true
        },
        undefined
    )
    .then((res) => console.log(res))
    .catch((err) => 
    {
        console.log(`Something unexpected happened!`);
        console.error(err);
    })
}

function query_dmarket(method, path, query_params, body)
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            let ts = Math.floor(Date.now() / 1000);
    
            let string_to_sign = method + path + (query_params ? "?" : undefined) + querystring.stringify(query_params) + JSON.stringify(body) + ts;
                string_to_sign = string_to_sign.replace("undefined", "");
    
            webrequest.json(ENDPOINT + path + "?" + querystring.stringify(query_params),
            { 
                method,
                headers: {
                    "X-Api-Key": PUBLIC_KEY,
                    "X-Sign-Date": ts,
                    "X-Request-Sign": "dmar ed25519 " + sign(string_to_sign, PRIVATE_KEY),
                    "Content-Type": "application/json"
                },
                body
            })
            .then((res) => resolve(res))
            .catch((err) => reject(err))
        }
        catch (err)
        {
            reject(err);
        }
    });
}

function sign(string, secret) 
{
    const signatureBytes = nacl.sign(new TextEncoder('utf-8').encode(string), hexStringToByte(secret));

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