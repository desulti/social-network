(function () {
    'use strict';

    angular
        .module('app', ['ui.router', 'lr.upload', 'app.directives'])
        .config(config)
        .run(run);
		
	angular.module("app.directives", []).directive('fileUpload', function () {
	return {
		scope: true,
		link: function (scope, el, attrs) {
			el.bind('change', function (event) {
				var files = event.target.files;
				//iterate files since 'multiple' may be specified on the element
				if(files.length == 0){
					scope.$emit("fileSelected", { file: null, field: event.target.name });
				} else{
					for (var i = 0;i<files.length;i++) {
						//emit event upward
						scope.$emit("fileSelected", { file: files[i], field: event.target.name });
					}
				}
			});
		}
	};
	});

    function config($stateProvider, $urlRouterProvider) {
        // default route
		$urlRouterProvider.when('/profile/:id', '/profile/:id/');
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            })
            .state('friendReqests', {
                url: '/friendReqests',
                templateUrl: 'friend-request/index.html',
                controller: 'FriendReqests.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'friendReqests' }
            })
            .state('profile', {
                url: '/profile/:id',
                templateUrl: 'profile/index.html',
                controller: 'Profile.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'profile' }
            })
            .state('profile.content', {
                url: '/',
                templateUrl: 'profile-content/index.html',
                controller: 'ProfileContent.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'profile.content' }
            })
            .state('profile.friends', {
                url: '/friends',
                templateUrl: 'friend-list/index.html',
                controller: 'FriendsList.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'profile.friends' }
            })
            .state('search', {
                url: '/search/:key/:value',
                templateUrl: 'search/index.html',
                controller: 'Search.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'search' }
            })
            .state('conversations', {
                url: '/conversations',
                templateUrl: 'conversations/index.html',
                controller: 'Conversations.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'conversations' }
            })
            .state('conversationContent', {
                url: '/conversations/:id',
                templateUrl: 'conversation-content/index.html',
                controller: 'ConversationContent.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'conversation.content' }
            });
    }

    function run($http, $rootScope, $window, UserService) {
        // add JWT token as default auth header
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.activeTab = toState.data.activeTab;
			UserService.GetCurrent().then(function (user) {
				$rootScope.name = user.name;
				$rootScope.avatar = user.avatar;
			});
        });
		
		// get user basic information
		UserService.GetCurrent().then(function (user) {
			$rootScope.userID = user._id;
			$rootScope.name = user.name;
			$rootScope.avatar = user.avatar;
		});
    }

    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        $.get('/app/token', function (token) {
            window.jwtToken = token;

            angular.bootstrap(document, ['app']);
        });
    });
})();