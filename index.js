var apiKey;
var app = angular.module('lolbuild', []);

app.controller('lolbuildController', function($scope, $interval,riotAPI){
    $scope.champions;
    $scope.champKeys = [];
    $scope.curChamp;
    $scope.loading = true;
    $scope.stillLoadingChamp = false;
    $scope.items = [];
    $scope.spells = [];
    $scope.tiers = [
        'CHALLENGER',
        'MASTER',
        'DIAMOND',
        'PLATINUM',
        'GOLD',
        'SILVER',
        'BRONZE'
    ];
    $scope.challengerPlayers;
    $scope.masterPlayers;
    $scope.diamondPlayers;
    $scope.platinumPlayers;
    $scope.goldPlayers;
    $scope.silverPlayers;
    $scope.bronzePlayers;
    var numberOfSummonersToAnalyze = 5;

    riotAPI.getAPI().then(function(response){
        apiKey = response.data.key;

        riotAPI.getChampions(apiKey).then(function(response){
            $scope.champions = response.data.data;
            for( obj in response.data.data){
                $scope.champKeys.push(obj);
            }
            $scope.champKeys.sort();
            riotAPI.getItems(apiKey).then(function(itemData){
                $scope.itemData = itemData.data.data;
                riotAPI.getPlayers(apiKey, 'challenger').then(function(resp){
                    $scope.challengerPlayers = resp.data.entries;
                    riotAPI.getPlayers(apiKey, 'master').then(function(res){
                        $scope.masterPlayers = res.data.entries;
                        $scope.loading = false;
                        $scope.curChamp = $scope.champions[$scope.champKeys[24]];
                    });
                });
            });
        });

        $scope.updateCurChamp = function(ch){
            if(!$scope.loading){
                $scope.curChamp = $scope.champions[ch];
            }
        }
    });

    $scope.$watch('curChamp',function(){
        
        if($scope.curChamp && !$scope.loading){
            $scope.loading = true;
            $scope.items = [];
            $scope.spells = [];
            
            $scope.getItemsPerTier(apiKey,$scope.tiers[0],$scope.challengerPlayers);
            $scope.getItemsPerTier(apiKey,$scope.tiers[1],$scope.masterPlayers);
        }   
    });

    $scope.getItemsPerTier = function(api,tier,entries){
                var tier = tier;
                var _items = {};
                var haveTrinket = false;
                var haveBoots = false;
                var _spells = {};
                var count = 0;
                var _finalItems = [];
                var _finalSpells = [];
                $interval(function() {
                    riotAPI.getMatchHistory(apiKey,entries[count++].playerOrTeamId,$scope.curChamp.id).then(function(resp){
                        if(resp.status != 200){
                            count++;
                        } else {
                            for( match in resp.data.matches){
                                var part = resp.data.matches[match].participants[0];
                                // Check items and build a list of them with counts
                                if(_items[part.stats.item0] === undefined){
                                    _items[part.stats.item0] = 1;
                                } else {
                                    _items[part.stats.item0]++;
                                }
                                if(_items[part.stats.item1] === undefined){
                                    _items[part.stats.item1] = 1;
                                } else {
                                    _items[part.stats.item1]++;
                                }
                                if(_items[part.stats.item2] === undefined){
                                    _items[part.stats.item2] = 1;
                                } else {
                                    _items[part.stats.item2]++;
                                }
                                if(_items[part.stats.item3] === undefined){
                                    _items[part.stats.item3] = 1;
                                } else {
                                    _items[part.stats.item3]++;
                                }
                                if(_items[part.stats.item4] === undefined){
                                    _items[part.stats.item4] = 1;
                                } else {
                                    _items[part.stats.item4]++;
                                }
                                if(_items[part.stats.item5] === undefined){
                                    _items[part.stats.item5] = 1;
                                } else {
                                    _items[part.stats.item5]++;
                                }
                                if(_items[part.stats.item6] === undefined){
                                    _items[part.stats.item6] = 1;
                                } else {
                                    _items[part.stats.item6]++;
                                }
                                // Do the same for spells
                                if(_spells[part.spell1Id] === undefined){
                                    _spells[part.spell1Id] = 1;
                                } else {
                                    _spells[part.spell1Id]++;
                                }
                                if(_spells[part.spell2Id] === undefined){
                                    _spells[part.spell2Id] = 1;
                                } else {
                                    _spells[part.spell2Id]++;
                                }
                            }
                            if(count == numberOfSummonersToAnalyze){ 
                                var i = 0;
                                var attempts = 0;
                                while ( i < 6) {
                                    var curHighestItemV = 0;
                                    var curHighestItem;
                                    for(item in _items){
                                        if(item != 0){
                                            if(_items[item] > curHighestItemV){
                                                curHighestItemV = _items[item];
                                                curHighestItem = item;
                                            }
                                        }
                                    }

                                    // Add and make sure they aren't chosen again  
                                    // Also don't include multiple boots or trinkets
                                    var itemToCheck = $scope.itemData[curHighestItem];
                                    if(itemToCheck != undefined && itemToCheck.tags != undefined){
                                        var bootCheck = itemToCheck.tags.indexOf('Boots');
                                        var trinketCheck = itemToCheck.tags.indexOf('Trinket');
                                        if((bootCheck > -1 && !haveBoots) || (trinketCheck > -1 && !haveTrinket)){
                                            _finalItems.push(curHighestItem);
                                            if(bootCheck > -1){
                                                haveBoots = true;
                                            } else {
                                                haveTrinket = true;
                                            }

                                            ++i;
                                        } else if(bootCheck == -1 && trinketCheck == -1){
                                            _finalItems.push(curHighestItem);
                                            ++i;
                                        }                                    
                                    } 
                                    _items[curHighestItem] = -curHighestItemV;
                                    attempts++;
                                    if(attempts >= 50){
                                        break;
                                    }
                                }
                                var j =0;
                                var attempts2 = 0;
                                
                                while( j < 2){
                                    var curHighestSpellV = 0;
                                    var curHighestSpell;
                                    for(spell in _spells){
                                        if(_spells[spell] > curHighestSpellV){
                                            curHighestSpellV = _spells[spell];
                                            curHighestSpell = spell;
                                        }
                                    }
                                    // Add and make sure not chosen again
                                    if(curHighestSpell != undefined){
                                        _finalSpells.push(curHighestSpell);
                                        ++j;
                                    }
                                    _spells[curHighestSpell] = -curHighestSpellV;
                                    attempts2++;
                                    if(attempts2 >= 50){
                                        break;
                                    }
                                }
                                _finalItems.sort();
                                $scope.items[tier] = _finalItems;
                                _finalSpells.sort();
                                $scope.spells[tier] = _finalSpells;
                                $scope.loading = false;
                            }
                        }
                    });
                }, 2500, numberOfSummonersToAnalyze);
    }
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
    function getPlayers(api, league){
        var players;
        // This will make calls for the core of the application. Best part of the info.
        // Need to get list of top X people from leagues, check history for curChamp, check items built, tally, created chart
        // This below is only step 1 for pulling people
        // Need to be efficient as api rate limit is set so need thought into how will best do this.
        return $http({
            method: "GET",
            url: 'https://na.api.pvp.net/api/lol/na/v2.5/league/'+ league +'?type=RANKED_SOLO_5x5&&api_key='+ api,
            data:{}
        });
    }
    function getMatchHistory(api, summoner, champ){
        return $http({
            method: "GET",
            url: 'https://na.api.pvp.net/api/lol/na/v2.2/matchhistory/'+ summoner + '?endIndex=2&championIds='+ champ +'&rankedQueues=RANKED_SOLO_5x5&api_key='+api,
            data:{}
        });
    }
    function getItems(api, item){
        return $http({
            method: "GET",
            url: 'https://global.api.pvp.net/api/lol/static-data/na/v1.2/item?itemListData=tags&api_key='+api,
            data:{}
        });
    }
    return {
        getAPI:getAPI,
        getChampions:getChampions,
        getPlayers:getPlayers,
        getMatchHistory:getMatchHistory,
        getItems:getItems
    }
});