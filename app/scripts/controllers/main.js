'use strict';

/**
* @ngdoc function
* @name panatransWebApp.controller:MainCtrl
* @description
* # MainCtrl
* Controller of the panatransWebApp. This controller handles the mapa stuff
*/

var SERVER_URL = 'http://localhost:3000';
//var SERVER_URL = 'http://test-panatrans.herokuapp.com';

// To test delays
var DELAY = '';
//var DELAY = '&with_delay=true';

var UNKNOWN_STOP_SEQUENCE = -1;
//var LAST_STOP_SEQUENCE = null;
//var FIRST_STOP_SEQUENCE = 0;


angular.module('panatransWebApp')
.controller('MainCtrl', [ '$scope', '$http', '$modal', function ($scope, $http, $modal) {
  
  // it seems that the controller is loaded twice. Doing that makes initialize twice the map, which makes a mess
  if ($scope.map) { 
    return;
  }
  
  $scope.routes = {};
  $scope.stops = {};
  $scope.stopsArr = {};
  $scope.showStopDetail = false; 
  $scope.loadingStopDetail = false;
  $scope.stopDetail = {};
  
  var stopDetailPanelHighlightedStop = null;
  var markers = {};
  var markerIcon = {
    default: L.AwesomeMarkers.icon({
      icon: 'bus',
      prefix: 'fa',
      markerColor: 'blue'
    }), 
    orange: L.AwesomeMarkers.icon({
      icon: 'bus',
      prefix: 'fa',
      markerColor: 'orange'
    }),
    orangeSpin: L.AwesomeMarkers.icon({
      icon: 'bus',
      prefix: 'fa',
      markerColor: 'orange',
      spin: true
    }),     
    pink: L.AwesomeMarkers.icon({
      icon: 'bus',
      prefix: 'fa',
      markerColor: 'pink'
    }), 
    red: L.AwesomeMarkers.icon({
      icon: 'bus',
      prefix: 'fa',
      markerColor: 'red'
    })
  };
   
  //Configure map
  $scope.map = L.map('map', {
    center: [8.9740946, -79.5508536],
    zoom: 13,
    zoomControl: false
  });
    
  L.tileLayer('http://{s}.tiles.mapbox.com/v3/merlos.k99amj6l/{z}/{x}/{y}.png', {
    attribution: '&copy;<a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,© <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
  }).addTo($scope.map);
  $http.get(SERVER_URL + '/v1/routes/with_trips')
  .success(function(response) {
    $scope.routesArray = response.data;
    $.each(response.data, function(index, route) {
      $scope.routes[route.id] = route;
    });
  });
  
  //get stops
  $http.get(SERVER_URL + '/v1/stops/')
  .success(function(response) {
    console.log('Success getting stops!!!');
    //console.log(response.data);
    $scope.stopsArr = response.data;
    $.each(response.data,function(index, stop) {
      $scope.stops[stop.id] = stop;
      var marker = L.marker([stop.lat, stop.lon], 
        {
          icon: markerIcon.default,
          draggable: false,
          title: stop.name
        }
      );
      marker.addTo($scope.map).bindPopup( stop.name);
      //set an id (https://github.com/Leaflet/Leaflet/issues/1031)
        marker._stopId = stop.id; 
        markers[stop.id] = marker; //add the marker to the list of markers
      });
    }); //end $http
    
    
    var stopMarkerPopupOpen = function(e) {
      //there are two scenarios to open a popup:
      // - when making hover to one of the stops listed on the stop-detail panel => only open popu (default action)
      // - when user clicked over a stop in the map => display the stop detail in the stop-detail panel 
      console.log('stopMarkerPopupOpen');
      console.log (stopDetailPanelHighlightedStop);
      if (stopDetailPanelHighlightedStop === null) {
        //it was a click
        stopMarkerClicked(e);
      }
    };
    
    //When a stop in the map is clicked
    var stopMarkerClicked = function(e) {    
      //display lateral div & loading
      console.log('popupOpen - stopMarkerClicked'); 
      $scope.showStopDetail = true;  
      console.log(e);
      var stopId = e.popup._source._stopId;
      if ($scope.stops[stopId].routes) { //if we already downloaded the stop detail then routes is defined
        $scope.$apply(function() { //http://stackoverflow.com/questions/20954401/angularjs-not-updating-template-variable-when-scope-changes
          $scope.stopDetail = $scope.stops[stopId]; 
          updateMarkersForSelectedStop(stopId);
        });        
      } else { //get the stop data
        markers[stopId].setIcon(markerIcon.orangeSpin);
        $scope.loadingStopDetail = true;
        $http.get(SERVER_URL + '/v1/stops/' + stopId + '?with_stop_sequences=true' + DELAY)
        .success(function(response) {
          $scope.loadingStopDetail = false;
          console.log('Success getting stop info');
          console.log(response.data);
          $scope.stopDetail= response.data; 
          $scope.stops[$scope.stopDetail.id] = response.data;
          updateMarkersForSelectedStop(stopId);
        });
      } //else
    }; // on(popupopen)
    
    
    var stopMarkerPopupClosed = function(e) {
      console.log('stopMarkerClosed');
      //clear markers color
      if (stopDetailPanelHighlightedStop === null) {
        $.each(markers, function(index, marker) {
          marker.setIcon(markerIcon.default);
        }); 
      }  
    };
    
    $scope.map.on('popupopen', stopMarkerPopupOpen); 
    $scope.map.on('popupclose', stopMarkerPopupClosed);
    
    
    $scope.closeStopDetail = function() {
      $scope.showStopDetail = false;
    };
    
    $scope.isFirstStopInTrip = function(stop, trip) {
      /*jshint camelcase: false */
      var isFirst = false;
      $.each(trip.stop_sequences, function(index, stopSequence){
        if ((stopSequence.sequence === 0) && (stopSequence.stop_id === stop.id)) {
          isFirst = true;
        }
      });
      return isFirst;
    };
  
    $scope.isLastStopInTrip = function(stop, trip) {
      /*jshint camelcase: false */
      var largestSequence = -1;
      var stopIdWithLargestSequence = -1;
      $.each(trip.stop_sequences, function(index, stopSequence){
        if (stopSequence.sequence > largestSequence) {
          largestSequence = stopSequence.sequence;
          stopIdWithLargestSequence = stopSequence.stop_id;
        }
      });
      if (stopIdWithLargestSequence === stop.id) {
        return true;
      }
      return false;
    };
    
    
    $scope.highlightStop = function(stop) {
      console.log('highlight stop'  + stop.name);
      stopDetailPanelHighlightedStop = stop;
      markers[stop.id].openPopup();
    };
    
    
    $scope.lowlightStop = function(stop) {
      console.log('loglight stop'  + stop.name);
      markers[$scope.stopDetail.id].openPopup(); 
      stopDetailPanelHighlightedStop = null;
    };
  
    
    var setIconForStopSequencesOnRoute = function(route, icon) {
      /*jshint camelcase: false */
      $.each(route.trips, function(index, trip) {
        $.each(trip.stop_sequences, function(index, stopSequence) { 
          markers[stopSequence.stop_id].setIcon(icon);
        }); //stopSequence
      }); // trip
    };
    
    
    var updateMarkersForSelectedStop = function(stopId) {
        //search for all stops that are linked with this stop through trips that include this stop
      $.each($scope.stopDetail.routes, function(index, route) {
        setIconForStopSequencesOnRoute(route, markerIcon.orange);
      }); //route
      
      markers[stopId].setIcon(markerIcon.red); 
    };
    
      
    // searches for stop_sequences on the route and sets the orange icon
    //route: has trips and trips have stop_sequences
    $scope.highlightRoute = function(route) {
      console.log('highlight route '  + route.name);
      setIconForStopSequencesOnRoute(route, markerIcon.red); 
    };
    
  
    // searches for stop_sequences on the route and sets the grey icon
    //route: has trips and trips have stop_sequences
    $scope.lowlightRoute = function(route) {
      setIconForStopSequencesOnRoute(route, markerIcon.orange); 
      markers[$scope.stopDetail.id].setIcon(markerIcon.red);   
    };
 
    
    // Display/hide edit route stops on mouse over
    $scope.hoverIn = function(){
      this.hoverEdit = true;
    };
    $scope.hoverOut = function(){
      this.hoverEdit = false;
    };
    
    
    $scope.toggleTripDetails = function(){
      console.log('toggle');
      if ((this.showTripDetails === false) || (this.showTripDetails === undefined)){ 
        this.showTripDetails = true; 
      } else {
        this.showTripDetails = false;
      }
      console.log('showTripDetails: ' + this.showTripDetails);
    };
    
    
    $scope.openEditStopRoutesModal = function(stopId){
      var modalInstance = $modal.open({
        templateUrl: 'EditStopRoutesModal.html',
        size: 'lg',
        controller: 'EditStopRoutesModalInstanceCtrl',
        backdrop: 'static',
        stopId: stopId,
        resolve: { //variables passed to modal scope
          routes: function() {
            return $scope.routesArray;
          },
          stop: function () {
            return $scope.stopDetail;
          }
        }
      });
      modalInstance.result.then(function () {
      }, function () {
      });
    };
    
    
    $scope.openEditRouteStopsModal = function(routeId){
      var modalConfig = {
        templateUrl: 'EditRouteStopsModal.html',
        size: 'lg',
        controller: 'EditRouteStopModalInstanceCtrl',
        backdrop: 'static',
        routeId: routeId,
        resolve: { //variables passed to modal scope
          route: function() {
            return $scope.routes[routeId];
          },
          stopsArr: function() {
            return $scope.stopsArr;
          }
        }
      };
      $modal.open(modalConfig);  
    };
    
    
    $scope.openNewRouteModal = function(){
      var modalConfig = {
        templateUrl: 'NewRouteModal.html',
        size: 'lg',
        controller: 'NewRouteModalInstanceCtrl',
        backdrop: 'static',
        resolve: { //variables passed to modal scope  
        }
      };
      $modal.open(modalConfig);  
    };
  }]
); // main controller















//
// Edit Routes of a Stop Modal Controller
//
angular.module('panatransWebApp')
.controller('EditStopRoutesModalInstanceCtrl', function ($scope, $http, $modalInstance, routes, stop) {
  $scope.stop = stop;
  $scope.routes = routes;
  console.log(routes);
  
  $scope.tripNotAlready = function(obj) {
    var ret = true;
    $.each($scope.stop.routes, function(index, route) {
      $.each(route.trips, function(index, trip) {
        //console.log('obj: ' + obj.id + ' trip: ' + trip.id + "r:" + (trip.id == obj.id));
        if (trip.id === obj.id) {
          ret = false;
        }
      }); //route.trips
    }); //stop.routes
    return ret;
  };
  
  $scope.searchFilter = function (obj) {
    var re = new RegExp($scope.searchText, 'i');
    //console.log('searchFilter: ' + obj.name + ' result: ' + (!$scope.searchText || re.test(obj.name)));
    return !$scope.searchText || re.test(obj.name);
  };
  
  $scope.addTrip = function (tripId) {
    //update ui
    console.log('addTrip: ' + tripId);
    //update server stop_sequence for this trip and stop
    $http.post(SERVER_URL + '/v1/stop_sequences/', 
    {'stop_sequence': {
      'unknown_sequence': true, 
      'stop_id': $scope.stop.id, 
      'trip_id': tripId
    }})
    .success(function(response) {
      console.log('added trip to stop');
      console.log(response);
      var newTrip = response.data.trip;
        
      //Update local models
        
      var routeFound = false; // we don't know if the stop has already this route
      //Two possibilities:
      // 1. route is already in the stop.routes (only add the trip to that route)
      // 2. not in list, we need to add the route with the trip to stop.routes
      
      $.each($scope.stop.routes, function(index, route) {
        if(route.id === newTrip.route.id) {
          routeFound = true;
          $scope.stop.routes[index].trips.push(newTrip);
        } 
      }); 
      if (!routeFound) { //we need to add the route and the trip to the stop
        var routeWithTrip = newTrip.route;
        routeWithTrip.trips = [newTrip];
        $scope.stop.routes.push(routeWithTrip);
      }
        
    })
    .error(function(response) {
      console.log('error adding trip to stop');
      console.log(response);
    });
    //update local model
  };
  $scope.deleteTrip = function(tripId) {
    $http.delete(SERVER_URL + '/v1/stop_sequences/trip/' + tripId + '/stop/' + $scope.stop.id)
    .success(function(response) {
      console.log(response);
      console.log('awesome! Trip and stop unlinked');
      $.each($scope.stop.routes, function(indexRoute, route){
        $.each(route.trips, function(indexTrip, trip){
          if (trip.id === tripId) { //remove trip
            $scope.stop.routes[indexRoute].trips.splice(indexTrip,1);
          }
        }); //each trips
      }); //each routes
    })
    .error(function(response) {
      console.log('error removing trip from stop');
      console.log(response);
    });
  };
  $scope.close = function () {
    $modalInstance.close();
  };
}
);  
  
  
  
  
  
  
  
  
  
  
//
// Edit Routes of a Stop Modal Controller
//
angular.module('panatransWebApp')
.controller('EditRouteStopModalInstanceCtrl', function ($scope, $http, $modalInstance, route, stopsArr) {
    
$scope.sortedStopSequences = {};
$scope.unknownStopSequences = {};
// updates the route model by getting a fresh version from the server
var updateRoute = function() { 
  $http.get(SERVER_URL + '/v1/routes/' + $scope.route.id + '?' + DELAY)
  .success(function(response) {
    //console.log('success getting route detail');
    $scope.route = response.data;
    $scope.loading = false;
    //console.log($scope.route);
    //for each trip create an array with all sorted sequences (stop_sequence.sequence != null)
    $.each($scope.route.trips, function(index, trip){
      $scope.sortedStopSequences[trip.id] = []; 
      $scope.unknownStopSequences[trip.id] = []; 
      /*jshint camelcase: false */
      $.each(trip.stop_sequences, function(index, stopSequence){
        if (stopSequence.sequence !== null) {
          $scope.sortedStopSequences[trip.id].push(stopSequence);
          //console.log($scope.sortedStopSequences[trip.id]);
        } else {
          $scope.unknownStopSequences[trip.id].push(stopSequence);
        }
      });
    });
  })
  .error(function(response){
    console.log('WTF! Something wrong with the route!');
    console.log(response);
  });
};
    
        
$scope.loading = true;
$scope.route = route;
$scope.stopsArr = stopsArr; //all the stops
$scope.newStopSequence = {};
$scope.dragControlListeners = {};
    
    
$.each(route.trips, function(index, trip){
      
  // initialize newStopSequence for each trip
  // note: we are not creating a stop, we are creating a stop sequence, the link 
  // between a trip and a stop 
  $scope.newStopSequence[trip.id] = {
    stop: null,
    trip: trip,
    sequence: UNKNOWN_STOP_SEQUENCE
  }; 
      
  //create dragControlListeners for ng-sortable
  //  - We have a set of trips 
  //  - On each trip we have sorted and unsorted sequences
      
  $scope.dragControlListeners[trip.id] = {};
  $.each(['sorted', 'unknown'] , function(index, sortStatus) {
    console.log(sortStatus + ' -------'  + trip.id);
        
    $scope.dragControlListeners[trip.id][sortStatus] = {
      accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {
        //override to determine drag is allowed or not. default is true.
        /*console.log('sourceItem: ');
        console.log(sourceItemHandleScope);
        console.log('destSortable');
        console.log(destSortableScope);*/
        //return sourceItemHandleScope.itemScope.sortableScope.$id === destSortableScope.$id; 
        return true;         
      },
      /*
      dragStart: function (event) {
      console.log('drag start');
      console.log(event);
      },
      dragEnd: function (event) {
      console.log('drag end');
      console.log(event);
      },
      */
      itemMoved: function (event) {
        //Do what you want
        console.log('source sort' + sortStatus); //source status
        console.log('source trip.id' + trip.id); //source trip
        console.log('itemMoved');
        console.log(event);
        console.log('nueva posición: ' + (event.dest.index));
        console.log('dest trip:' + event.dest.sortableScope.$parent.trip.id);
        console.log('src seq:' + event.source.itemScope.modelValue.sequence);
        console.log('dest sortStatus' + event.dest.sortableScope.options.containment.indexOf('unknown'));
            
            
        var destTrip = event.dest.sortableScope.$parent.trip; //destination Trip
        var stopSequence = event.source.itemScope.modelValue;
            
        var putData;
        //change trip?
        if (destTrip.id === trip.id) { //same trip
          if (stopSequence.sequence === null) { //moved to a sorted position
            stopSequence.sequence = event.dest.index;
            putData = {
              'stop_sequence': {
                'sequence': event.dest.index
              }
            };
          } else { //was moved to a unknown position
            stopSequence.sequence = null;
            putData = { 
              'stop_sequence': {
                'unknown_sequence' : true
              }
            };
          }
        } else { // != trip => we move it to the other trip but in unknown position
          if (event.dest.sortableScope.options.containment.indexOf('unknown') === 0) { 
            stopSequence.sequence = null;
            putData = {
              'stop_sequence': {
                'unknown_sequence' : true,
                'trip_id' : destTrip.id
              }
            };
          } else {
            stopSequence.trip = destTrip;
            stopSequence.sequence = event.dest.index;
            putData = {
              'stop_sequence': {
                'sequence': event.dest.index,
                'trip_id' : destTrip.id
              }
            }; 
          }
        }
        //put data
        console.log('putData');
        //console.log(putData.stop_sequence);
        console.log(stopSequence);
        $http.put(SERVER_URL + '/v1/stop_sequences/' + stopSequence.id, putData)
        //download route with the updated data
        .success( function() {
          //console.log('updated stop sequence!');
          updateRoute();
        });
            
      },
      orderChanged: function(event) {
        console.log('orderChanged ');
        console.log('nueva posición: ' + (event.dest.index));
        console.log(event);
        //if we changed the order on the list of uordered items do nothing on the server
        if (event.dest.sortableScope.options.containment.indexOf('unknown') === 0) { 
          return;
        }
        var newSequence = event.dest.index;
        var stopSequence = event.source.itemScope.modelValue;
        console.log('nueva posición: ' + (event.dest.index));
        //Update Sequence
        var putData = {'stop_sequence': {sequence: newSequence} };
        $http.put(SERVER_URL + '/v1/stop_sequences/' + stopSequence.id, putData)
        //download route with the updated data
        .success( function() {
          console.log('updated stop sequence!');
          updateRoute();
        });
      },
      //containment is used
      containment: sortStatus + '_' + trip.id
    };
  }); //sorted
});
//console.log($scope.newStopSequence);
console.log($scope.dragControlListeners);
              
if (route.trips[0].stops) {
  $scope.loading = false;
} else {
  updateRoute();
}
    
    
    
    
    
$scope.deleteStopSequence = function (stopSequence) {
  $http.delete(SERVER_URL + '/v1/stop_sequences/' + stopSequence.id)
  .success( function(response) {
    console.log('removed stop sequence success!');
    updateRoute();
  });
};
    
    
// Add stop to a trip 
// Position: -1 unk, 0 => beginning, > 1 000 000 => end
$scope.addStopToTrip = function (tripId) {
  var unknownSequence = false;
  console.log('stopSequence:' + $scope.newStopSequence[tripId].sequence);
      
  if ($scope.newStopSequence[tripId].sequence === UNKNOWN_STOP_SEQUENCE) {
    unknownSequence = true;
  }
      
  var postData =  {
    'stop_sequence': {
      'sequence': $scope.newStopSequence[tripId].sequence, 
      'unknown_sequence': unknownSequence,
      'stop_id': $scope.newStopSequence[tripId].stop.id,
      'trip_id': tripId
    }
  };
      
  console.log('addStopToTrip postData:');
  console.log(postData);
      
  $http.post(SERVER_URL + '/v1/stop_sequences/', postData)
  .success(function(response) {
    updateRoute();
  });
};
        
$scope.close = function () {
  $modalInstance.close();
};
}
);  
  
  
