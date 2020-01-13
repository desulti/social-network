(function () {
    'use strict';

    angular
        .module('app')
        .controller('ProfileContent.IndexController', Controller);

    function Controller(UserService, $state) {
        var vm = this;

        vm.user = null;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
			
			// get target user
			UserService.GetById($state.params.id).then(function (targetUser) {
				vm.targetUser = targetUser;
			});
        }
    }

})();