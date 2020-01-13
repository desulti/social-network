(function () {
    'use strict';

    angular
        .module('app')
        .controller('Search.IndexController', Controller);

    function Controller($state, $rootScope, UserService, FlashService) {
        var vm = this;

        vm.result = [];
		vm.key = null;
		vm.value = null;

        initController();

        function initController() {
			vm.key = $state.params.key;
			
			if ($rootScope.searchvalue) {
				if ($rootScope.searchvalue == '') {
					vm.value = ' ';
				} else {
					vm.value = $rootScope.searchvalue;
				}
			}
			else {
				if ($state.params.value) {
					vm.value = $state.params.value;
				} else {
					vm.value = ' ';
				}
			}
			
			// get search result
			UserService.SearchSingleField(vm.key, vm.value)
				.then(function (result) {
					FlashService.Success('Search finished');
					vm.result = result;
				})
				.catch(function (error) {
					FlashService.Error(error);
				});
        }
    }

})();