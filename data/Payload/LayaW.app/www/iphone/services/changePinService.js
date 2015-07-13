layaApp.service('changePinService', function($rootScope, utilsService, secreteKeyService) {
    this.changePin = function(data, callback) {
        //Capturing device UUID
//        var deviceUuid = '1234567890' // device.uuid;

        var temp = {
            "mobileNo": $rootScope.mobileNo.toString(),
            "oldPinNo": data.current.toString(),
            "newPinNo": data.new.toString(),
            "memberNo": $rootScope.memberNo
        }
        console.log(JSON.stringify(temp));
        utilsService.encrypt(JSON.stringify(temp), function(err, res) {
            if (res) {
                var param = {
                    "request":
                            {
                                "header":
                                        {
//                                            "deviceUdid": deviceUuid
                                             "deviceUdid": $rootScope.deviceUuid  
                                        },
                                "payload":
                                        {
                                            "changePin": res
                                                    
                                        }
                            }
                }

                console.log(param)

                $fh.cloud(
                        {
                            "path": "changePinAction",
                            "data": param,
                            "secure": true,
                             "timeout": 25000
                        },
                function(res)
                {
                    return callback(null, res);
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
            };

        });


    }
});