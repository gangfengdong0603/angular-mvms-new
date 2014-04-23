angular.module('mvms', ['mvmsController', 'mvmsService', 'mvmsDirective', 'ui.bootstrap.modal', 'ngRoute'])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/channelManage', {
        templateUrl: '/partials/channelManage.html', 
        controller: 'channelManageCtrl'
      })
      .when('/columnManage/:cate_code', {
        templateUrl: '/partials/columnManage.html', 
        controller: 'columnManageCtrl'
      })
      .when('/content/:column_id', {
        templateUrl: '/partials/video.html', 
        controller: 'videoCtrl'
      })
      .when('/others/firstStartManage', {
        templateUrl: '/partials/firstStart.html', 
        controller: 'firstStartManageCtrl'
      })
      .when('/others/pluginManage', {
        templateUrl: '/partials/pluginManage.html', 
        controller: 'pluginManageCtrl'
      })
      .when('/appManage/pics', {
        templateUrl: '/partials/appList.html', 
        controller: 'appPicsCtrl'
      })
      .when('/appManage/list', {
        templateUrl: '/partials/appList.html', 
        controller: 'appListCtrl'
      })
      .when('/', {
        templateUrl: '/partials/root.html',
        controller: 'rootCtrl'
      });
    
    $locationProvider.html5Mode(true);
  });
