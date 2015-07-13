layaApp.service('utilsService', function($rootScope) {
    
    $rootScope.invalidNumberMessage = "Please enter valid amount, must be a number.";
    $rootScope.emptyFieldMessage = "Please, enter all fields. Treatment total should be a number.";
    
    this.encrypt = function(data, callback) {
        if (data !== '' && data !== null && data !== undefined) {
            // Encrypt data
            var options = {
                'act': 'encrypt',
                'params': {
                    // The data to be encrypted
                    'plaintext': data,
                    // The secret key used to do the encryption. (Hex format)
                    'key': $rootScope.secKey.secretKey,
                    // The algorithm used for encryption. Should be either 'RSA' or 'AES'
                    'algorithm': 'AES',
                    // IV only required if algorithm is 'AES'
                    'iv': $rootScope.secKey.iv
                }
            };
            $fh.sec(options, function(res) {
                // The encrypted data (hex format)
                var ciphertext = res.ciphertext;
                return callback(null, ciphertext);
            }, function(code) {
                // Error code. One of:
                //  bad_act   : invalid action type
                //  no_params : params missing
                //  no_params_algorithm : missing algorithm in params
                console.error(code);
                return callback('error', null);
            });
        }
    };

    this.decrypt = function(data, callback) {
        // Decrypt data
        var options = {
            'act': 'decrypt',
            'params': {
                // The data to be decrypted
                'ciphertext': data,
                // The secret key used to do the decryption. (Hex format)
                'key': $rootScope.secKey.secretKey,
                // The algorithm used for decryption. Should be either 'RSA' or 'AES'
                'algorithm': 'AES',
                // IV only required if algorithm is 'AES'
                'iv': $rootScope.secKey.iv
            }
        };
        $fh.sec(options, function(res) {
            // The decrypted data (hex format)
            var plaintext = res.plaintext;
            return callback(null, plaintext);
        }, function(code) {
            // Error code. One of:
            //  bad_act   : invalid action type
            //  no_params : params missing
            //  no_params_algorithm : missing algorithm in params
            console.error(code);
        });
    };
    
    this.encrypt2 = function(data, key, val) {
        if (data !== '' && data !== null && data !== undefined) {
            // Encrypt data
            var options = {
                'act': 'encrypt',
                'params': {
                    // The data to be encrypted
                    'plaintext': data,
                    // The secret key used to do the encryption. (Hex format)
                    'key': key.secretkey,
                    // The algorithm used for encryption. Should be either 'RSA' or 'AES'
                    'algorithm': 'AES',
                    // IV only required if algorithm is 'AES'
                    'iv': key.iv
                }
            };
            $fh.sec(options, function(res) {
                // The encrypted data (hex format)
                var ciphertext = res.ciphertext;
                localStorage.setItem(val, ciphertext);

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