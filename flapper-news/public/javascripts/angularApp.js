var app = angular.module('flapperNews', ['ui.router'])


app.factory('posts', ['$http', function ($http) {
    var o = {
        posts: []
    };

    o.getAll = function () {
        return $http.get('/posts').success(function (data) {
            angular.copy(data, o.posts);
        });
    };
    o.create = function (post) {
        return $http.post('/posts', post).success(function (data) {
            o.posts.push(data);
        });
    };
    o.get = function (id) {
        return $http.get('/posts/' + id).then(function (res) {
            return res.data;
        });
    };
    o.addComment = function (id, comment) {
        return $http.post('/posts/' + id + '/comments', comment);
    };
    o.upvoteComment = function (post, comment) {
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
            .success(function (data) {
                comment.upvotes += 1;
            });
    };
    return o;

}]);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('home', {
            url: '/home'
            , templateUrl: '/home.html'
            , controller: 'MainCtrl'
            , resolve: {
                postPromise: ['posts', function (posts) {
                    return posts.getAll();
                }]
            }
        })
        .state('posts', {
            url: '/posts/{id}'
            , templateUrl: '/posts.html'
            , controller: 'PostsCtrl'
            , resolve: {
                post: ['$stateParams', 'posts', function ($stateParams, posts) {
                    return posts.get($stateParams.id);
                    }]
            }

        });

    $urlRouterProvider.otherwise('home');
}]);

app.controller('MainCtrl', ['$scope', 'posts', function ($scope, posts) {
    $scope.test = 'Hello world!';
    $scope.posts = posts.posts;
    $scope.incrementUpvotes = function (post) {
        posts.upvote(post);
    };
    $scope.addPost = function () {
        if (!$scope.title || $scope.title === '') {
            return;
        }
        posts.create({
            title: $scope.title
            , link: $scope.link
        , });
        $scope.title = '';
        $scope.link = '';
    };
}]);

app.controller('PostsCtrl', ['$scope', '$stateParams', 'posts', function ($scope, $stateParams, posts) {
    $scope.post = posts.posts[$stateParams.id];

}]);