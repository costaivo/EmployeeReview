(function() {
    var app = angular.module("employeeApp", ['ngRoute', 'angular-hmac-sha512', 'angular.chips', 'ui.bootstrap', 'ngFileUpload', 'infinite-scroll']);
    app.config(function($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'homeController',
                templateUrl: 'views/home.html'
            })
            .when('/home', {
                controller: 'homeController',
                templateUrl: 'views/home.html'
            })
            .when('/login', {
                controller: 'loginController',
                templateUrl: 'views/login.html'
            })
            .when('/registration', {
                controller: 'registrationController',
                templateUrl: 'views/registration.html'
            })
            .when('/profile', {
                controller: 'profileController as typeahead',
                templateUrl: 'views/profile.html'
            })
            .when('/task', {
                controller: 'taskController',
                templateUrl: 'views/task.html'
            })
            .when('/resetPassword/:token', {
                controller: 'resetPasswordController',
                templateUrl: 'views/resetPassword.html'
            })
            .when('/image', {
                controller: 'imageUpload',
                templateUrl: 'views/imageUpload.html'
            })
            .otherwise({ redirectTo: '/' });
    });

    app.directive('fileModel', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

}());
