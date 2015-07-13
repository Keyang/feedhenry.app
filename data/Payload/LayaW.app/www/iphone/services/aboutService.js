layaApp.service('aboutService', function($rootScope, utilsService, secreteKeyService) {
    this.fetchAboutUs = function(callback) {
        var param = {
            "request": {
                "header": {

                },
                "payload": {
                    "fetchAboutUs": {
                    
                    }
                }
            }
        }

        console.log(param)

        $fh.cloud({
            "path": "fetchAboutUsAction",
            "data": param,
            "secure": true,
            "timeout": 25000
        },
        function(res) {
            return callback(null, res.response.payload.fetchAboutUs.text);
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
