(function () {
    'use strict';

    angular
        .module('app')
        .factory('MessageService', Service);

    function Service($http, $q, upload) {
        var service = {};

        service.GetById = GetById;
		service.GetAllByConversationId = GetAllByConversationId;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;

        function GetById(_id) {
            return $http.get('/api/users/message/' + _id).then(handleSuccess, handleError);
        }

        function GetAllByConversationId(_id) {
            return $http.get('/api/users/conversationMessages/' + _id).then(handleSuccess, handleError);
        }

        function Create(message, file) {
            //return $http.post('/api/users/createMessage', message).then(handleSuccess, handleError);
			//inject upload
			var uploadUrl = '/api/users/createMessage';
			
			var uploadResult = upload({
				url: uploadUrl,
				method: 'POST',
				data: {
					message: JSON.stringify(message),
					file: file
				}
			});
			
			return uploadResult.then(handleSuccess, handleError);
        }

        function Update(message, file) {
			//inject upload
			var uploadUrl = '/api/users/message/' + message._id;
			
			var uploadResult = upload({
				url: uploadUrl,
				method: 'POST',
				data: {
					message: JSON.stringify(message),
					file: file
				}
			});
			
			return uploadResult.then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/users/message/' + _id).then(handleSuccess, handleError);
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
