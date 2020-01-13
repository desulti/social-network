(function () {
    'use strict';

    angular
        .module('app')
        .factory('ConversationService', Service);

    function Service($http, $q, upload) {
        var service = {};

        service.GetById = GetById;
		service.GetId = GetId;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;

        function GetById(_id) {
            return $http.get('/api/users/conversation/' + _id).then(handleSuccess, handleError);
        }

        function GetId() {
            return $http.get('/api/users/conversationId').then(handleSuccess, handleError);
        }

        function Create(conversation) {
            return $http.post('/api/users/createConversation', conversation).then(handleSuccess, handleError);
        }

        function Update(conversation, file) {
			//inject upload
			var uploadUrl = '/api/users/conversation/' + conversation._id;
			
			var uploadResult = upload({
				url: uploadUrl,
				method: 'POST',
				data: {
					conversation: JSON.stringify(conversation),
					avatar: file
				}
			});
			
			return uploadResult.then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/users/conversation/' + _id).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();
