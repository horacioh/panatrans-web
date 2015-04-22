"use strict";function Route(a,b,c){var d=c({url:_CONFIG.serverUrl+"/v1/routes",name:"route"});return d.routes={},d.all=function(){var b=a.defer();return console.log("routes.length:"+d.routes.length),Object.hasItems(d.routes)?b.resolve(d.routes):(console.log("Route:all: requesting routes to server"),d.query({with_trips:!0}).then(function(a){angular.forEach(a.data,function(a){d.routes[a.id]=a}),b.resolve(d.routes)},function(a){console.log("Route:all.error"),b.reject(a)})),b.promise},d}function Stop(a,b,c,d){var e={url:_CONFIG.serverUrl+"/v1/stops",name:"stop",serializer:c(function(){this.resource("data","Stop"),this.exclude("routes"),this.resource("routes","Route")})},f=d(e);return f.stops={},f.beforeRequest(function(a){console.log("beforeRequest"),console.log(a)}),f.all=function(){var b=a.defer();return Object.hasItems(f.stops)?b.resolve(f.stops):(console.log("Stops:all: requesting stops to server"),f.query().then(function(a){angular.forEach(a.data,function(a){f.stops[a.id]=a}),b.resolve(f.stops)},function(a){console.log("Stops:all.error"),b.reject(a)})),b.promise},f.find=function(b,c){c="undefined"!=typeof c?c:!1;var d=a.defer();return f.stops[b].routes&&!c?d.resolve(f.stops[b]):(console.log("Stops:find: requesting stop detail"),f.get(b,{with_stop_sequences:!0}).then(function(a){f.stops[b]=a.data,d.resolve(a.data)},function(a){d.reject(a)})),d.promise},f.getRouteStops=function(a){var b=[];return angular.forEach(a.trips,function(a){angular.forEach(a.stopSequences,function(a){b.push(stopMarkers[a.stopId].stop)})}),b},f.getStopsForTrip=function(a){var b=[];return angular.forEach(a.stopSequences,function(a){b.push(stopMarkers[a.stopId].stop)}),b},f.stopsAsArray=function(){var a=[];return angular.forEach(this.stops,function(b){a.push(b)}),a},f.isFirstStopInTrip=function(a,b){var c=!1;return angular.forEach(b.stopSequences,function(b){0===b.sequence&&b.stopId===a.id&&(c=!0)}),c},f.isLastStopInTrip=function(a,b){var c=-1,d=-1;return angular.forEach(b.stopSequences,function(a){a.sequence>c&&(c=a.sequence,d=a.stopId)}),d===a.id?!0:!1},f}!function(){var a=L.Marker.prototype.onAdd;L.Marker.mergeOptions({bounceOnAdd:!1,bounceOnAddDuration:1e3,bounceOnAddHeight:-1}),L.Marker.include({_toPoint:function(a){return this._map.latLngToContainerPoint(a)},_toLatLng:function(a){return this._map.containerPointToLatLng(a)},_animate:function(a){var b=new Date,c=setInterval(function(){var d=new Date-b,e=d/a.duration;e>1&&(e=1);var f=a.delta(e);a.step(f),1===e&&(a.end(),clearInterval(c))},a.delay||10)},_move:function(a,b){var c=L.latLng(this._orig_latlng),d=this._drop_point.y,e=this._drop_point.x,f=this._point.y-d,g=this;this._animate({delay:10,duration:b||1e3,delta:a,step:function(a){g._drop_point.y=d+f*a-(g._map.project(g._map.getCenter()).y-g._orig_map_center.y),g._drop_point.x=e-(g._map.project(g._map.getCenter()).x-g._orig_map_center.x),g.setLatLng(g._toLatLng(g._drop_point))},end:function(){g.setLatLng(c)}})},_easeOutBounce:function(a){return 1/2.75>a?7.5625*a*a:2/2.75>a?7.5625*(a-=1.5/2.75)*a+.75:2.5/2.75>a?7.5625*(a-=2.25/2.75)*a+.9375:7.5625*(a-=2.625/2.75)*a+.984375},bounce:function(a,b){this._orig_map_center=this._map.project(this._map.getCenter()),this._drop_point=this._getDropPoint(b),this._move(this._easeOutBounce,a)},_getDropPoint:function(a){this._point=this._toPoint(this._orig_latlng);var b;return b=void 0===a||0>a?this._toPoint(this._map.getBounds()._northEast).y:this._point.y-a,new L.Point(this._point.x,b)},onAdd:function(b){this._map=b,this._orig_latlng=this._latlng,this.options.bounceOnAdd===!0&&(this._drop_point=this._getDropPoint(this.options.bounceOnAddHeight),this.setLatLng(this._toLatLng(this._drop_point))),a.call(this,b),this.options.bounceOnAdd===!0&&this.bounce(this.options.bounceOnAddDuration,this.options.bounceOnAddHeight)}})}();var _CONFIG={};_CONFIG.serverUrl="http://api.panatrans.org",_CONFIG.tilelayerUrl="http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",_CONFIG.tilelayerAttribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',_CONFIG.delay="",$(".navbar .navbar-link").click(function(){var a=$(".navbar-toggle");a.is(":visible")&&a.trigger("click")}),angular.module("panatransWebApp",["ngAnimate","ngCookies","ngMessages","ngResource","ngRoute","ngTouch","ui.bootstrap","ui.sortable","angular-toArrayFilter","ngToast","slugifier","rails"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/rutas",{templateUrl:"views/routes.html",controller:"RoutesCtrl"}).when("/paradas",{templateUrl:"views/stops.html",controller:"StopsCtrl"}).when("/ruta/:routeId/:slug.html",{templateUrl:"views/routes-show.html",controller:"RoutesShowCtrl"}).when("/parada/:stopId/:slug.html",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/colabora",{templateUrl:"views/contribute.html",controller:"ContributeCtrl"}).when("/acercade",{templateUrl:"views/about.html",controller:"AboutCtrl"}).when("/licencias",{templateUrl:"views/licenses.html",controller:"LicensesCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("panatransWebApp").config(["ngToastProvider",function(a){a.configure({verticalPosition:"top",horizontalPosition:"center",maxNumber:3})}]),Object.hasItems=function(a){var b;for(b in a)if(a.hasOwnProperty(b))return!0;return!1},angular.module("panatransWebApp").service("Route",["$q","$http","railsResourceFactory",Route]),Object.hasItems=function(a){var b;for(b in a)if(a.hasOwnProperty(b))return!0;return!1},angular.module("panatransWebApp").service("Stop",["$q","$http","railsSerializer","railsResourceFactory",Stop]),angular.module("panatransWebApp").factory("PanatransMap",["$compile","$q","$http",function(a,b,c){return function(d,e,f){function g(b,c,d){var e=L.marker(b,c,d);return e._stop={},e.setPopupTemplate=function(b,c){c="undefined"!=typeof c?c:"<p>{{stop.name}}</p>";var d=a(angular.element(c)),f=b.$new();f.stop=this._stop,f.stopMarker=this;var g=d(f);e.bindPopup(g[0])},e}var h=L.map(d,{center:[8.9740946,-79.5508536],zoom:16,zoomControl:!1});return h.$scope=null,h.highlightedStops=[],h.stopMarkers={},h.iconset={"default":L.AwesomeMarkers.icon({icon:"bus",prefix:"fa",markerColor:"blue"}),orange:L.AwesomeMarkers.icon({icon:"bus",prefix:"fa",markerColor:"orange"}),orangeSpin:L.AwesomeMarkers.icon({icon:"bus",prefix:"fa",markerColor:"orange",spin:!0}),pink:L.AwesomeMarkers.icon({icon:"bus",prefix:"fa",markerColor:"pink"}),red:L.AwesomeMarkers.icon({icon:"bus",prefix:"fa",markerColor:"red"}),redSpin:L.AwesomeMarkers.icon({icon:"bus",prefix:"fa",markerColor:"red",spin:!0}),userLocation:L.AwesomeMarkers.icon({icon:"user",prefix:"fa",markerColor:"green",spin:!1})},h.selectedMarkerIcon=h.iconset.red,h.highlightedMarkerIcon=h.iconset.orange,h.defaultMarkerIcon=h.iconset["default"],h.minZoomWithMarkers=15,h.mapHasMarkers=!0,h.onZoomEnd=function(){if(console.log("onZoomEnd"),console.log("zoomLevel: "+this.getZoom()),this.getZoom()<h.minZoomWithMarkers)this.hideAllMarkers(),h.mapHasMarkers=!1;else{if(this.mapHasMarkers)return;h.showMarkersInsideBounds(),this.mapHasMarkers=!0}},h.onMoveEnd=function(){console.log("onMoveEnd"),this.getZoom()>=15&&(this.hideMarkersOutsideBounds(),this.showMarkersInsideBounds())},h.stopMarkerPopupOpen=function(a){console.log("Panatrans stopMarker Popup Open");var b=a.popup._source._stop;h.stopMarkers[b.id].setIcon(h.selectedMarkerIcon),h.panToStop(b)},h.stopMarkerPopupClose=function(a){console.log("Panatrans stopMarker Popup Close");var b=a.popup._source._stop;if(void 0!==h.stopMarkers[b.id]){var c=h.stopMarkers[b.id];c.setIcon(h.isStopHighlighted(b)?h.highlightedIcon:h.defaultMarkerIcon)}},h.createStopMarker=function(a,b){var c=g([a.lat,a.lon],{icon:h.defaultMarkerIcon,draggable:!1});return c._stop=a,c.setPopupTemplate(h.$scope,b),this.stopMarkers[a.id]=c,c},h.panToStop=function(a){h.panTo(h.stopMarkers[a.id].getLatLng())},h.openStopPopup=function(a){console.log("requesting open popup of :"+a.name),h.stopMarkers[a.id].openPopup()},h.removeStopMarker=function(a){h.removeLayer(stopMarkers[a]),delete this.stopMarkers[a.id]},h.removeAllStopMarkers=function(){angular.forEach(stopMarkers,function(){this.removeStopMarker(g.stop)})},h.hideAllMarkers=function(){angular.forEach(this.stopMarkers,function(a){h.removeLayer(a)})},h.hideMarkersOutsideBounds=function(){console.log("hideMarkerOutsideBounds, started");var a=this.getBounds().pad(.2);angular.forEach(this.stopMarkers,function(b){a.contains(b.getLatLng())||h.removeLayer(b)}),console.log("hideMarkersOutsideBounds, finished")},h.showMarkersInsideBounds=function(){console.log("showMarkerInsideBounds, started");var a=this.getBounds().pad(.2);angular.forEach(this.stopMarkers,function(b){a.contains(b.getLatLng())&&h.addLayer(b)}),console.log("showMarkerInsideBounds, started")},h.isStopHighlighted=function(a){var b;for(b=0;b<h.highlightedStops.length;b++)if(h.highlightedStops[b]===a)return!0;return!1},h.pdfLayers={},h.isRoutePdfAvailable=function(a){var d=b.defer();if(void 0!==h.pdfLayers[a.id])d.resolve();else{var e="https://dl.dropboxusercontent.com/u/22698/metrobus/";c.get(e+a.id+"/kml/tilemapresource.xml").success(function(b){var c=b.match(/(minx|miny|maxx|maxy)=\"([\-\.\d]+)\"/g);angular.forEach(c,function(a,b){c[b]=a.match(/([\-\.\d]+)/g)[0]});var f=[[c[1],c[0]],[c[3],c[2]]];console.log(c),console.log("cool! The pdf is geolocated route_id:"+a.id);var g={minZoom:10,maxZoom:20,maxNativeZoom:14,opacity:.8,tms:!0},i=e+a.id+"/kml/{z}/{x}/{y}.png";console.log("tilesUrl: "+i),h.pdfLayers[a.id]=L.tileLayer(i,g),h.pdfLayers[a.id]._bounds=f,h.pdfLayers[a.id]._show=!1,d.resolve()}).error(function(a,b){d.reject(a,b)})}return d.promise},h.showRoutePdf=function(a){console.log("showRoutePdf:"+a.id),h.pdfLayers[a.id]._show===!1&&(h.pdfLayers[a.id].addTo(h),h.pdfLayers[a.id]._show=!0)},h.hideRoutePdf=function(a){console.log("hideRoutePdf:"+a.id),h.pdfLayers[a.id]._show===!0&&(h.removeLayer(h.pdfLayers[a.id]),h.pdfLayers[a.id]._show=!1)},h.toggleRoutePdf=function(a){return console.log("toggleRoutePdf:"+a.id),h.pdfLayers[a.id]._show===!1?h.showRoutePdf(a):h.hideRoutePdf(a),h.pdfLayers[a.id]._show},h.tileLayer=L.tileLayer(e,{attribution:f,maxZoom:20}),h.userLocationMarker=null,h.userLocationCircle=null,h.followUser=!1,h.locateUser=function(){h.locate({watch:!0,setView:!1,enableHighAccuracy:!0})},h.onLocationFound=function(a){if(null!==a.accuracy){var b=a.accuracy/2;null===userLocationMarker&&(h.userLocationMarker=L.marker(a.latlng,{icon:h.iconset.userLocation}),h.userLocationMarker.addTo(h),userLocationCircle=L.circle(a.latlng,b),userLocationCircle.addTo(h),userLocationMarker.bindPopup("Estás aquí"),h.panTo(a.latlng)),userLocationMarker.setLatLng(a.latlng),userLocationCircle.setLatLng(a.latlng),userLocationCircle.setRadius(b),h.followUser&&h.panTo(a.latlng)}},h.onLocationError=function(a){console.log(a.message)},h.on("locationfound",h.onLocationFound),h.on("locationerror",h.onLocationError),h.tileLayer.addTo(h),h.on("zoomend",h.onZoomEnd),h.on("moveend",h.onMoveEnd),h}}]),angular.module("panatransWebApp").controller("MainCtrl",["$scope","$compile","$http","$modal","$routeParams","ngToast","Route","Stop","PanatransMap",function(a,b,c,d,e,f,g,h,i){if(!a.map){{(function(){var a=!1;return function(b){(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(b)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(b.substr(0,4)))&&(a=!0)}(navigator.userAgent||navigator.vendor||window.opera),a})()}a.routes={},a.stops={},a.showStopDetail=!1,a.loadingStopDetail=!1,a.stopDetail={};var j={},k=null,l=function(b){a.showStopDetail=!0,a.loadingStopDetail=!0;var c=b.popup._source._stop;a.map.panToStop(c),h.find(c.id).then(function(b){a.stopDetail=b,a.loadingStopDetail=!1},function(b){a.loadingStopDetail=!1,console.log("error getting stop details"),console.log(b)})},m=function(){console.log("stopMarkerClosed")};a.map=i("map",_CONFIG.tilelayerUrl,_CONFIG.tilelayerAttribution),a.map.$scope=a,h.all().then(function(b){a.stops=b,angular.forEach(a.stops,function(b){var c=a.map.createStopMarker(b);c.on("popupopen",l),c.on("popupclose",m)}),a.map.showMarkersInsideBounds(),console.log("routeParams"),console.log(e),void 0!==e.stopId&&(console.log("Centering Map on Stop: "+a.stops[e.stopId].name),void 0!==a.stops[e.stopId]&&a.map.openStopPopup(a.stops[e.stopId]))},function(){f.create({timeout:8e3,className:"danger",content:"<strong>Error obteniendo información de paradas.</strong><br> Prueba en un rato. Si nada cambia tuitéanos: @panatrans"})}),g.all().then(function(b){a.loading=!1,a.routes=b},function(b){a.loading=!1,console.log("Error loading Routes.all()"),f.create({timeout:8e3,className:"danger",content:"<strong>Error obteniendo información de rutas</strong>.<br> Prueba en un rato. Si nada cambia tuitéanos: @panatrans"}),console.log(b)}),a.closeStopDetail=function(){a.showStopDetail=!1},a.isLastStopInTrip=h.isLatStopInTrip,a.isFirstStopInTrip=h.isFirstStopInTrip,a.highlightStop=function(a){console.log("highlight stop"+a.name)},a.lowlightStop=function(a){console.log("loglight stop"+a.name)},a.highlightRoute=function(){},a.lowlightRoute=function(){},a.hoverIn=function(){this.hoverEdit=!0},a.hoverOut=function(){this.hoverEdit=!1},a.toggleTripDetails=function(){console.log("toggle"),this.showTripDetails=this.showTripDetails===!1||void 0===this.showTripDetails?!0:!1,console.log("showTripDetails: "+this.showTripDetails)},a.openEditStopModal=function(b){var c=d.open({templateUrl:"views/modals/edit-stop.html",size:"lg",controller:"EditStopModalInstanceCtrl",backdrop:!0,stopId:b,resolve:{routes:function(){return a.routesArray},stop:function(){return a.stopDetail}}});c.result.then(function(){},function(c){console.log("modal instance dismissed reason : "+c),"changeStopLocation"===c&&(console.log("changeStopLocation: "+b),n(markers[b])),"stopDeleted"===c&&(console.log("deletedStop, eliminating marker and stop"),a.map.removeLayer(markers[b]),f.create("Se ha borrado la parada "+a.stops[b].name),delete markers[b],delete a.stops[b])})},a.togglePdfLayer=function(b){a.map.isRoutePdfAvailable(b).then(function(){f.create(a.map.toggleRoutePdf(b)?"En unos segundos se mostrará el PDF de la ruta en el mapa...":{className:"info",content:"Se ha dejado de mostrar el PDF en el mapa"})},function(a,b){console.log("Geolocated pdf does not exists"),console.log(a),console.log(b),f.create({className:"danger",content:"No hay asociado con esta ruta un PDF Geolocalizado"})})};var n=function(c){console.log("setStopMarkerEditMode"),c.setIcon(iconset.redSpin),c.dragging.disable(),c.dragging.enable(),c.off("popupopen",l),c.off("popupclose",m),a.map.setView(c.getLatLng(),18);var d=a.stops[c._stopId],e="<div><h4>"+d.name+'</h4><p><strong>Arrástrame</strong> hasta mi localización.<br>Después dale a: </p><button ng-click="saveStopLocation(stop)"class="btn btn-primary">Actualizar</button> o a <a href="" ng-click="cancelStopMarkerEditMode(stopMarker)">cancelar</a></div>',f=b(angular.element(e)),g=a.$new();g.stop=d,g.stopMarker=c;var h=f(g);c.bindPopup(h[0]).openPopup(),c.on("dragend",function(b){console.log("dragend called!!");var c=b.target;c.openPopup();var e=c.getLatLng();d.lat=e.lat,d.lon=e.lng,console.log(a.newStop)})};a.cancelStopMarkerEditMode=function(b){console.log("cancelStopMarkerEditMode"),b.closePopup(),b.dragging.disable(),b.setIcon(iconset.red),console.log("setting popup content = "+a.stops[b._stopId].name),b.bindPopup(a.stops[b._stopId].name),b.on("popupopen",l),b.on("popupclose",m),b.openPopup()},a.saveStopLocation=function(b){console.log("saveStopLocation called"),b.update(),a.cancelStopMarkerEditMode(markers[b.id])},a.openEditRouteModal=function(b){var c={templateUrl:"views/modals/edit-route.html",size:"lg",controller:"EditRouteModalInstanceCtrl",backdrop:!0,routeId:b,resolve:{route:function(){return a.routes[b]}}},e=d.open(c);e.result.then(function(){console.log("getting updated version of the modal"),h.find(a.stopDetail.id,!0).then(function(b){a.stopDetail=b},function(){console.log("error updating stop")})},function(){console.log("EditRouteModal dismissed")})},a.saveNewStop=function(){console.log("saveSaveNewStop"),console.log(j),c.post(_CONFIG.serverUrl+"/v1/stops/",{stop:j}).success(function(b){console.log("stop saved successfully"),console.log(b.data),a.stops[b.data.id]=b.data,a.stopDetail=b.data,k._stopId=b.data.id,k.closePopup(),k.setIcon(iconset["default"]),k.bindPopup(b.data.name),k.on("popupopen",l),k.on("popupclose",m),markers[b.data.id]=k,k.openPopup(),j={},k=null,f.create("Excelente, ¡parada añadida!"),console.log("Se ha añadido la parada con éxito")}).error(function(a){console.log(a)})},a.cancelSaveNewStop=function(){console.log("cancelSaveStop")},a.openNewStopModal=function(){var c={templateUrl:"views/modals/new-stop.html",controller:"NewStopModalInstanceCtrl",backdrop:"static",resolve:{}},e=d.open(c);e.result.then(function(c){j=c;var d=a.map.getCenter();j.lat=d.lat,j.lon=d.lng,k=L.marker(d,{icon:iconset.redSpin,draggable:!0,bounceOnAdd:!0,bounceOnAddOptions:{duration:500,height:100},bounceOnAddCallback:function(){console.log("bouncing done")}}).addTo(a.map);var e="<div><h4>"+j.name+'</h4><p><strong>Arrástrame</strong> hasta mi localización.<br>Después dale a: </p><button ng-click="saveNewStop()"class="btn btn-primary">Guardar</button> o <a ng-click="cancelSaveNewStop()">cancelar</a></div>',f=b(angular.element(e)),g=a.$new(),h=f(g);console.log(h),k.bindPopup(h[0]).openPopup(),k.on("dragend",function(b){console.log("dragend called!!");var c=b.target;c.openPopup();var d=c.getLatLng();j.lat=d.lat,j.lon=d.lng,console.log(a.newStop)})},function(){})}}}]),angular.module("panatransWebApp").controller("AboutCtrl",["$scope",function(a){a.title="Acerca de",window.scrollTo(0,0)}]),angular.module("panatransWebApp").controller("LicensesCtrl",["$scope",function(a){a.title="Licenses",window.scrollTo(0,0)}]),angular.module("panatransWebApp").controller("StopsCtrl",["$scope","$http","$modal","ngToast","Stop",function(a,b,c,d,e){a.stops={},a.loading=!0,e.all().then(function(b){a.loading=!1,a.stops=b},function(b){a.loading=!1,console.log(b),d.create({className:"danger",contents:"Error accediendo al servidor. Prueba en un rato. Si el problema persiste contacta por twitter a @panatrans"})}),a.ignoreAccentsComparator=function(a,b){var c=function(a){return a.replace(/á/g,"a").replace(/é/g,"e").replace(/í/g,"i").replace(/ó/g,"o").replace(/ú/g,"u").replace(/\-/g,"").replace(/\s/g,"")};return"string"!=typeof a?!1:b?(a=c(a.toLowerCase()),b=c(b.toLowerCase()),a.indexOf(b)>-1):!0},a.openEditStopModal=function(b){d.create("Obteniendo detalles de la parada..."),e.find(b.id).then(function(d){a.stops[b.id]=d;var e={templateUrl:"views/modals/edit-stop.html",size:"lg",controller:"EditStopModalInstanceCtrl",backdrop:!0,resolve:{stop:function(){return a.stops[b.id]}}},f=c.open(e);f.result.then(function(){},function(a){console.log("modal instance dismissed reason : "+a),"stopDeleted"===a&&console.log("stopDeleted: "+b.id)})},function(){console.log("error getting stop details"),d.create({className:"danger",content:"No se pudieron obtener los detalles de la parada. Si el problema persiste contacte por twitter con @panatrans"})})}}]),angular.module("panatransWebApp").controller("RoutesCtrl",["$scope","$http","$modal","ngToast","Route",function(a,b,c,d,e){a.routes={},a.loading=!0,e.all().then(function(b){a.loading=!1,a.routes=b},function(b){a.loading=!1,console.log(b),d.create({className:"danger",contents:"Error accediendo al servidor. Prueba en un rato. Si el problema persiste contacta por twitter a @panatrans"})}),a.ignoreAccentsComparator=function(a,b){var c=function(a){return a.replace(/á/g,"a").replace(/é/g,"e").replace(/í/g,"i").replace(/ó/g,"o").replace(/ú/g,"u").replace(/\-/g,"").replace(/\s/g,"")};return"string"!=typeof a?!1:b?(a=c(a.toLowerCase()),b=c(b.toLowerCase()),a.indexOf(b)>-1):!0},a.openEditRouteModal=function(b){var d={templateUrl:"views/modals/edit-route.html",size:"lg",controller:"EditRouteModalInstanceCtrl",backdrop:!0,resolve:{route:function(){return null===b?b:a.routes[b.id]||null}}},e=c.open(d);e.result.then(function(){},function(a){console.log("modal instance dismissed reason : "+a),"routeDeleted"===a&&console.log("routeDeleted: "+routeId)})}}]),angular.module("panatransWebApp").controller("RoutesShowCtrl",["$scope","$http","$modal","ngToast","$routeParams",function(a,b,c,d,e){a.route={},console.log(e),a.loading=!0;var f={},g=null,h={};if(!a.map){a.map=L.map("route-map",{center:[8.9740946,-79.5508536],zoom:16,zoomControl:!1}),L.tileLayer(_CONFIG.tilelayerUrl,{attribution:_CONFIG.tilelayerAttribution,maxZoom:18}).addTo(a.map);var i={"default":L.AwesomeMarkers.icon({icon:"bus",prefix:"fa",markerColor:"blue"}),red:L.AwesomeMarkers.icon({icon:"bus",prefix:"fa",markerColor:"red"})},j=function(b){var c=L.marker([b.lat,b.lon],{icon:i["default"],draggable:!1,title:b.name});c.bindPopup(b.name),c.on("popupopen",k),c.on("popupclose",l),c._stopId=b.id,f[b.id]=c,null===g&&(g=L.featureGroup(),g.addTo(a.map)),g.addLayer(c)},k=function(a){var b=a.popup._source._stopId;return null===b?void console.log("stopMarkerClicked: Hey! Hey! stopId es null :-?"):void f[b].setIcon(i.red)},l=function(a){var b=a.popup._source._stopId;return null===b?void console.log("stopMarkerPopupClose: Hey! Hey! stopId es null :-?"):void f[b].setIcon(i["default"])};a.highlightStop=function(b){f[b.id].openPopup(),a.map.panTo(f[b.id].getLatLng())},a.lowlightStop=function(a){console.log("loglight stop"+a.name),f[a.id].closePopup()};var m={};a.togglePdfLayer=function(c){console.log("togglePDFLayer");var e="https://dl.dropboxusercontent.com/u/22698/metrobus/";b.get(e+c.id+"/kml/tilemapresource.xml").success(function(b){console.log(b);var f=b.match(/(minx|miny|maxx|maxy)=\"([\-\.\d]+)\"/g);if(console.log(f),angular.forEach(f,function(a,b){f[b]=a.match(/([\-\.\d]+)/g)[0]}),a.map.fitBounds([[f[1],f[0]],[f[3],f[2]]]),console.log(f),console.log("cool! The pdf is geolocated route_id:"+c.id),void 0===m[c.id]){var g={minZoom:11,maxZoom:18,maxNativeZoom:14,opacity:.8,tms:!0},h=e+c.id+"/kml/{z}/{x}/{y}.png";console.log("tilesUrl: "+h),m[c.id]=L.tileLayer(h,g),m[c.id].addTo(a.map),d.create("En unos segundos se mostrará el PDF de la ruta en el mapa...")}else a.map.removeLayer(m[c.id]),delete m[c.id],d.create({className:"info",content:"Se ha dejado de mostrar el PDF en el mapa"})}).error(function(a,b){console.log("Geolocated pdf does not exists"),console.log(a),console.log(b),d.create({className:"danger",content:"No hay asociado con esta ruta un PDF Geolocalizado"})})};var n=function(){a.loading=!0,angular.forEach(f,function(b){a.map.removeLayer(b),delete f[b.id]}),b.get(_CONFIG.serverUrl+"/v1/routes/"+e.routeId+"?"+_CONFIG.delay).success(function(b){a.route=b.data,a.loading=!1,console.log(a.route),angular.forEach(a.route.trips,function(a){angular.forEach(a.stop_sequences,function(a){var b=a.stop;void 0===h[b.id]&&(j(b),h[b.id]=b)})}),g&&a.map.fitBounds(g.getBounds(),{padding:[15,15]})}).error(function(a){console.log("WTF! Something wrong with the route!"),console.log(a)})};n(),a.openEditRouteModal=function(b){var d={templateUrl:"views/modals/edit-route.html",size:"lg",controller:"EditRouteModalInstanceCtrl",backdrop:!0,routeId:b,resolve:{route:function(){return a.route},stopsArr:function(){return null}}},e=c.open(d);e.result.then(function(){console.log("modal instance closed"),n()},function(){})}}}]),angular.module("panatransWebApp").controller("ContributeCtrl",["$scope",function(a){a.title="Colabora",window.scrollTo(0,0)}]),angular.module("panatransWebApp").controller("EditRouteModalInstanceCtrl",["$scope","$http","ngToast","$modalInstance","route",function(a,b,c,d,e){a.sortedStopSequences={},a.unknownStopSequences={},a.isNewRoute=!1,a.loading=!0,a.route=e;var f=angular.copy(e);a.showNewStopSequence={},a.newStopSequence={},a.dragControlListeners={};var g=function(){b.get(_CONFIG.serverUrl+"/v1/routes/"+a.route.id+"?"+_CONFIG.delay).success(function(b){a.route=b.data,f=angular.copy(b.data),a.loading=!1,$.each(a.route.trips,function(b,c){a.sortedStopSequences[c.id]=[],a.unknownStopSequences[c.id]=[],$.each(c.stop_sequences,function(b,d){null!==d.sequence?a.sortedStopSequences[c.id].push(d):a.unknownStopSequences[c.id].push(d)})})}).error(function(a){console.log("WTF! Something wrong with the route!"),console.log(a)})};b.get(_CONFIG.serverUrl+"/v1/stops/?"+_CONFIG.delay).success(function(b){a.stopsArr=b.data}),console.log(e),null===e&&(e={trips:[]},a.route=e,a.isNewRoute=!0,a.loading=!1),$.each(e.trips,function(c,d){a.newStopSequence[d.id]={stop:null,trip:d,sequence:null},a.dragControlListeners[d.id]={},$.each(["sorted","unknown"],function(c,e){console.log(e+" -------"+d.id),a.dragControlListeners[d.id][e]={accept:function(){return!0},itemMoved:function(a){console.log("source sort"+e),console.log("source trip.id"+d.id),console.log("itemMoved"),console.log(a),console.log("nueva posición: "+a.dest.index),console.log("dest trip:"+a.dest.sortableScope.$parent.trip.id),console.log("src seq:"+a.source.itemScope.modelValue.sequence),console.log("dest sortStatus"+a.dest.sortableScope.options.containment.indexOf("unknown"));var c,f=a.dest.sortableScope.$parent.trip,h=a.source.itemScope.modelValue;f.id===d.id?null===h.sequence?(h.sequence=a.dest.index,c={stop_sequence:{sequence:a.dest.index}}):(h.sequence=null,c={stop_sequence:{unknown_sequence:!0}}):0===a.dest.sortableScope.options.containment.indexOf("unknown")?(h.sequence=null,c={stop_sequence:{unknown_sequence:!0,trip_id:f.id}}):(h.trip=f,h.sequence=a.dest.index,c={stop_sequence:{sequence:a.dest.index,trip_id:f.id}}),console.log("putData"),console.log(h),b.put(_CONFIG.serverUrl+"/v1/stop_sequences/"+h.id,c).success(function(){g()})},orderChanged:function(a){if(console.log("orderChanged "),console.log("nueva posición: "+a.dest.index),console.log(a),0!==a.dest.sortableScope.options.containment.indexOf("unknown")){var c=a.dest.index,d=a.source.itemScope.modelValue;console.log("nueva posición: "+a.dest.index);var e={stop_sequence:{sequence:c}};b.put(_CONFIG.serverUrl+"/v1/stop_sequences/"+d.id,e).success(function(){console.log("updated stop sequence!"),g()})}},containment:e+"_"+d.id}})}),console.log(a.dragControlListeners),e.trips.length>0&&e.trips[0].stops?a.loading=!1:a.isNewRoute||g(),a.addNewRoute=function(){console.log("add new Route"),b.post(_CONFIG.serverUrl+"/v1/routes/",{route:{name:a.route.name}}).success(function(b){c.create("Ruta creada. Ahora sigue completando la información"),console.log("route successfully created"),a.route=b.data,a.serverRoute=angular.copy(e),a.isNewRoute=!1}).error(function(a,b){var d=a.errors.name.join(", ")||"";c.create({className:"danger",content:"Error: "+d}),console.log(a),console.log(b),console.log("Error creating route")})},a.deleteRoute=function(){console.log("delete route"),b["delete"](_CONFIG.serverUrl+"/v1/routes/"+a.route.id).success(function(){c.create("Ruta eliminada"),d.dismiss("routeDeleted")}).error(function(a,b){var d=a.errors.name.join(", ")||"";c.create({className:"danger",content:"Error: "+d}),console.log(a),console.log(b),console.log("Error deleting route")})},a.updateRouteName=function(){a.isNewRoute||(console.log("updateRouteName"),a.route.name!==f.name&&b.put(_CONFIG.serverUrl+"/v1/routes/"+a.route.id,{route:{name:a.route.name}}).success(function(){c.create("Se ha actualizado el nombre de la ruta"),console.log("route name successfully updated")}).error(function(a,b){var d=a.errors.name.join(", ")||"";c.create({className:"danger",contents:"Error: "+d}),console.log(a),console.log(b),console.log("Error updating route name")}))},a.updateRouteUrl=function(){console.log("updateRouteUrl"),a.route.url!==f.url&&b.put(_CONFIG.serverUrl+"/v1/routes/"+a.route.id,{route:{url:a.route.url}}).success(function(){c.create("Se ha actualizado la dirección web"),console.log("route name successfully updated")}).error(function(){c.create({className:"danger",contents:"Error: "+errors}),console.log(data),console.log(status),console.log("error updating route")})},a.deleteStopSequence=function(a){b["delete"](_CONFIG.serverUrl+"/v1/stop_sequences/"+a.id).success(function(){c.create("Se eliminado la parada del trayecto"),console.log("removed stop sequence success!"),g()})};var h=function(a,b){var c=/transfer|tranfer|corredor|circular/i,d=b.split("-"),e=!1,f=!1;switch(angular.forEach(d,function(a,b){var g=d[b].trim();g.match(c)||(e?f=g:e=g)}),a){case"one":return[e];case"circular":return["circular"];case"two":return[e,f];default:return void 0}};a.routeHasTrips=function(){return void 0!==a.route.trips&&0!==a.route.trips.length},a.addTripsToRoute=function(){console.log("addTripsToRoute. tripsType:"+a.route.tripsType),console.log(h(a.route.tripsType,a.route.name));var d=h(a.route.tripsType,a.route.name);if(void 0===d)return void c({className:"danger",contents:"Error. Revisa que el nombre de la ruta tenga el formato adecuado."});var e=0;angular.forEach(d,function(f,h){console.log(f),console.log(h);var i={headsign:f,direction:h,route_id:a.route.id};b.post(_CONFIG.serverUrl+"/v1/trips/",{trip:i}).success(function(a){console.log("added trips to route"),c.create("Se ha añadido el trayecto "+a.data.headsign),++e===d.length&&g()}).error(function(a,b){console.log("error updating trip"),console.log(a.errors),console.log(b),422!=b&&c("Humm! Error raro. Si el error persiste, probablemente tengas que contactar con los administradores");var e="";c.create("Hubo problema a al añadir el trayecto: "+e),++response===d.length&&g()})})},a.deleteTrips=function(){console.log("deleteTrips. number to delete = "+a.route.trips.length);var d=0;angular.forEach(a.route.trips,function(e){b["delete"](_CONFIG.serverUrl+"/v1/trips/"+e.id).success(function(){++d===a.route.trips.length&&g()}).error(function(b,d){console.log("error updating trip"),console.log(b.errors),console.log(d),422!=d&&c("Humm! Error raro. Si el error persiste, probablemente tengas que contactar con los administradores");var e="";c.create("Hubo problema al borrar los trayectos: "+e),++response===a.route.trips.length&&g()})})},a.tripsHaveStops=function(){var b=!1;return angular.forEach(a.route.trips,function(a){void 0!==a.stop_sequences&&a.stop_sequences.length>0&&(b=!0)
}),b},a.addStopToTrip=function(d){var e=!1;console.log("stopSequence:"+a.newStopSequence[d].sequence),-1===a.newStopSequence[d].sequence&&(e=!0);var f={stop_sequence:{sequence:a.newStopSequence[d].sequence,unknown_sequence:e,stop_id:a.newStopSequence[d].stop.id,trip_id:d}};console.log("addStopToTrip postData:"),console.log(f),b.post(_CONFIG.serverUrl+"/v1/stop_sequences/",f).success(function(){g(),c.create("Se ha añadido la parada al trayecto."),a.showNewStopSequence[d]=!0,a.newStopSequence[d].stop=null})},a.close=function(){d.close()}}]),angular.module("panatransWebApp").controller("EditStopModalInstanceCtrl",["$scope","$http","$modalInstance","ngToast","stop",function(a,b,c,d,e){a.stop=e,a.tripNotAlready=function(b){var c=!0;return $.each(a.stop.routes,function(a,d){$.each(d.trips,function(a,d){d.id===b.id&&(c=!1)})}),c},a.searchFilter=function(b){var c=new RegExp(a.searchText,"i");return!a.searchText||c.test(b.name)},a.addTrip=function(c){console.log("addTrip: "+c),b.post(_CONFIG.serverUrl+"/v1/stop_sequences/",{stop_sequence:{unknown_sequence:!0,stop_id:a.stop.id,trip_id:c}}).success(function(b){console.log("added trip to stop"),console.log(b);var c=b.data.trip,d=!1;if($.each(a.stop.routes,function(b,e){e.id===c.route.id&&(d=!0,a.stop.routes[b].trips.push(c))}),!d){var e=c.route;e.trips=[c],a.stop.routes.push(e)}}).error(function(a){console.log("error adding trip to stop"),console.log(a)})},a.updateStopName=function(){console.log("updateStop"),console.log(a.stop)},a.deleteStop=function(){return a.stop.routes.length>0?(console.log("ERROR: the stop has trips cannot be deleted"),void alert("No se puede borrar. Tienes que quitar todas las rutas que pasan por la parada antes de eliminarla.")):void b["delete"](_CONFIG.serverUrl+"/v1/stops/"+a.stop.id).success(function(){d.create("Parada eliminada."),console.log("parada borrada del servidor con éxito"),c.dismiss("stopDeleted")}).error(function(a){console.log("Error borrando la parada"),console.log(a)})},a.changeStopLocation=function(){console.log("changeStopLocation Requested"),c.dismiss("changeStopLocation")},a.deleteTrip=function(c){b["delete"](_CONFIG.serverUrl+"/v1/stop_sequences/trip/"+c+"/stop/"+a.stop.id).success(function(b){console.log(b),console.log("awesome! Trip and stop unlinked"),$.each(a.stop.routes,function(b,d){$.each(d.trips,function(d,e){e.id===c&&(a.stop.routes[b].trips.splice(d,1),0===a.stop.routes[b].trips.length&&a.stop.routes.splice(b,1))})}),d.create("Se ha eliminado la parada del trayecto.")}).error(function(a){console.log("error removing trip from stop"),console.log(a)})},a.close=function(){c.close()}}]),angular.module("panatransWebApp").controller("NewRouteModalInstanceCtrl",["$scope","$modalInstance",function(a,b){a.ok=function(){b.close(a.selected.item)},a.cancel=function(){b.dismiss("cancel")}}]),angular.module("panatransWebApp").controller("NewStopModalInstanceCtrl",["$scope","$modalInstance",function(a,b){a.stop={},a.ok=function(){b.close(a.stop)},a.cancel=function(){b.dismiss("cancel")}}]);