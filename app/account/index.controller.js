(function () {
    'use strict';

    angular
        .module('app')
        .controller('Account.IndexController', Controller);

    function Controller($state, $scope, $window, UserService, FlashService) {
        var vm = this;

        vm.user = null;
        vm.saveUser = saveUser;
        vm.deleteUser = deleteUser;

        initController();

        function initController() {
			//catch the broadcast
			$scope.$on("fileSelected", function (event, args) {
				$scope.$apply(function () {
					switch (args.field) {
						case "myfile":
							$scope.myfile = args.file;
							break;
						default:
							break;
					}
				});
			});
			
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
				vm.user.age = parseInt(vm.user.age);
            });
        }

        function saveUser() {
            UserService.Update(vm.user, $scope.myfile)
                .then(function () {
                    FlashService.Success('User updated');
					// return to home page
					$state.go('home');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }

        function deleteUser() {
            UserService.Delete(vm.user._id)
                .then(function () {
                    // log user out
                    $window.location = '/login';
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }
    }

})();