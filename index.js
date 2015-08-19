var apiKey;
var app = angular.module('lolbuild', []);

app.controller('lolbuildController', function($scope, riotAPI){
    $scope.champions;
    $scope.champKeys = [];
    $scope.curChamp;
    $scope.loading = true;

    riotAPI.getAPI().then(function(response){
        apiKey = response.data.key;

        riotAPI.getChampions(apiKey).then(function(response){
            $scope.champions = response.data.data;
            for( obj in response.data.data){
                $scope.champKeys.push(obj);
            }
            $scope.champKeys.sort();
            $scope.curChamp = $scope.champions[$scope.champKeys[24]];
        });

        $scope.updateCurChamp = function(ch){
            $scope.curChamp = $scope.champions[ch];
        }
    });

    $scope.$watch('curChamp',function(){
        $scope.loading = true;
        if($scope.curChamp){
            console.log($scope.curChamp);
            riotAPI.getBuilds(apiKey).then(function(response){
                console.log(response.data);

                $scope.loading = false;
            });
        }   
    });
});

app.factory('riotAPI', function($http){
    function getAPI(){
        return $http.get('riotAPI.json');
    }
    function getChampions(api){
        return $http({
            method: "GET",
            url: 'https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion?champData=all&api_key='+api,
            data:{}
        });
    }
    function getBuilds(api){
        // This will make calls for the core of the application. Best part of the info.
        // Need to get list of top X people from leagues, check history for curChamp, check items built, tally, created chart
        // This below is only step 1 for pulling people
        // Need to be efficient as api rate limit is set so need thought into how will best do this.
        return $http({
            method: "GET",
            url: 'https://na.api.pvp.net/api/lol/na/v2.5/league/challenger?type=RANKED_SOLO_5x5&&api_key='+api,
            data:{}
        });
    }

    return {
        getAPI:getAPI,
        getChampions:getChampions,
        getBuilds:getBuilds
    }
});