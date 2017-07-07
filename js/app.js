var map;
var gmarkers = [];
var myVM;


function initMap() {
 // Create a styles array to use with the map.
    var styles = [
          {
            featureType: 'water',
            stylers: [
              { color: '#19a0d7' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e8' },
              { lightness: -20 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -100 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -25 }
            ]
          }
    ];
//intitialize the map settings
    var myLatLng = {lat: 40.7413549, lng: -73.9980244};
    map = new google.maps.Map(document.getElementById('map'), {
              zoom: 15,
              center: myLatLng,
              mapTypeControl: false,
              styles:styles
            });
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center); 
    });

    myVM = new ViewModel();
    ko.applyBindings(myVM, document.getElementById("locations"));
  }
var Locations = [
    {
        name: 'Park Ave Penthouse',
        lat:  40.7713024,
        lng: -73.9632393,
        index: 0,
    },
    {
        name: 'Chelsea Loft',
        lat:  40.7444883,
        lng: -73.9949465,
        index: 1,
    },
    {
        name: 'Union Square Open Floor Plan',
        lat:   40.7347062,
        lng: -73.9895759,
        index: 2,
    },
    {
        name: 'East Village Hip Studio',
        lat:  40.7281777,
        lng: -73.984377,
        index: 3,
    },
    {
        name: 'TriBeCa Artsy Bachelor Pad',
        lat:  40.7195264,
        lng: -74.0089934,
        index: 4,
    },
    {
        name: 'Chinatown Homey Space',
        lat:  40.7180628,
        lng: -73.9961237,
        index: 5,
    },
];
var Location = function(map, data){
  var marker;
  
  this.name = ko.observable(data.name);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.address = ko.observable(data.address);
  this.index = ko.observable(data.index);
  
  marker = new google.maps.Marker({
    position: new google.maps.LatLng(data.lat, data.lng),
    animation: google.maps.Animation.DROP,
    icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
    name: name
  });

          
  var infowindow = new google.maps.InfoWindow();

  google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, this);
        clicked_item = myVM.locationList()[data.index];
        locationClick(marker,clicked_item);
    
    });

    google.maps.event.addListener(marker, 'mouseover', function() {
      infowindow.open(map, this);
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
      infowindow.close();
    });

  this.isVisible = ko.observable(false);

  this.isVisible.subscribe(function(currentState){
    if (currentState) {
      marker.setMap(map);
    } else {
      marker.setMap(null);
    }
  });

  this.isVisible(true);
 // Push the marker to our array of markers.
  gmarkers.push(marker);
// Create an onclick event to open the large infowindow at each marker.
  marker.addListener('click', function() {
            populateInfoWindow(this, infowindow);
          });
};


var ViewModel = function(){

    var self = this;
    this.markerList = ko.observableArray([]);
    this.query = ko.observable('');
    this.currentLoc = ko.observable('');
    this.error = ko.observable('');


    this.locationList = ko.observableArray([]);
    Locations.forEach(function(locItem){
      self.locationList.push(new Location(map, locItem));
    });

    this.selectedItem = ko.observable('');

    // location filter is used for the search field
    self.filteredLocations = ko.computed(function () {
        var filter = self.query().toLowerCase();
        var match;

        if (!filter) {
          match = self.locationList();
          match.forEach(function(item){
          item.isVisible(true);
        });
            return match;
        } else {
            var isSelected;
            return ko.utils.arrayFilter(self.locationList(), function (item) {
                match = item.name().toLowerCase().indexOf(filter) !== -1;
                item.isVisible(match);
                self.selectedItem('');
                self.currentLoc('');
                toggleMarkers(null);
                return match;
            });
        }
    });

    this.hilightItem = function(item){
        self.selectedItem(item.name());
    };

    this.changeCurrentLoc = function(item){
        self.currentLoc(item);
    };

    this.onClick = function(item){
        locationClick(gmarkers[item.index()], item);
    };

};
//This function set icons to two event listeners - one for mouseover, 
//one for mouseout,to change the colors back and forth.
function toggleMarkers(marker){
    for (i=0; i < gmarkers.length; i++){
            gmarkers[i].setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
        }
    if (marker){
        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    }    
    
    }

function locationClick(marker, clicked_item){
    toggleMarkers(marker);
    myVM.hilightItem(clicked_item);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
     // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options
    function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.name + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
        } else {
              infowindow.setContent('<div>' + marker.name + '</div>' +
                '<div>No Street View Found</div>');
            }
    }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
    }
}
    