(function () {
    'use strict';

    angular
        .module('app')
        .controller('Conversations.IndexController', Controller);

    function Controller(UserService, ConversationService, FlashService) {
        var vm = this;

        vm.user = null;
		vm.conversations = [];
		vm.createConversation = createConversation;
		vm.viewConversationSetting = viewConversationSetting;
		vm.viewConversationMembers = viewConversationMembers;
		vm.deleteConversation = deleteConversation;
		vm.leaveConversation = leaveConversation;

        initController();

        function initController() {
            // get current user and conversations info
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
				angular.forEach(vm.user.conversations, function (conversation) {
					ConversationService.GetById(conversation._id).then(function (conversationInfo) {
						conversationInfo.isCustomChat = true;
						if (conversation.partnerId) {
							UserService.GetById(conversation.partnerId).then(function (partner) {
								conversationInfo.name = partner.name;
								conversationInfo.avatar = partner.avatar;
								conversationInfo.isCustomChat = false;
							});
						}
						vm.conversations.push(conversationInfo);
					});
				});
            });
        }
		
		function createConversation() {
			var conversation = {
				name: 'New Chat Group',
				background: 'default',
				avatar: 'no_avatar.png',
				lastmessage: ''
			};
			
			conversation.isUnread = false;
			conversation.members = [];
			conversation.members.push({ _id: vm.user._id});
			ConversationService.GetId().then(function (id) {
				conversation._id = id;
				vm.conversations.push(conversation);
				ConversationService.Create(conversation)
					.then(function () {
						vm.user.conversations.push({ _id: conversation._id });
						UserService.Update(vm.user)
							.then(function () {
								FlashService.Success('Conversation created');
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
		
		function viewConversationSetting(id) {
            
		}
		
		function viewConversationMembers(id) {
			
		}
		
		function deleteConversation(id) {
			//First remove conversation from client-side user's conversations
			var index1 = getIndexById(id, vm.user.conversations);
			
			vm.user.conversations.splice(index1, 1);
			//Next update client-side user's conversations to database
			UserService.Update(vm.user)
				.then(function () {
					var index2 = getIndexById(id, vm.conversations);
					
					//Remove conversation from client-side conversations if there is only one member left
					if (vm.conversations[index2].members.length == 1) {
						vm.conversations.splice(index2, 1);
						//Update client-side conversations to database
						ConversationService.Delete(id)
							.then(function () {
								FlashService.Success('Conversation deleted');
							})
							.catch(function (error) {
								FlashService.Error(error);
							});
					} else {
						//Else remove user from client-side conversation member
						var index3 = getIndexById(vm.user._id, vm.conversations.members);
						
						vm.conversations[index2].members.splice(index3, 1);
						//Update client-side conversations to database
						ConversationService.Update(vm.conversations)
							.then(function () {
								//Remove conversation from client-side conversations
								vm.conversations.splice(index2, 1);
								FlashService.Success('Conversation deleted');
							})
							.catch(function (error) {
								FlashService.Error(error);
							});
					}
				})
				.catch(function (error) {
					FlashService.Error(error);
				});
		}
		
		function leaveConversation(id) {
			//First remove conversation from client-side user's conversations
			var index1 = getIndexById(id, vm.user.conversations);
			
			vm.user.conversations.splice(index1, 1);
			//Next update client-side user's conversations to database
			UserService.Update(vm.user)
				.then(function () {
					var index2 = getIndexById(id, vm.conversations);
					//Remove user from client-side conversation member
					var index3 = getIndexById(vm.user._id, vm.conversations.members);
					
					vm.conversations[index2].members.splice(index3, 1);
					//Update client-side conversations to database
					ConversationService.Update(vm.conversations)
						.then(function () {
							//Remove conversation from client-side conversations
							vm.conversations.splice(index2, 1);
							FlashService.Success('Conversation left');
						})
						.catch(function (error) {
							FlashService.Error(error);
						});
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