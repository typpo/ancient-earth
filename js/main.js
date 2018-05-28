(function () {
  var webglEl = document.getElementById('webgl');

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage(webglEl);
    return;
  }

  // Constants
  var DEFAULT_YEAR = 600;

  // Earth params
  var radius = 1.0;
  var segments = 32;
  var rotation = 0;

  // Misc
  var width  = window.innerWidth;
  var height = window.innerHeight;

  var webParams = parseWebParams();
  console.info('webParams:', webParams);

  // UI elements
  var yearsago = document.getElementById('years-ago');

  var sphereGeometry = new THREE.SphereGeometry(radius, segments, segments);

  var rotation = false;
  var simulationClicked = false;
	webglEl.addEventListener( 'mousedown', function() {
    simulationClicked = true;
  }, false);

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.position.z = 4;

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  //scene.add(new THREE.AmbientLight(0x333333));
  scene.add(new THREE.AmbientLight(0x666666));

  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5,3,5);
  scene.add(light);

  var sphere;

  yearsago.value = webParams.startingYear === 0 ? '0' : webParams.startingYear + ' million';
  updateSelectWithValue(webParams.startingYear);
  // Create initial sphere.
  onYearsAgoChanged();

  var loadedCount = 0;

  var clouds = createClouds(radius, segments);
  clouds.rotation.y = rotation;
  scene.add(clouds)

  var stars = createStars(90, 64);
  scene.add(stars);

  var markers = createSurfaceMarkers(webParams.surfacePoints);
  markers.forEach(function(marker) {
    console.log('adding', marker);
    scene.add(marker)
  });

  var controls = new THREE.OrbitControls(camera, webglEl);
  controls.minDistance = 1;
  controls.maxDistance = 20;
  controls.noKeys = true;
  controls.rotateSpeed = 1.4;

  THREEx.WindowResize(renderer, camera);

  webglEl.appendChild(renderer.domElement);

  setupSelect();
  setupControls();

  render();

  setTimeout(function() {
    preloadTextures();
  }, 3000);

  function render() {
    controls.update();

    if (rotation) {
      if (simulationClicked) {
        sphere.rotation.y += 0.0005;
        clouds.rotation.y += 0.0005;
      } else {
        sphere.rotation.y += 0.001;
        clouds.rotation.y += 0.001;
      }
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  function preloadTextures() {
    for (key in EXPLAIN_MAP) {
      var i = new Image()
      i.src = imagePathForYearsAgo(key);
    }
  }

  function updateSelectWithValue(howmany) {
    document.getElementById('how-long-ago').innerHTML = yearsago.value;
    document.getElementById('explanation').innerHTML = EXPLAIN_MAP[parseInt(howmany, 10)];
  }

  function onYearsAgoChanged() {
    var howmany = parseInt(yearsago.value, 10);
    scene.remove(sphere);
    var img = imagePathForYearsAgo(howmany);
    sphere = createSphere(radius, segments, img);
    sphere.rotation.y = rotation;
    scene.add(sphere);

    updateSelectWithValue(howmany);
    window.location.replace('#' + howmany);
  }

  function setupSelect() {
    yearsago.onchange = onYearsAgoChanged;

    var t = -1;
    document.addEventListener('keydown', function(e) {
      var now = new Date().getTime();
      if (now - t > 150) {
        // Left and right keys are 37 and 39 respectively, they step through the
        // select.
        var select = document.getElementById('years-ago');
        if (e.keyCode == 37 || e.keyCode == 75) {
          select.selectedIndex = Math.max(select.selectedIndex - 1, 0);
          onYearsAgoChanged();
        } else if (e.keyCode == 39 || e.keyCode == 74) {
          select.selectedIndex =
            Math.min(select.selectedIndex + 1, select.length - 1);
          onYearsAgoChanged();
        }
        t = now;
      }
    }, false);

    var jumpToElt = document.getElementById('jump-to');
    jumpToElt.onchange = function(e) {
      yearsago.value = jumpToElt.value + ' million';
      onYearsAgoChanged();
    };
  }

  function imagePathForYearsAgo(years) {
    return 'images/scotese/' + years + '.jpg';
    /*
    return years == 0 ? 'images/scrape/000present.jpg' : 'images/scrape/'
        + ((years+'').length < 3 ? '0' + years : years) + 'Marect.jpg';
       */
  }

  function createSphere(radius, segments, img) {
    var map = THREE.ImageUtils.loadTexture(img, undefined, function() {
      if (++loadedCount >= 2) {
        document.getElementById('loading').style.display = 'none';
      }
    });
    map.minFilter = THREE.LinearFilter;
    var mesh = new THREE.Mesh(
      sphereGeometry,
      new THREE.MeshPhongMaterial({
        map:         map,
        "color": 0xbbbbbb, "specular": 0x111111, "shininess": 1,
        bumpMap:     map,
        bumpScale:   0.02,
        specularMap: map,
        //specular:    new THREE.Color('grey')
        /*
        bumpMap:     THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
        bumpScale:   0.005,
        specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
        specular:    new THREE.Color('grey')
        */
      })
    );
    return mesh;
  }

  function setupControls() {
    var removeCloudsElt = document.getElementById('remove-clouds');
    removeCloudsElt.onclick = function() {
      scene.remove(clouds);
      removeCloudsElt.style.display = 'none';
    };
    var stopRotationElt = document.getElementById('stop-rotation');
    stopRotationElt.onclick = function() {
      rotation = false;
      stopRotationElt.style.display = 'none';
    };
  }

  function createClouds(radius, segments) {
    var map = THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png', undefined, function() {
      if (++loadedCount >= 2) {
        document.getElementById('loading').style.display = 'none';
      }
    });
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius + 0.003, segments, segments),
      new THREE.MeshPhongMaterial({
        map:         map,
        transparent: true,
        opacity: 1.0,
      })
    );
  }

  function createStars(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshBasicMaterial({
        map:  THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'),
        side: THREE.BackSide
      })
    );
  }

  function createSurfaceMarkers(latlngs) {
    return latlngs.map(function(latlng) {
      var material = new THREE.MeshBasicMaterial({color: 0xff0000});
      var geom = new THREE.SphereGeometry(0.005, 32, 32);
      var marker = new THREE.Mesh(geom, material);
      // Offset longitude by an arbitrary amount as determined by the starting
      // longitude of the texture map.
      var pos = latLngToVector3(latlng[0], (latlng[1] + 110.0) % 180.0, radius, 0);
      marker.position.set(pos.x, pos.y, pos.z);
      return marker;
    });
  }

   // Convert the positions from a lat, lng to a position on a sphere.
  function latLngToVector3(lat, lng, radius, height) {
    var phi = (lat)*Math.PI/180;
    var theta = (lng+90)*Math.PI/180;

    var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
    var y = (radius+height) * Math.sin(phi);
    var z = (radius+height) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x,y,z);
  }

  function parseWebParams() {
    var ret = {
      startingYear: DEFAULT_YEAR,
      surfacePoints: [],
    };
    var hash = window.location.hash;
    if (hash) {
      var paramsIdx = hash.indexOf('?');
      if (paramsIdx > -1) {
        ret.startingYear = parseInt(hash.slice(1, paramsIdx), 10);
        ret.surfacePoints = JSON.parse(hash.slice(paramsIdx + 1));
      } else {
        ret.startingYear = parseInt(hash.slice(1), 10);
      }
    }
    return ret;
  }
}());
