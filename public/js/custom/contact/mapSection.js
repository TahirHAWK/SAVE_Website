
      // 53.5551760304198, 10.02054840553626
      function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 16,
          center: {lat: 53.5551760304198, lng: 10.02054840553626},
          });

        var image = '../public/images/maps-and-flags.png';
        var beachMarker = new google.maps.Marker({
          position: {lat: 53.5551760304198, lng: 10.02054840553626},
          map: map,
          icon: image
        });
      }