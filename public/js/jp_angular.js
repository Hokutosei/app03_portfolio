'use strict';

var app = angular.module('jeanepaulPortfolio', []);

app.controller('loginCtrl', function($scope, $http) {
    $scope.user = '';

    function getCurrentUser() {
        $http.get('/get_current_user').success(function(response) {
            console.log(response)
            $scope.currentUser = response.data['username']
        })
    }
    getCurrentUser()

    $scope.login = function() {
        console.log('called')
        $http.post('/login', $scope.user).success(function(response) {
            console.log('success!')
            console.log(response.data)
            getCurrentUser()
        })

    }


})