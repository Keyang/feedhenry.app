/*** Directives and services for responding to idle users in AngularJS
* @author Mike Grabski <me@mikegrabski.com>
* @version v0.3.5
* @link https://github.com/HackedByChinese/ng-idle.git
* @license MIT
*/
(function(window, angular, undefined) {
'use strict';
angular.module('ngIdle', ['ngIdle.keepalive', 'ngIdle.idle', 'ngIdle.idleCountdown']);
angular.module('ngIdle.keepalive', [])
  .provider('Keepalive', function() {
    var options = {
      http: null,
      interval: 10 * 60
    };

    this.http = function(value) {
      if (!value) throw new Error('Argument must be a string containing a URL, or an object containing the HTTP request configuration.');
      if (angular.isString(value)) {
        value = {
          url: value,
          method: 'GET'
        };
      }

      value.cache = false;

      options.http = value;
    };

    var setInterval = this.interval = function(seconds) {
      seconds = parseInt(seconds);

      if (isNaN(seconds) || seconds <= 0) throw new Error('Interval must be expressed in seconds and be greater than 0.');
      options.interval = seconds;
    };

    this.$get = ['$rootScope', '$log', '$interval', '$http',
      function($rootScope, $log, $interval, $http) {

        var state = {
          ping: null
        };


        function handleResponse(data, status) {
          $rootScope.$broadcast('KeepaliveResponse', data, status);
        }

        function ping() {
          $rootScope.$broadcast('Keepalive');

          if (angular.isObject(options.http)) {
            $http(options.http)
              .success(handleResponse)
              .error(handleResponse);
          }
        }

        return {
          _options: function() {
            return options;
          },
          setInterval: setInterval,
          start: function() {
            $interval.cancel(state.ping);

            state.ping = $interval(ping, options.interval * 1000);
            return state.ping;
          },
          stop: function() {
            $interval.cancel(state.ping);
          },
          ping: function() {
            ping();
          }
        };
      }
    ];
  });

angular.module('ngIdle.idle', [])
  .provider('Idle', function() {
    var options = {
      idle: 20 * 60, // in seconds (default is 20min)
      timeout: 30, // in seconds (default is 30sec)
      autoResume: true, // lets events automatically resume (unsets idle state/resets warning)
      interrupt: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove',
      keepalive: true
    };

    /**
     *  Sets the number of seconds a user can be idle before they are considered timed out.
     *  @param {Number|Boolean} seconds A positive number representing seconds OR 0 or false to disable this feature.
     */
    var setTimeout = this.timeout = function(seconds) {
      if (seconds === false) options.timeout = 0;
      else if (angular.isNumber(seconds) && seconds >= 0) options.timeout = seconds;
      else throw new Error('Timeout must be zero or false to disable the feature, or a positive integer (in seconds) to enable it.');
    };

    this.interrupt = function(events) {
      options.interrupt = events;
    };

    var setIdle = this.idle = function(seconds) {
      if (seconds <= 0) throw new Error('Idle must be a value in seconds, greater than 0.');

      options.idle = seconds;
    };

    this.autoResume = function(value) {
      options.autoResume = value === true;
    };

    this.keepalive = function(enabled) {
      options.keepalive = enabled === true;
    };

    this.$get = ['$interval', '$log', '$rootScope', '$document', 'Keepalive',
      function($interval, $log, $rootScope, $document, Keepalive) {
        var state = {
          idle: null,
          timeout: null,
          idling: false,
          running: false,
          countdown: null
        };

        function startKeepalive() {
          if (!options.keepalive) return;

          if (state.running) Keepalive.ping();

          Keepalive.start();
        }

        function stopKeepalive() {
          if (!options.keepalive) return;

          Keepalive.stop();
        }

        function toggleState() {
          state.idling = !state.idling;
          var name = state.idling ? 'Start' : 'End';

          $rootScope.$broadcast('Idle' + name);

          if (state.idling) {
            stopKeepalive();
            if (options.timeout) {
              state.countdown = options.timeout;
              countdown();
              state.timeout = $interval(countdown, 1000, options.timeout, false);
            }
          } else {
            startKeepalive();
          }

          $interval.cancel(state.idle);
        }

        function countdown() {
          // countdown has expired, so signal timeout
          if (state.countdown <= 0) {
            timeout();
            return;
          }

          // countdown hasn't reached zero, so warn and decrement
          $rootScope.$broadcast('IdleWarn', state.countdown);
          state.countdown--;
        }

        function timeout() {
          stopKeepalive();
          $interval.cancel(state.idle);
          $interval.cancel(state.timeout);

          state.idling = true;
          state.running = false;
          state.countdown = 0;

          $rootScope.$broadcast('IdleTimeout');
        }

        function changeOption(self, fn, value) {
          var reset = self.running();

          self.unwatch();
          fn(value);
          if (reset) self.watch();
        }

        var svc = {
          _options: function() {
            return options;
          },
          _getNow: function() {
            return new Date();
          },
          setIdle: function(seconds) {
            changeOption(this, setIdle, seconds);
          },
          setTimeout: function(seconds) {
            changeOption(this, setTimeout, seconds);
          },
          isExpired: function() {
            return state.expiry && state.expiry <= this._getNow();
          },
          running: function() {
            return state.running;
          },
          idling: function() {
            return state.idling;
          },
          watch: function() {
            $interval.cancel(state.idle);
            $interval.cancel(state.timeout);

            // calculate the absolute expiry date, as added insurance against a browser sleeping or paused in the background
            var timeout = !options.timeout ? 0 : options.timeout;
            state.expiry = new Date(new Date().getTime() + ((options.idle + timeout) * 1000));


            if (state.idling) toggleState(); // clears the idle state if currently idling
            else if (!state.running) startKeepalive(); // if about to run, start keep alive

            state.running = true;

            state.idle = $interval(toggleState, options.idle * 1000, 0, false);
          },
          unwatch: function() {
            $interval.cancel(state.idle);
            $interval.cancel(state.timeout);

            state.idling = false;
            state.running = false;
            state.expiry = null;
          },
          interrupt: function() {
            if (!state.running) return;

            if (options.timeout && this.isExpired()) {
              timeout();
              return;
            }

            // note: you can no longer auto resume once we exceed the expiry; you will reset state by calling watch() manually
            if (options.autoResume) this.watch();
          }
        };

        $document.find('body').on(options.interrupt, function() {
          svc.interrupt();
        });

        return svc;
      }
    ];
  });

angular.module('ngIdle.idleCountdown', [])
  .directive('idleCountdown', function() {
    return {
      restrict: 'A',
      scope: {
        value: '=idleCountdown'
      },
      link: function($scope) {
        $scope.$on('IdleWarn', function(e, countdown) {
          $scope.value = countdown;
        });

        $scope.$on('IdleTimeout', function() {
          $scope.value = 0;
        });
      }
    };
  });

})(window, window.angular);