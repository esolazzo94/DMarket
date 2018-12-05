var publicKey;
var privateKey;

var encryptedSessionKeyBase64

var spkiBytes;
var pkcs8Bytes;


function createKeyPair() {
    return new Promise((resolve, reject) => {
        window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]), // 65537
                hash: {name: "SHA-256"}
            },
            true,
            ["encrypt", "decrypt"]
        ).then(function(keyPair) {
            publicKey = keyPair.publicKey;
            privateKey = keyPair.privateKey;
            // Export the public key portion
            window.crypto.subtle.exportKey("spki", keyPair.publicKey
            ).then(function(spkiBuffer) {
                spkiBytes = new Uint8Array(spkiBuffer);
                var spkiString = byteArrayToBase64(spkiBytes);
                const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
                ipfs.add(spkiString, (err, result) => {
                    console.log(err,"Indirizzo Chiave Pubblica "+ result);
                    resolve(result);
                });
                
            }).catch(function(err) {
                alert("Could not export public key: " + err.message);
            });
    
            // Export the private key part, in parallel to the public key
            window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey
            ).then(function(pkcs8Buffer) {
                pkcs8Bytes = new Uint8Array(pkcs8Buffer);
                var pkcs8String = byteArrayToBase64(pkcs8Bytes);
    
                //encryptFile(contents);
                
            }).catch(function(err) {
                alert("Could not export private key: " + err.message);
            });
    
    
        }).catch(function(err) {
            alert("Could not generate key pair: " + err.message);
        });
    });        
}

function byteArrayToBase64(byteArray){
    var binaryString = "";
    for (var i=0; i<byteArray.byteLength; i++){
        binaryString += String.fromCharCode(byteArray[i]);
    }
    var base64String = window.btoa(binaryString);
    return base64String;
}

function base64ToByteArray(base64String){
    var binaryString = window.atob(base64String);
    var byteArray = new Uint8Array(binaryString.length);
    for (var i=0; i<binaryString.length; i++){
        byteArray[i] += binaryString.charCodeAt(i);
    }
    return byteArray;
}

function encryptFile(content) {
    
    //var contentBytes = base64ToByteArray(content);
    var cipher;
    // Start by getting the RSA public key for encrypting session key
    window.crypto.subtle.importKey(
        "spki",
        spkiBytes,
        {name: "RSA-OAEP", hash: "SHA-256"},
        false,
        ["encrypt"]
    ).then(function(publicKey) {
        // Now we need to create a random session key for encrypting
        // the actual plaintext.
        return window.crypto.subtle.generateKey(
            {name: "AES-CBC", length: 256},
            true,
            ["encrypt", "decrypt"]
        ).then(function(sessionKey) {
            // We need to do two things with the session key:
            //    Use it to encrypt the selected plaintext file
            //    Encrypt the session key with the public key

            // Part 1 - Read the file and encrypt it with the session key.
            
                var ivBytes = window.crypto.getRandomValues(new Uint8Array(16));
                var plaintextBytes = contents;

                window.crypto.subtle.encrypt(
                    {name: "AES-CBC", iv: ivBytes}, sessionKey, plaintextBytes
                ).then(function(ciphertextBuffer) {
                    // Build a Blob with the 16-byte IV followed by the ciphertext
                    cipher = [ivBytes, new Uint8Array(ciphertextBuffer)];
                    var blob = new Blob(
                        [ivBytes, new Uint8Array(ciphertextBuffer)],
                        {type: "application/octet-stream"}
                    );
                    /*var blobUrl = URL.createObjectURL(blob);
                    window.location = blobUrl;*/
                    //saveAs(blob,"p.pdf");
                    
                }).catch(function(err) {
                    alert("Could not encrypt the plaintext: " + err.message);
                });
            

            // Part 2 - encrypt the session key with the public key. This
            //          requires exporting it first.
            window.crypto.subtle.exportKey(
                "raw", sessionKey
            ).then(function(sessionKeyBuffer) {
                // Encrypt the session key in the buffer, save the encrypted
                // key in the keyBox element.
                window.crypto.subtle.encrypt(
                    {name: "RSA-OAEP"},
                    publicKey,  
                    sessionKeyBuffer
                ).then(function(encryptedSessionKeyBuffer) {
                    var encryptedSessionKeyBytes = new Uint8Array(encryptedSessionKeyBuffer);
                    encryptedSessionKeyBase64 = byteArrayToBase64(encryptedSessionKeyBytes);
                    decryptFile(cipher,name);
                    //Save Encrypted Session Key


                }).catch(function(err) {
                    alert("Could not encrypt session key.")
                });
            }).catch(function(err) {
                alert("Could not export random session key:" + err.message);
            });

        }).catch(function(err) {
            alert("Could not generate random session key: " + err.message);
        });
    }).catch(function(err) {
        alert("Could not import public key: " + err.message);
    });
}

function decryptFile(encrypted,name) {

    // We need a CryptoKey object holding the private key to get started
    window.crypto.subtle.importKey(
        "pkcs8",
        pkcs8Bytes,
        {name: "RSA-OAEP", hash: "SHA-256"},
        false,
        ["decrypt"]
    ).then(function(privateKey) {
        // Now use the private key to decrypt the session key
        var encryptedSessionKeyBytes = base64ToByteArray(encryptedSessionKeyBase64);

        window.crypto.subtle.decrypt(
            {name: "RSA-OAEP"}, privateKey, encryptedSessionKeyBytes
        ).then(function(sessionKeyBuffer){
            window.crypto.subtle.importKey(
                // We can't use the session key until it is in a CryptoKey object
                "raw", sessionKeyBuffer, {name: "AES-CBC", length: 256}, false, ["decrypt"]
            ).then(function(sessionKey){
                // Finally, we can read and decrypt the ciphertext file
                
                    var ivBytes = new Uint8Array(/*encrypted.slice(0, 16)*/encrypted[0]);
                    var ciphertextBytes = new Uint8Array(/*encrypted.slice(16)*/encrypted[1]);

                    window.crypto.subtle.decrypt(
                        {name: "AES-CBC", iv: ivBytes}, sessionKey, ciphertextBytes
                    ).then(function(plaintextBuffer) {
                        var blob = new Blob(
                            [new Uint8Array(plaintextBuffer)],
                            {type: "application/octet-stream"}
                        );
                        
                        saveAs(blob,name);

                    }).catch(function(err) {
                        alert("Could not decrypt the ciphertext: " + err.message);
                    });

            }).catch(function(err){
                alert("Error importing session key: " + err.message);
            });
        }).catch(function(err){
            alert("Error decrypting session key: " + err.message);
        });
    }).catch(function(err) {
        alert("Could not import private key: " + err.message)
    });
}

function convertArrayBufferToHexaDecimal(buffer) 
{
    var data_view = new DataView(buffer)
    var iii, len, hex = '', c;
    for(iii = 0, len = data_view.byteLength; iii < len; iii += 1) 
    {
        c = data_view.getUint8(iii).toString(16);
        if(c.length < 2) 
        {
            c = '0' + c;
        }   
        hex += c;
    }
    return hex;
}