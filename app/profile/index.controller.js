(function () {
    'use strict';

    angular
        .module('app')
        .controller('Profile.IndexController', Controller);

    function Controller($state, UserService, ConversationService, FlashService) {
        var vm = this;

        vm.user = null;
		vm.targetUser = null;
		vm.friendStatus = "";
		vm.checkFriendStatus = checkFriendStatus;
		vm.sendFriendRequest = sendFriendRequest;
		vm.acceptFriendRequest = acceptFriendRequest;
		vm.declineFriendRequest = declineFriendRequest;
		vm.removeFriend = removeFriend;
		vm.sendMessage = sendMessage;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
			
				// get target user
				UserService.GetById($state.params.id).then(function (targetUser) {
					vm.targetUser = targetUser;
					vm.checkFriendStatus();
				});
            });
        }
		
		function checkFriendStatus() {
			if (getIndexById(vm.user._id, vm.targetUser.friends) != -1) {
				vm.friendStatus = "friends";
			}
			else if (getIndexById(vm.targetUser._id, vm.user.friendrequestsreceived) != -1) {
				vm.friendStatus = "friendrequestreceived";
			}
			else if (getIndexById(vm.user._id, vm.targetUser.friendrequestsreceived) != -1) {
				vm.friendStatus = "friendrequestsent";
			}
			else {
				vm.friendStatus = "stranger"
			}
		}
		
		function sendFriendRequest() {
			var friendRequestBody = {
				_id: vm.user._id
			};
			
			vm.targetUser.friendrequestsreceived.push(friendRequestBody);
			UserService.Update(vm.targetUser)
                .then(function () {
                    FlashService.Success('Target user updated');
					vm.checkFriendStatus();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
		}
		
		function acceptFriendRequest() {
			var targetKey = {
				_id: vm.targetUser._id
			};
			var userKey = {
				_id: vm.user._id
			};
			var index = -1;
			
			vm.user.friends.push(targetKey);
			index = getIndexById(vm.targetUser._id, vm.user.friendrequestsreceived);
			if (index != -1) {
				vm.user.friendrequestsreceived.splice(index, 1);
			}
			UserService.Update(vm.user)
                .then(function () {
                    FlashService.Success('User updated');
					vm.checkFriendStatus();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
			vm.targetUser.friends.push(userKey);
			index = getIndexById(vm.user._id, vm.targetUser.friendrequestsreceived);
			if (index != -1) {
				vm.targetUser.friendrequestsreceived.splice(index, 1);
			}
			UserService.Update(vm.targetUser)
                .then(function () {
                    FlashService.Success('Target user updated');
					vm.checkFriendStatus();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
			$state.go('profile');
		}
		
		function declineFriendRequest() {
			var index = getIndexById(vm.targetUser._id, vm.user.friendrequestsreceived);
			
			if (index != -1) {
				vm.user.friendrequestsreceived.splice(index, 1);
			}
			UserService.Update(vm.user)
                .then(function () {
                    FlashService.Success('User updated');
					vm.checkFriendStatus();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
		}
		
		function removeFriend() {
			var index = -1;
			
			index = getIndexById(vm.targetUser._id, vm.user.friends);
			if (index != -1) {
				vm.user.friends.splice(index, 1);
			}
			UserService.Update(vm.user)
                .then(function () {
                    FlashService.Success('User updated');
					vm.checkFriendStatus();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
			index = getIndexById(vm.user._id, vm.targetUser.friends);
			if (index != -1) {
				vm.targetUser.friends.splice(index, 1);
			}
			UserService.Update(vm.targetUser)
                .then(function () {
                    FlashService.Success('Target user updated');
					vm.checkFriendStatus();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
			$state.go('profile');
		}
		
		function sendMessage() {
			var index = -1;
			
			index = getIndexByPartnerId(vm.targetUser._id, vm.user.conversations);
			if (index != -1) {
				$state.go('conversationContent', { id: vm.user.conversations[index]._id});
			}
			else {
				var conversation = {
					name: vm.targetUser.name,
					background: 'default',
					avatar: vm.targetUser.avatar,
					lastmessage: ''
				};
				
				conversation.isUnread = false;
				conversation.members = [];
				conversation.members.push({ _id: vm.user._id});
				conversation.members.push({ _id: vm.targetUser._id});
				ConversationService.GetId().then(function (id) {
					conversation._id = id;
					ConversationService.Create(conversation)
						.then(function () {
							vm.user.conversations.push({
								_id: conversation._id,
								partnerId: vm.targetUser._id
							});
							UserService.Update(vm.user)
								.then(function () {
									vm.targetUser.conversations.push({
										_id: conversation._id,
										partnerId: vm.user._id
									});
									UserService.Update(vm.targetUser)
										.then(function () {
											FlashService.Success('Conversation created');
											$state.go('conversationContent', { id: conversation._id});
										})
										.catch(function (error) {
											FlashService.Error(error);
										});
								})
								.catch(function (error) {
									FlashService.Error(error);
								});
						})
						.catch(function (error) {
							FlashService.Error(error);
						});
				});
			}
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
		
		function getIndexByPartnerId(checkId, list) {
			for (var i = 0; i < list.length; i++) {
				if (list[i].partnerId == checkId) {
					return i;
				}
			}
			return -1;
		}
    }

})();