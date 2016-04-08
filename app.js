var app = angular.module('myApp', [
    'ui.router',
    'jcs-autoValidate',
    'angular-ladda',
    'satellizer'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('welcome', {
            url: "/",
            views: {
                'main': {
                    templateUrl: 'templates/welcome.html',
                    controller: 'WelcomeCtrl'
                }
            }
        })
        .state('home', {
            url: "/home",
            views: {
                'main': {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }
            }
        })
        .state('login', {
            url: "/login",
            views: {
                'main': {
                    templateUrl: 'templates/auth/login.html',
                    controller: 'LoginCtrl'
                }
            }
        })
        .state('logout', {
            url: "/logout",
            views: {
                'main': {
                    controller: 'LogoutCtrl'
                }
            }
        })
        .state('register', {
            url: "/register",
            views: {
                'main': {
                    templateUrl: 'templates/auth/register.html',
                    controller: 'RegisterCtrl'
                }
            }
        })
        .state('password-email', {
            url: "/password/email",
            views: {
                'main': {
                    templateUrl: 'templates/auth/passwords/email.html',
                    controller: 'PasswordEmailCtrl'
                }
            }
        })
        .state('password-reset', {
            url: "/password/reset/:token",
            views: {
                'main': {
                    templateUrl: 'templates/auth/passwords/reset.html',
                    controller: 'PasswordResetCtrl'
                }
            }
        });

    $urlRouterProvider.otherwise('/');
});

app.config(function ($httpProvider, laddaProvider) {
    $httpProvider.defaults.headers.common['Accept'] = 'application/json';
    laddaProvider.setOption({
        style: 'expand-right'
    });
});

app.config(function ($authProvider) {
    // Facebook
    $authProvider.facebook({
        clientId: '198964623818788',
        name: 'facebook',
        url: 'http://lai-laravel.dev:8000/api/v1/auth/provider/callback/facebook',
        authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
        redirectUri: window.location.origin + '/',
        requiredUrlParams: ['display', 'scope'],
        scope: ['email'],
        scopeDelimiter: ',',
        display: 'popup',
        type: '2.0',
        popupOptions: {width: 580, height: 400}
    });

    // Google
    $authProvider.google({
        clientId: '301072675710-dn2djmrl8kvervr8eko0pagu076kppqd.apps.googleusercontent.com',
        url: 'http://lai-laravel.dev:8000/api/v1/auth/provider/callback/google',
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
        redirectUri: window.location.origin,
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display'],
        scope: ['profile', 'email'],
        scopePrefix: 'openid',
        scopeDelimiter: ' ',
        display: 'popup',
        type: '2.0',
        popupOptions: {width: 452, height: 633}
    });
});

app.run(function (defaultErrorMessageResolver) {
        defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
            errorMessages['confirmed'] = 'The password confirmation does not match.';
        });
    }
);

app.factory('Auth', function () {
    var auth = {
        loggedIn: false,
        user: {}
    };
    return auth;
});

app.factory('Successes', function () {
    return {};
});

app.factory('Errors', function () {
    return {};
});

app.controller('MainCtrl', function ($scope, $state, $auth, Auth, Errors) {
    $scope.Auth = Auth;

    $scope.Errors = Errors;

    // Satellizer token-based authentication (Facebook, Google)
    $scope.authenticate = function (provider) {
        $auth.authenticate(provider).
            then(function (response) {
                $scope.submitting = false;
                $scope.submitted = true;
                $scope.has_error = false;

                $scope.Auth.loggedIn = true;
                $scope.Auth.user = response.data.success.data.user;

                $state.go('home');
            }).catch(function (response) {
                $scope.submitting = false;
                $scope.submitted = false;
                $scope.has_error = true;

                $scope.Auth.loggedIn = false;
                $scope.Auth.user = {};

                $scope.Errors = response.data.error.data.errors;
            });
    };
});

app.controller('WelcomeCtrl', function ($scope) {

});

app.controller('HomeCtrl', function ($scope, $state, Auth) {
    $scope.Auth = Auth;

    if (!$scope.Auth.loggedIn) {
        $state.go('login');
    }
});

app.controller('LoginCtrl', function ($scope, $state, $http, $auth, Auth, Errors) {
    $scope.Auth = Auth;
    $scope.Auth.loggedIn = false;
    $scope.Auth.user = {};

    $scope.Errors = Errors;

    $scope.formModel = {};
    $scope.submitting = false;
    $scope.submitted = false;
    $scope.has_error = false;

    $scope.onSubmit = function () {
        $scope.submitting = true;

        $http.post('http://lai-laravel.dev:8000/api/v1/login', $scope.formModel).
            success(function (data) {
                $scope.submitting = false;
                $scope.submitted = true;
                $scope.has_error = false;

                $scope.Auth.loggedIn = true;
                $scope.Auth.user = data.success.data.user;

                $state.go('home');
            }).error(function (data) {
                $scope.submitting = false;
                $scope.submitted = false;
                $scope.has_error = true;

                $scope.Auth.loggedIn = false;
                $scope.Auth.user = {};

                $scope.Errors = data.error.data.errors;
            });
    };
});

app.controller('LogoutCtrl', function ($scope, $state, $http, Auth, Errors) {
    $scope.Auth = Auth;

    $scope.Errors = Errors;

    $scope.has_error = false;

    $http.get('http://lai-laravel.dev:8000/api/v1/logout').
        success(function (data) {
            $scope.has_error = false;

            $scope.Auth.loggedIn = false;
            $scope.Auth.user = {};

            $state.go('welcome');
        }).error(function (data) {
            $scope.has_error = true;

            $scope.Errors = data.error.data.errors;
        });
});

app.controller('RegisterCtrl', function ($scope, $state, $http, Auth, Errors) {
    $scope.Auth = Auth;
    $scope.Auth.loggedIn = false;
    $scope.Auth.user = {};

    $scope.Errors = Errors;

    $scope.formModel = {};
    $scope.submitting = false;
    $scope.submitted = false;
    $scope.has_error = false;

    $scope.onSubmit = function () {
        $scope.submitting = true;

        $http.post('http://lai-laravel.dev:8000/api/v1/register', $scope.formModel).
            success(function (data) {
                $scope.submitting = false;
                $scope.submitted = true;
                $scope.has_error = false;

                $scope.Auth.loggedIn = true;
                $scope.Auth.user = data.success.data.user;

                $state.go('home');
            }).error(function (data) {
                $scope.submitting = false;
                $scope.submitted = false;
                $scope.has_error = true;

                $scope.Auth.loggedIn = false;
                $scope.Auth.user = {};

                console.log(data);

                $scope.Errors = data.error.data.errors;
            });
    };
});

app.controller('PasswordEmailCtrl', function ($scope, $state, $http, Auth, Successes, Errors) {
    $scope.Auth = Auth;

    if ($scope.Auth.loggedIn) {
        $state.go('welcome');
    }

    $scope.Successes = Successes;

    $scope.Errors = Errors;

    $scope.formModel = {};
    $scope.submitting = false;
    $scope.submitted = false;
    $scope.has_error = false;

    $scope.onSubmit = function () {
        $scope.submitting = true;

        $http.post('http://lai-laravel.dev:8000/api/v1/password/email', $scope.formModel).
            success(function (data) {
                $scope.submitting = false;
                $scope.submitted = true;
                $scope.has_error = false;

                $scope.Successes = data.success.data.successes;
            }).error(function (data) {
                $scope.submitting = false;
                $scope.submitted = false;
                $scope.has_error = true;

                $scope.Errors = data.error.data.errors;
            });
    };
});

app.controller('PasswordResetCtrl', function ($scope, $state, $stateParams, $http, Auth, Successes, Errors) {
    $scope.Auth = Auth;

    if ($scope.Auth.loggedIn) {
        $state.go('welcome');
    }

    $scope.Successes = Successes;

    $scope.Errors = Errors;

    $scope.formModel = {};
    $scope.submitting = false;
    $scope.submitted = false;
    $scope.has_error = false;

    $scope.onSubmit = function () {
        $scope.submitting = true;

        $scope.formModel.token = $stateParams.token;

        $http.post('http://lai-laravel.dev:8000/api/v1/password/reset', $scope.formModel).
            success(function (data) {
                $scope.submitting = false;
                $scope.submitted = true;
                $scope.has_error = false;

                //$scope.Successes = data.success.data.successes;;

                $scope.Auth.loggedIn = true;
                $scope.Auth.user = data.success.data.user;

                $state.go('home');
            }).error(function (data) {
                $scope.submitting = false;
                $scope.submitted = false;
                $scope.has_error = true;

                $scope.Errors = data.error.data.errors;
            });
    };
});
