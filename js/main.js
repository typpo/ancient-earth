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
	camera.position.z = 3;

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);

	//scene.add(new THREE.AmbientLight(0x333333));
	scene.add(new THREE.AmbientLight(0xffffff));

	var light = new THREE.DirectionalLight(0xffffff, 1);
	light.position.set(5,3,5);
	//scene.add(light);

  var sphere = createSphere(radius, segments);
	sphere.rotation.y = rotation;
	scene.add(sphere)

  /*
    var clouds = createClouds(radius, segments);
	clouds.rotation.y = rotation;
	scene.add(clouds)
 */

	var stars = createStars(90, 64);
	scene.add(stars);

	var controls = new THREE.TrackballControls(camera);

	webglEl.appendChild(renderer.domElement);

  startCountdown();

	render();

	function render() {
		controls.update();
		sphere.rotation.y += 0.0005;
		//clouds.rotation.y += 0.0005;
		requestAnimationFrame(render);
		renderer.render(scene, camera);
	}

  function startCountdown() {
    return;
    setInterval(function() {
      var time = countdown(new Date(2015, 7, 14, 11, 50) ).toString();
      document.getElementById('timer').innerHTML = time;
    }, 1000);
  }

	function createSphere(radius, segments) {
    //var map = THREE.ImageUtils.loadTexture('images/early_jurassic.jpg');
    //var map = THREE.ImageUtils.loadTexture('images/late_cretaceous.jpg');
    var map = THREE.ImageUtils.loadTexture('images/600Marect.jpg');
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
