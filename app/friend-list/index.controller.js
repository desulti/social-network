(function () {
    'use strict';

    angular
        .module('app')
        .controller('FriendsList.IndexController', Controller);

    function Controller(UserService, $state) {
        var vm = this;

        vm.user = null;

        initController();

        function initController() {
            // get current user and friends Info
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
			
				// get target user
				UserService.GetById($state.params.id).then(function (targetUser) {
					vm.targetUser = targetUser;
					var friendsInfo = [];
					angular.forEach(vm.targetUser.friends, function (friend) {
						UserService.GetById(friend._id).then(function (friendInfo) {
							friendsInfo.push(friendInfo);
						});
					});
					vm.targetUser.friends = friendsInfo;
				});
            });
        }
    }

})();