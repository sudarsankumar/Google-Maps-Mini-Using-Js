mapboxgl.accessToken = 'pk.eyJ1Ijoic3VkYXJzYW5rdW1hcjEyMyIsImEiOiJja211bXB3cDkxMzVjMnBvNXFyYnAwYWh2In0.EwLp_r1oIvBsl7_NR_UfIw';
navigator.geolocation.getCurrentPosition(successLocation,errorLocation,{enableHighAccuracy: true})
function successLocation(position)
{
    console.log(position)
    setupMap([position.coords.longitude,position.coords.latitude])
}
function errorLocation()
{
    setupMap([-2.24,53.48])
}
function setupMap(center)
{
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: 15
    });
    var geojson = {
        type: 'FeatureCollection',
        features: 
        [
            {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [-77.032, 38.913]
                },
                properties: {
                    title: 'Capital',
                    description: 'Washington, D.C.'
                }
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Fav Place1',
                    coordinates: [-122.414, 37.776]
                },
                properties: {
                    title: 'Mapbox',
                    description: 'San Francisco, California'
                }
            }
        ]
    };
    geojson.features.forEach(function(marker) 
        {
            var el = document.createElement('div');
            el.className = 'marker';
            new mapboxgl.Marker(el)
            .setLngLat(marker.geometry.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML('<h3>' + marker.properties.title + '</h3><p>' + marker.properties.description + '</p>'))
            .addTo(map);
        }
    );
    const nav = new mapboxgl.NavigationControl();
    map.addControl(nav,'top-right')
    var directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken
    })
    map.addControl(directions,'top-left')
    
    map.on('load', function () {
        var geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          zoom: 13,
          placeholder: 'Enter an address or place name',
          bbox: [-105.116, 39.679, -104.898, 39.837]
        });

        map.addControl(geocoder, 'top-left');

        var marker = new mapboxgl.Marker({
          'color': '#008000'
        });

        geocoder.on('result', function (data) {
          var point = data.result.center;
          var tileset = 'sudarsankumar123.291uecfr';
          var radius = 1609;
          var limit = 50;
          var query =
            'https://api.mapbox.com/v4/' +
            tileset +
            '/tilequery/' +
            point[0] +
            ',' +
            point[1] +
            '.json?radius=' +
            radius +
            '&limit= ' +
            limit +
            ' &access_token=' +
            mapboxgl.accessToken;

          marker.setLngLat(point).addTo(map);

          $.ajax({
            method: 'GET',
            url: query
          }).done(function (data) {
            map.getSource('tilequery').setData(data);
          });
        });

        map.addSource('tilequery', {
          type: 'geojson',
          data: {
            'type': 'FeatureCollection',
            'features': []
          }
        });

        map.addLayer({
          id: 'tilequery-points',
          type: 'circle',
          source: 'tilequery',
          paint: {
            'circle-stroke-color': 'white',
            'circle-stroke-width': {
              stops: [
                [0, 0.1],
                [18, 3]
              ],
              base: 5
            },
            'circle-radius': {
              stops: [
                [12, 5],
                [22, 180]
              ],
              base: 5
            },
            'circle-color': [
              'match',
              ['get', 'STORE_TYPE'],
              'Convenience Store',
              '#FF8C00',
              'Convenience Store With Gas',
              '#FF8C00',
              'Pharmacy',
              '#FF8C00',
              'Specialty Food Store',
              '#9ACD32',
              'Small Grocery Store',
              '#008000',
              'Supercenter',
              '#008000',
              'Superette',
              '#008000',
              'Supermarket',
              '#008000',
              'Warehouse Club Store',
              '#008000',
              '#FF0000' // any other store type
            ]
          }
        });

        var popup = new mapboxgl.Popup();

        map.on('mouseenter', 'tilequery-points', function (e) {
          map.getCanvas().style.cursor = 'pointer';

          var title = '<h3>' + e.features[0].properties.STORE_NAME + '</h3>';
          var storeType =
            '<h4>' + e.features[0].properties.STORE_TYPE + '</h4>';
          var storeAddress =
            '<p>' + e.features[0].properties.ADDRESS_LINE1 + '</p>';
          var obj = JSON.parse(e.features[0].properties.tilequery);
          var distance =
            '<p>' +
            (obj.distance / 1609.344).toFixed(2) +
            ' mi. from location' +
            '</p>';

          var lon = e.features[0].properties.longitude;
          var lat = e.features[0].properties.latitude;
          var coordinates = new mapboxgl.LngLat(lon, lat);
          var content = title + storeType + storeAddress + distance;

          popup.setLngLat(coordinates).setHTML(content).addTo(map);
        });

        map.on('mouseleave', 'tilequery-points', function () {
          map.getCanvas().style.cursor = '';
          popup.remove();
        });
      });
}