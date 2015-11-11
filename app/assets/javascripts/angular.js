/** THIS (Immediately Invoked Function Expression) IIFE STORES THE WHOLE APPLICATION
TO AVOID POLLUTING THE GLOBAL SCOPE AND KEEP
 THINGS NICE AND CONTAINED **/

(function(){
var app = angular.module('SomethingBorrowed', ['ngAnimate']);

//This is the main controller which wraps the entire application
//providing access to the current user, and control over the view
app.controller('MainController', ['$http', function($http){
	var mainCtrl = this;

	$http.get('/session').success(function(data){
		mainCtrl.currentUser = data.current_user;
		console.log(mainCtrl.currentUser);
	});

	mainCtrl.filter = "availableItems";
	mainCtrl.formStatus = false;

	mainCtrl.filterAs = function(filter){
		console.log(filter);
		mainCtrl.filter = filter;

	};

	mainCtrl.loadMapCoor = function(){
		console.log("works");
		initMap();
		updateMap();
	};

	mainCtrl.toggleForm = function(status){
		mainCtrl.formStatus = status;
	};


	//Once routes are set, GET request to '/session' will set MainController.currentUser = data.currentUser

}]);

//This is the item controller which makes an AJAX call to /posts
//getting all relevant data, which will then be filtered using angular in the view
app.controller('ItemController', ['$http', '$scope', function($http, $scope){
	var itemCtrl = this;
	var authenticity_token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

itemCtrl.getItems = function(){$http.get('/posts').success(function(data){
		itemCtrl.itemList = data.posts;
		console.log(itemCtrl.itemList);
	});
};

//Makes AJAX request to get all posts
itemCtrl.getItems();

itemCtrl.addItem = function(){
	$http.post('/posts', {
		authenticity_token: authenticity_token,
		post: {
			title: itemCtrl.newItemTitle,
			description: itemCtrl.newItemDescription,
			latitude: lat,
			longitude: lng
		}
	}).success(function(data){
		itemCtrl.newItemTitle = ""
		itemCtrl.newItemDescription = ""
		$scope.$parent.mainCtrl.toggleForm(false)
		itemCtrl.getItems();
	});
};

//This is triggered when a user chooses to borrow an item, setting
//their id to the borrower_id of that item, and setting the avialable property
//to false for that item
itemCtrl.borrowItem = function(item){
	newBorrowerId = $scope.$parent.mainCtrl.currentUser.user_id;
	for(var i=0; i < itemCtrl.itemList.length; i ++){
		if(itemCtrl.itemList[i].id === item.id){
			itemCtrl.itemList[i].available = false;
			itemCtrl.itemList[i].borrower_id = newBorrowerId;
		}
	};

	$http.patch('/posts/' + item.id, {
		authenticity_token: authenticity_token,
		post: {
			available: false,
			borrower_id: newBorrowerId
		}
	}).success(function(data){
		console.log('item successfully edited')
	})
};


}]);



})();
