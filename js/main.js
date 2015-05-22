(function () {
  var webglEl = document.getElementById('webgl');

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage(webglEl);
    return;
  }

  var width  = window.innerWidth,
    height = window.innerHeight;

  // Earth params
  var radius   = 0.5,
    segments = 32,
    rotation = 11;

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.position.z = 4;

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  //scene.add(new THREE.AmbientLight(0x333333));
  scene.add(new THREE.AmbientLight(0x666666));
  //scene.add(new THREE.AmbientLight(0xffffff));

  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5,3,5);
  scene.add(light);

  var sphere = createSphere(radius, segments, imagePathForYearsAgo(600));
  sphere.rotation.y = rotation;
  scene.add(sphere)

  var clouds = createClouds(radius, segments);
  clouds.rotation.y = rotation;
  scene.add(clouds)

  var stars = createStars(90, 64);
  scene.add(stars);

  var controls = new THREE.TrackballControls(camera, webglEl);

  webglEl.appendChild(renderer.domElement);

  setupSelect();

  render();

  preloadTextures();

  function render() {
    controls.update();
    //sphere.rotation.y += 0.0005;
    sphere.rotation.y += 0.001;
    //clouds.rotation.y += 0.0005;
    clouds.rotation.y += 0.001;
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  function preloadTextures() {
    for (key in EXPLAIN_MAP) {
      var i = new Image()
      i.src = imagePathForYearsAgo(key);
    }
  }

  function setupSelect() {
    var yearsago = document.getElementById('years-ago');
    var updateWithValue = function(howmany) {
      document.getElementById('how-long-ago').innerHTML = yearsago.value;
      document.getElementById('explanation').innerHTML = EXPLAIN_MAP[parseInt(howmany)];
    }
    var yearsAgoChanged = yearsago.onchange = function() {
      var howmany = parseInt(yearsago.value);
      scene.remove(sphere);
      var img = imagePathForYearsAgo(howmany);
      sphere = createSphere(radius, segments, img);
      scene.add(sphere);

      updateWithValue(howmany);
    }
    // This is the default.
    updateWithValue(600);

    // Keyboard listener
    document.addEventListener('keydown', function(e) {
      // 37 and 39 respectively
      var select = document.getElementById('years-ago');
      if (e.keyCode == 37) {
        select.selectedIndex = Math.max(select.selectedIndex - 1, 0);
        yearsAgoChanged();
      } else if (e.keyCode == 39) {
        select.selectedIndex =
          Math.min(select.selectedIndex + 1, select.length - 1);
        yearsAgoChanged();
      }
    }, false);
  }

  function imagePathForYearsAgo(years) {
    return years == 0 ? 'images/scrape/000present.jpg' : 'images/scrape/'
        + ((years+'').length < 3 ? '0' + years : years) + 'Marect.jpg';
  }

  function createSphere(radius, segments, img) {
    //var map = THREE.ImageUtils.loadTexture('images/early_jurassic.jpg');
    //var map = THREE.ImageUtils.loadTexture('images/late_cretaceous.jpg');
    var map = THREE.ImageUtils.loadTexture(img);
    var mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshPhongMaterial({
        //map:         THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
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

  function createClouds(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius + 0.003, segments, segments),
      new THREE.MeshPhongMaterial({
        map:         THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png'),
        transparent: true
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
}());
