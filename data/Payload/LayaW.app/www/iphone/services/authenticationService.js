layaApp.service('authenticationService', function($rootScope, utilsService, secreteKeyService) {
    var self = this;
    this.login = function(loginData, callback) {


        var param = {
            "request":
                    {
                        "header":
                                {
                                    "deviceUdid": $rootScope.deviceUuid
                                },
                        "payload":
                                {
                                    "login":
                                            {
                                                "mobileNo": loginData.mobileNo.toString(),
                                                "pinNo": loginData.pinNo.toString()
                                            }
                                }
                    }
        };
        utilsService.encrypt(JSON.stringify(param.request.payload.login), function(err, res) {
            if (res)
            {
                param.request.payload.login = res;
                $fh.cloud(
                        {
                            "path": "authenticationAction",
                            "data": param,
                            secure: true,
                            "timeout": 25000
                        },
                function(res)
                {
                    return callback(null, res.response.payload.login);
                },
                        function(msg, err)
                        {
                            /** test for timeout***/
                            if (msg === "") {
                                return callback("Request timeout. Please check your connection and try again.", null);
                            }

                            var error = JSON.parse(msg);
                            if (error.response.payload.error.status == "ERR_403") {                 //checking if token expired
                                secreteKeyService.updateNewKey(function(err, res) {
                                    if (res) {
                                        console.log(res);
                                    }
                                    else {
                                        console.log(err);
                                    }
                                })
                                return callback("Something went wrong. Please try again.", null);
                            }
                            return callback(error.response.payload.error.message, null);
                        });
            }

        });
    };
    this.signUp = function(signUpData, callback) {
        var param = {
            "request":
                    {
                        "header":
                                {
//                                    "deviceUdid": deviceUdid
                                    "deviceUdid": $rootScope.deviceUuid
                                },
                        "payload":
                                {
                                    "registration":
                                            {
                                                "mobileNo": signUpData.mobileNo.toString(),
                                                "memberNo": signUpData.memberNo.toString()
                                            }
                                }
                    }
        };
        utilsService.encrypt(JSON.stringify(param.request.payload.registration), function(err, res) {
            if (res)
            {
                param.request.payload.registration = res;
                $fh.cloud(
                        {
                            "path": "registrationAction",
                            "data": param,
                            secure: true,
                            "timeout": 25000
                        },
                function(res)
                {
                    $rootScope.memberNo = signUpData.memberNo.toString();
                    return callback(null, res.response.payload.registration.pinNo);
                },
                        function(msg, err)
                        {
                            if (msg === "") {
                                return callback("Request timeout. Please check your connection and try again.", null);
                            }
                            var error = JSON.parse(msg);
                            if (error.response.payload.error.status == "ERR_403") {                 //checking if token expired
                                secreteKeyService.updateNewKey(function(err, res) {
                                    if (res) {
                                        console.log(res);
                                    }
                                    else {
                                        console.log(err);
                                    }
                                })
                                return callback("Something went wrong. Please try again.", null);
                            }
                            return callback(error.response.payload.error.message, null);
                        });
            }

        });

    };

    this.confirmPin = function(confirmPinData, callback) {
        var param = {
            "request":
                    {
                        "header":
                                {
                                    "deviceUdid": $rootScope.deviceUuid
                                },
                        "payload":
                                {
                                    "confirmPin":
                                            {
                                                "mobileNo": confirmPinData.mobileNo.toString(),
                                                "memberNo": confirmPinData.memberNo.toString(),
                                                "pinNo": confirmPinData.pinNo.toString()
                                            }
                                }
                    }
        }
        utilsService.encrypt(JSON.stringify(param.request.payload.confirmPin), function(err, res) {
            if (res)
            {
                param.request.payload.confirmPin = res;
                $fh.cloud(
                        {
                            "path": "confirmPinAction",
                            "data": param,
                            secure: true,
                            "timeout": 25000
                        },
                function(res)
                {
                    return callback(null, res.response.payload.confirmPin);
                },
                        function(msg, err)
                        {
                             if (msg === "") {
                                return callback("Request timeout. Please check your connection and try again.", null);
                              }
                            var error = JSON.parse(msg);
                            if (error.response.payload.error.status == "ERR_403") {                 //checking if token expired
                                secreteKeyService.updateNewKey(function(err, res) {
                                    if (res) {
                                        console.log(res);
                                    }
                                    else {
                                        console.log(err);
                                    }
                                })
                                return callback("Something went wrong. Please try again.", null);
                            }
                            return callback(error.response.payload.error.message, null);
                        });
            }

        });

    };
});