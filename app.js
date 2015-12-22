(function(){
  var app = angular.module('bookViewer', ['angularMoment']);

  app.constant('config', {
      docroot: '/reedsy-challenge/' //ideally get this value from config stored server-side
  });

  app.directive("bookPreview", ['config', function(config) {
    return {
      restrict: 'E',
      templateUrl: config.docroot + 'book-preview.html'
    };
  }]);

  app.directive("bookFullView", ['config', function(config) {
    return {
      restrict: 'E',
      templateUrl: config.docroot + 'book-full-view.html'
    };
  }]);

  app.directive("pageControls", ['config', function(config) {
    return {
      restrict: 'E',
      templateUrl: config.docroot + 'page-controls.html'
    };
  }]);

  //generic re-useable filter should probably go in a libary file somewhere.
  app.filter('startFrom', function() {
    return function(input, start) {
      start = +start; //parse to int
      return input.slice(start);
    };
  });

  app.controller('BookController', ['config', '$scope', '$http', function(config, $scope, $http) {
    $scope.books = [];//contain all the book data

    $scope.listView = 1;//toggle between list and single view
    $scope.singleView = 0;//toggle between list and single view
    $scope.selectedBook = 0;//helps populate data on single view 
    $scope.selectedBookId = 0;//helps custom filter on single view

    $scope.bookIds = [];//storing all book ids for easy access

    $scope.currentPage = 0;//for pagination
    $scope.pageSize = 9;//for pagination
    $scope.dataLength = 0;//for pagination

    $scope.categoryData = {
      availableOptions: [{id: null, name: 'All'}],
      selectedOption: null
    };

    $scope.genreData = {
      availableOptions: [{id: null, name: 'All'}],
      selectedOption: null 
    };

    //calculation for pagination
    $scope.numberOfPages = function(dataLength){
      $scope.dataLength = dataLength;
      return Math.ceil($scope.dataLength/$scope.pageSize);
    };

    //toggle the display, and set some values necessary for single view
    $scope.selectBook = function(index){
      $scope.listView = 0;
      $scope.singleView = 1;
      $scope.selectedBookId = index;
      $scope.selectedBook = $scope.bookIds.indexOf(index);
    };

    //Close the single view
    $scope.closeView = function(){
      $scope.listView = 1;
      $scope.singleView = 0;
      $scope.selectedBook = 0;
      $scope.selectedBookId = 0;
    };

    //This keeps it from getting stuck on a page with no records during filtering.
    $scope.resetPage = function(){
      $scope.currentPage = 0;
    };

    //Get data from file
    $http.get(config.docroot + 'book.json').success(function(data) {
      $scope.books = data;
      var categories = [], genres = [];
      
      //get clean array list for genre data, used to populate dropdowns.
      //also save ID value for easy lookup
      angular.forEach(data, function(value, key) {
        
        check = value.genre.category;
        if (categories.indexOf(check) == -1) {
          categories.push(check);
        }

        check = value.genre.name;
        if (genres.indexOf(check) == -1) {
          genres.push(check);
        }
        
        $scope.bookIds[key] = value.id;
      });

      //alphabetical please!
      categories.sort();
      genres.sort();
      
      //make array values into objects compatible with ng-options
      angular.forEach(categories, function(value, key) {
        $scope.categoryData.availableOptions.push({id: value, name: value});
      });
      angular.forEach(genres, function(value, key) {
        $scope.genreData.availableOptions.push({id: value, name: value});
      });
    });

    //custom filter to faciliate the genre dropdowns, allows for null/"all" selections
    $scope.genreFilter = function (item) {
      var cat = true, name = true;

      if (
        !angular.isUndefined($scope.categoryData.selectedOption) 
        && $scope.categoryData.selectedOption !== null
        && $scope.categoryData.selectedOption.id !== null
      ) {
        cat = item.genre.category === $scope.categoryData.selectedOption.name;
      }

      if (
        !angular.isUndefined($scope.genreData.selectedOption) 
        && $scope.genreData.selectedOption !== null
        && $scope.genreData.selectedOption.id !== null
      ) {
        name = item.genre.name === $scope.genreData.selectedOption.name;
      }
      return cat && name; 
    };

    //filter to find related books
    //could be extended to find similar categories, or a "users who read also read these books" filter, if data exists.  
    $scope.releatedByGenre = function (book) {
      return book.id !== $scope.selectedBookId && book.genre.name === $scope.books[$scope.selectedBook].genre.name; 
    };

  }]);

})();