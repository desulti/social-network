(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', Service);

    function Service($http, $q, upload) {
        var service = {};

        service.GetCurrent = GetCurrent;
        service.GetById = GetById;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
		service.SearchSingleField = SearchSingleField;

        return service;

        function GetCurrent() {
            return $http.get('/api/users/current').then(handleSuccess, handleError);
        }

        function GetById(_id) {
            return $http.get('/api/users/' + _id).then(handleSuccess, handleError);
        }

        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }

        function Update(user, file) {
			//inject upload
			var uploadUrl = '/api/users/' + user._id;
			
			var uploadResult = upload({
				url: uploadUrl,
				method: 'POST',
				data: {
					user: JSON.stringify(user),
					avatar: file
				}
			});
			
			return uploadResult.then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
        }
		
		function SearchSingleField(key, value) {
			return $http.get('/api/users/search/' + key + '/' + value).then(handleSuccess, handleError);
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
