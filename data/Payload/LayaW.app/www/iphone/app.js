var layaApp = angular.module('app', ['ngRoute', 'ngIdle'])

layaApp.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'loginController',
      templateUrl: 'views/login.html'
    })

  .when('/home', {
    controller: 'homeController',
    templateUrl: 'views/home.html'
  })

  .when('/changePin', {
    controller: 'changePinController',
    templateUrl: 'views/changePin.html'
  })

  .when('/contactUs', {
    controller: 'contactUsController',
    templateUrl: 'views/contactUs.html'
  })

  .when('/about', {
    controller: 'aboutController',
    templateUrl: 'views/about.html'
  })

  .when('/reviewClaims', {
    controller: 'reviewClaimsController',
    templateUrl: 'views/reviewClaims.html'
  })

  .when('/submitClaim', {
    controller: 'submitClaimController',
    templateUrl: 'views/submitClaim.html'
  })
    .when('/memberDetails', {
      controller: 'memberDetailsController',
      templateUrl: 'views/memberDetails.html'
    })

  .when('/eft', {
    controller: 'eftController',
    templateUrl: 'views/eft.html'
  });

  //.otherwise({
    //redirectTo: '/'
  //});
});
