(function () {
    'use strict';

    angular
        .module('app')
        .controller('FriendReqests.IndexController', Controller);

    function Controller(UserService, FlashService) {
        var vm = this;

        vm.user = null;
		vm.acceptFriendRequest = acceptFriendRequest;
		vm.declineFriendRequest = declineFriendRequest;

        initController();

        function initController() {
            // get current user and friend requester info
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
				var friendsRequesterInfo = [];
				angular.forEach(vm.user.friendrequestsreceived, function (friendRequester) {
					UserService.GetById(friendRequester._id).then(function (friendRequesterInfo) {
						friendsRequesterInfo.push(friendRequesterInfo);
					});
				});
				vm.user.friendrequestsreceived = friendsRequesterInfo;
            });
        }
		
		function acceptFriendRequest(id) {
            UserService.GetById(id).then(function (targetUser) {
				var targetKey = {
					_id: id
				};
				var userKey = {
					_id: vm.user._id
				};
				var index = -1;
				
				vm.user.friends.push(targetKey);
				index = getIndexById(id, vm.user.friendrequestsreceived);
				if (index != -1) {
					vm.user.friendrequestsreceived.splice(index, 1);
				}
				UserService.Update(vm.user)
					.then(function () {
						FlashService.Success('User updated');
					})
					.catch(function (error) {
						FlashService.Error(error);
					});
				targetUser.friends.push(userKey);
				index = getIndexById(vm.user._id, targetUser.friendrequestsreceived);
				if (index != -1) {
					targetUser.friendrequestsreceived.splice(index, 1);
				}
				UserService.Update(targetUser)
					.then(function () {
						FlashService.Success('Target user updated');
					})
					.catch(function (error) {
						FlashService.Error(error);
					});
			});
		}
		
		function declineFriendRequest(id) {
			var index = getIndexById(id, vm.user.friendrequestsreceived);
			
			if (index != -1) {
				vm.user.friendrequestsreceived.splice(index, 1);
			}
			UserService.Update(vm.user)
                .then(function () {
                    FlashService.Success('User updated');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
		}

        // private functions
		
		function getIndexById(checkId, list) {
			for (var i = 0; i < list.length; i++) {
				if (list[i]._id == checkId) {
					return i;
				}
			}
			return -1;
		}
		
    }

})();