(function () {
    'use strict';

    angular
        .module('app')
        .controller('ConversationContent.IndexController', Controller);

    function Controller($state, $scope, UserService, ConversationService, MessageService, FlashService, socket) {
        var vm = this;

        vm.user = null;
		vm.conversation = null;
		vm.messages = [];
		vm.content = "";
		vm.file = null;
		vm.sendMessage = sendMessage;

        initController();

        function initController() {
			//catch the broadcast
			$scope.$on("fileSelected", function (event, args) {
				$scope.$apply(function () {
					switch (args.field) {
						case "myfile":
							vm.file = args.file;
							break;
						default:
							break;
					}
				});
			});
			
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
			
				//join the room
				socket.emit('join', {user:vm.user.name, room:$state.params.id});
				
				//get current conversation
				ConversationService.GetById($state.params.id).then(function (conversation) {
					var index = getIndexById($state.params.id, vm.user.conversations);
					
					vm.conversation = conversation;
					conversation.isCustomChat = true;
					if(vm.user.conversations[index].partnerId) {
						UserService.GetById(vm.user.conversations[index].partnerId).then(function (partner) {
							conversation.name = partner.name;
							conversation.avatar = partner.avatar;
							conversation.isCustomChat = false;
							MessageService.GetAllByConversationId(conversation._id).then(function (messages) {
								vm.messages = messages;
							});
						});
					}
					MessageService.GetAllByConversationId(conversation._id).then(function (messages) {
						vm.messages = messages;
					});
				});
            });
        }
		
		//Socket listeners
		socket.on('new message', function (message) {
			vm.messages.unshift(message);
		});
		
		function sendMessage() {
			if (vm.content != "") {
				var content = {
					text: vm.content
				}
				var message = {
					content: content,
					time: Date.now(),
					senderId: vm.user._id,
					conversationId: vm.conversation._id
				};
				
				MessageService.Create(message)
					.then(function () {
						//vm.messages.unshift(message);
						socket.emit('message', message);
						if (vm.file != null) {
							content = {
								file: vm.file.name
							}
							message = {
								content: content,
								time: Date.now(),
								senderId: vm.user._id,
								conversationId: vm.conversation._id
							};
							
							MessageService.Create(message, vm.file)
								.then(function () {
									//vm.messages.unshift(message);
									socket.emit('message', message);
									vm.file = null;
									FlashService.Success('File sent');
								})
								.catch(function (error) {
									FlashService.Error(error);
								});
						}
						else {
							FlashService.Success('Message sent');
						}
					})
					.catch(function (error) {
						FlashService.Error(error);
					});
			}
			else if (vm.file != null) {
				var content = {
					file: vm.file.name
				}
				var message = {
					content: content,
					time: Date.now(),
					senderId: vm.user._id,
					conversationId: vm.conversation._id
				};
				
				MessageService.Create(message, vm.file)
					.then(function () {
						//vm.messages.unshift(message);
						socket.emit('message', message);
						vm.file = null;
						FlashService.Success('File sent');
					})
					.catch(function (error) {
						FlashService.Error(error);
					});
			}
		}
		
		function viewConversationSetting() {
			
		}
		
		function viewConversationMembers() {
			
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