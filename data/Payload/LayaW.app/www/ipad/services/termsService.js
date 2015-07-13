layaApp.service('termsService', function($rootScope, utilsService, secreteKeyService) {
    this.fetchTerms = function(callback) {
        var param = {
            "request": {
                "header": {
                    //                                            
                },
                "payload": {
                    "fetchTermsAndConditions": ""

                }
            }
        }

        console.log(param)

        $fh.cloud({
            "path": "fetchTermsAndConditionsAction",
            "data": param,
            "secure": true,
            "timeout": 25000
        },
        function(res) {
            return callback(null, res.response.payload.fetchTermsAndConditions.text);
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
