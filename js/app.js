var map;
var infoWindow;

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
    map = new google.maps.Map(
      document.getElementById('map'),
          {
            center: myLatLng,
            zoom: 14,
            mapTypeControl: false,
            styles:styles
          }
        );
      infowindow = new google.maps.InfoWindow();
      //To Activate Knockout through app.js
      ko.applyBindings(new viewModel());
}

function googleError(){
  document.getElementById('map-error').innerHTML = "Error in Map!";
  alert("Google Maps has failed to load. Please check your internet connection and try again.");
}

// Model
var model = [
  {
    name: 'Park Ave Penthouse',
    lat:  40.7713024,
    lng: -73.9632393,
    show: true,
    selected: false,
    venueid: "5257ea5111d20d6aea85a5b6"
  },
  {
    name: 'Chelsea Loft',
    lat:  40.7444883,
    lng: -73.9949465,
    show: true,
    selected: false,
    venueid: "52416c498bbd7a57df948f60"
  },
  {
    name: 'Union Square Open Floor Plan',
    lat:   40.7347062,
    lng: -73.9895759,
    show: true,
    selected: false,
    venueid: "4b67c5a6f964a5204f5d2be3"
  },
  {
    name: 'East Village Hip Studio',
    lat:  40.7281777,
    lng: -73.984377,
    show: true,
    selected: false,
    venueid: "4c8a297c1797236acbe85e88"
  },
  {
    name: 'TriBeCa Artsy Bachelor Pad',
    lat:  40.7195264,
    lng: -74.0089934,
    show: true,
    selected: false,
    venueid: "4c14d78ba9c220a15e1c589d"
  },
  {
    name: 'Chinatown Homey Space',
    lat:  40.7180628,
    lng: -73.9961237,
    show: true,
    selected: false,
    venueid: "4d3102ed2c76a143e5bb60c7"
  }
];

// View Model

var viewModel = function() {

  var self = this;

  self.errorDisplay = ko.observable('');

  // populate locationList with each Model
  self.locationList = [];
  model.forEach(function(marker){
    self.locationList.push(new google.maps.Marker({
      position: {lat: marker.lat, lng: marker.lng},
      map: map,
      name: marker.name,
      show: ko.observable(marker.show),  // sets observable for checking
      selected: ko.observable(marker.selected),
      venueid: marker.venueid,   // foursquare venue id
      animation: google.maps.Animation.DROP
    }));
  });

  //store locationList length
  self.locationListLength = self.locationList.length;

  //set current map item
  self.currentMapItem = self.locationList[0];

  // function to make marker bounce but stop after 800ms
  self.makeAnimation = function(marker){
    marker.setAnimation(google.maps.Animation.BOUNCE);
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
    setTimeout(function(){ marker.setAnimation(null);}, 600);
    setTimeout(function(){ marker.setIcon(null);}, 600);
  };


  // function to add API information to each marker
  self.addApiInfo = function(passedMarker){
      $.ajax({
        url: "https://api.foursquare.com/v2/venues/" + passedMarker.venueid + '?client_id=CGOJQ1C3N5GARA4Q53TWRBUWARWXRPEXEG1KM1CCVFDWO2VA&client_secret=OQXLE0UEJOKJLGOM0AT5NA5JE10AXSFNS3GT1PKJGCQ3JJM2&v=20160614',
        dataType: "json",
        success: function(data){
          // stores results to display likes and ratings
          var result = data.response.venue;

          // add likes and ratings to marker
          passedMarker.likes = result.hasOwnProperty('likes') ? result.likes.summary: "";
          passedMarker.rating = result.hasOwnProperty('rating') ? result.rating: "";
          //add the click event listener to mapMarker
          passedMarker.addListener('click', function(){
          //set this mapMarker to the "selected" state
          self.setSelected(passedMarker);
      });
        },
        //alert if there is error in recievng json
        error: function(e) {
          self.errorDisplay("Foursquare data is up-to-date. Please try again later.");
        }
      });
  };

  function foo(passedMarker){
      //add API items to each mapMarker
      self.addApiInfo(passedMarker);
      
    }
  // iterate through locationList and add marker event listener and API information
  for (var i=0; i < self.locationListLength; i++){
    (foo)(self.locationList[i]);
  }

  // create a filter observable for filter text
  self.filterContent = ko.observable('');


  // calls every keydown from input box
  self.applyFilter = function() {

    var currentFilter = self.filterContent();
    infowindow.close();

    //filter the list as user seach
    if (currentFilter.length === 0) {
      self.setAllShow(true);
    } else {
      for (var i = 0; i < self.locationListLength; i++) {
        if (self.locationList[i].name.toLowerCase().indexOf(currentFilter.toLowerCase()) > -1) {
          self.locationList[i].show(true);
          self.locationList[i].setVisible(true);
        } else {
          self.locationList[i].show(false);
          self.locationList[i].setVisible(false);
        }
      }
    }
    infowindow.close();
  };

  // to make all marker visible
  self.setAllShow = function(showVar) {
    for (var i = 0; i < self.locationListLength; i++) {
      self.locationList[i].show(showVar);
      self.locationList[i].setVisible(showVar);
    }
  };

  self.setAllUnselected = function() {
    for (var i = 0; i < self.locationListLength; i++) {
      self.locationList[i].selected(false);
    }
  };

  self.setSelected = function(location) {
    self.setAllUnselected();
        location.selected(true);

        self.currentMapItem = location;
        
        formattedRating = function() {
          if (self.currentMapItem.rating === "" || self.currentMapItem.rating === undefined) {
            return "No rating to display";
          } else {
            return "Here is rated " + self.currentMapItem.rating;
          }
        };
        
        formattedLikes = function() {
          if (self.currentMapItem.likes === "" || self.currentMapItem.likes === undefined) {
            return "No likes to display";
          } else {
            return "Here has " + self.currentMapItem.likes;
          }
        };

  

        var formattedInfoWindow = "<h5>" + self.currentMapItem.name + "</h5>" + "<div>" + formattedRating() + "</div>" + "<div>" + formattedLikes() + "</div>";

    infowindow.setContent(formattedInfoWindow);

        infowindow.open(map, location);
        self.makeAnimation(location);
  };
};
