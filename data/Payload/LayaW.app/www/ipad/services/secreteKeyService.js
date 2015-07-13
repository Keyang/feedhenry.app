layaApp.service('secreteKeyService', function($rootScope, utilsService) {
    this.getToken = function(callback) {
        var algorithm, secretkey, iv;
        // Generate a new Key
        var options = {
            "act": "keygen",
            "params": {
                "algorithm": "AES", // Only AES supported
                "keysize": "128" // 128 or 256
            }
        };

        $fh.sec(options, function(res) {
            // The algorithm used for the generation
            algorithm = res.algorithm;

            // The generated key (hex format)
            secretkey = res.secretkey;

            // The generated initial vector (hex format)
            iv = res.iv;
            var param = {
                "request": {
                    "header": {
                        "deviceUdid": $rootScope.deviceUuid
                    },
                    "payload": {
                        "registerDevice": {
                            //                                                "deviceUdid": deviceUuid,
                            "secretKey": secretkey,
                            "iv": iv
                        }
                    }
                }
            };
            $fh.cloud({
                "path": "registerDeviceAction",
                "data": param,
                secure: true,
                "timeout": 25000
            },
            function(res) {
                return callback(null, res.response.payload.registerDevice.token);
            },
                    function(msg, err) {
                        if (msg === "")
                        {
                            return callback("Request timeout. Please check your connection and try again.", null);
                        }
                        return callback(JSON.parse(msg), null);
                    });
        }, function(code) {
            // Error code. One of:
            //  bad_act   : invalid action type
            //  no_params : params missing
            //  no_params_algorithm : missing algorithm in params
            console.error(code);
        });
    };

    this.getKey = function(token, callback) {

        var param = {
            "request": {
                "header": {
                    "deviceUdid": $rootScope.deviceUuid
                },
                "payload": {
                    "getSecretKey": {
                        "token": token
                    }
                }
            }
        };
        $fh.cloud({
            "path": "getSecretKeyAction",
            "data": param,
            secure: true,
            "timeout": 25000
        },
        function(res) {
            return callback(null, res.response.payload.getSecretKey.keyDetails);
        },
                function(msg, err) {
                    if (msg == "") {
                        msg = "Please check your connection and try again."
                        return callback(msg, null);
                    }
                    console.log(err);
                    var error = JSON.parse(msg);
                    if (error.response.payload.error.status == "ERR_403") {
                        return callback(error.response.payload.error.status, null);
                    }
                    return callback(error.response.payload.error.message, null);
                });
    };
    this.forgotPin = function(forgotPinData, callback) {
        var param = {
            "request": {
                "header": {
                    //                                    "deviceUdid": deviceUdid
                    "deviceUdid": $rootScope.deviceUuid
                },
                "payload": {
                    "forgotPin": {
                        "mobileNo": forgotPinData.mobileNo.toString(),
                        "memberNo": forgotPinData.memberNo.toString()
                    }
                }
            }
        };
        utilsService.encrypt(JSON.stringify(param.request.payload.forgotPin), function(err, res) {
            if (res) {
                param.request.payload.forgotPin = res;
                $fh.cloud({
                    "path": "forgotPinAction",
                    "data": param,
                    secure: true,
                    "timeout": 25000
                },
                function(res) {
                    $rootScope.memberNo = forgotPinData.memberNo.toString();
                    return callback(null, res.response.payload.forgotPin.pinNo);
                },
                        function(msg, err) {
                            if (msg === "")
                            {
                                return callback("Request timeout. Please check your connection and try again.", null);
                            }
                            var error = JSON.parse(msg);
                            return callback(error.response.payload.error.message, null);
                        });
            }

        });
    };

    this.updateNewKey = function(callback) {
        var algorithm, secretkey, iv;
        // Generate a new Key
        var options = {
            "act": "keygen",
            "params": {
                "algorithm": "AES", // Only AES supported
                "keysize": "128" // 128 or 256
            }
        };

        $fh.sec(options, function(res) {
            // The algorithm used for the generation
            algorithm = res.algorithm;

            // The generated key (hex format)
            secretkey = res.secretkey;

            // The generated initial vector (hex format)
            iv = res.iv;
            var self = this;
            var newKey = res;
            var token = localStorage.getItem('token');
            token = JSON.parse(token);
            //making cloud call for saving new key
            var param = {
                "request": {
                    "header": {
                        "deviceUdid": $rootScope.deviceUuid
                    },
                    "payload": {
                        "updateKey": {
                            "token": token,
                            "secretKey": secretkey,
                            "iv": iv
                        }
                    }
                }
            };

            console.log(param);

            $fh.cloud({
                "path": "updateKeyAction",
                "data": param,
                secure: true,
                "timeout": 25000
            },
            function(res) {
                console.log(res);

                if (localStorage.getItem("memberDetails")) {
                    utilsService.decrypt(localStorage.getItem('memberDetails'), function(err, resp) {
                        console.log(resp);
                        utilsService.encrypt2(resp, newKey, "memberDetails");
                    });
                }
                if (localStorage.getItem("eftDetails")) {
                    utilsService.decrypt(localStorage.getItem('eftDetails'), function(err, resp) {
                        utilsService.encrypt2(resp, newKey, "eftDetails");
                    });
                }
                if (localStorage.getItem("claimList")) {
                    utilsService.decrypt(localStorage.getItem('claimList'), function(err, resp) {
                        utilsService.encrypt2(resp, newKey, "claimList");
                    });
                }

                $rootScope.secKey.secretKey = newKey.secretkey;
                $rootScope.secKey.iv = newKey.iv;

                //                return callback(null, res.response.payload.registerDevice.token);
            },
                    function(msg, err) {
                        if (msg === "")
                        {
                            return callback("Request timeout. Please check your connection and try again.", null);
                        }
                        //                        return callback(JSON.parse(msg), null);
                    });

        }, function(code) {
            // Error code. One of:
            //  bad_act   : invalid action type
            //  no_params : params missing
            //  no_params_algorithm : missing algorithm in params
            console.error(code);
        });
    }


    this.encrypt = function(data, key, val) {
        if (data !== '' && data !== null && data !== undefined) {
            // Encrypt data
            var options = {
                'act': 'encrypt',
                'params': {
                    // The data to be encrypted
                    'plaintext': data,
                    // The secret key used to do the encryption. (Hex format)
                    'key': key.secretKey,
                    // The algorithm used for encryption. Should be either 'RSA' or 'AES'
                    'algorithm': 'AES',
                    // IV only required if algorithm is 'AES'
                    'iv': key.iv
                }
            };
            $fh.sec(options, function(res) {
                // The encrypted data (hex format)
                var ciphertext = res.ciphertext;
                console.log(res);
                localStorage.setItem(val, res);

            }, function(code) {
                // Error code. One of:
                //  bad_act   : invalid action type
                //  no_params : params missing
                //  no_params_algorithm : missing algorithm in params
                console.error(code);
            });
        }
    };
});
