var container, controls;
var camera, scene, renderer, boundingbox;

var selectedObjects = [];
var composer, effectFXAA, outlinePass;
var params = {
    edgeStrength: 3.0,
    edgeGlow: 0.0,
    edgeThickness: 1.0,
    pulsePeriod: 1,
    rotate: false,
    usePatternTexture: false
};

init();
animate();
function init() {


    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();


    var obj3d = new THREE.Object3D();
    var group = new THREE.Group();

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 44602.133,  2961853.250);
    camera.position.set(93966.352, -93731.602, 148673.781);
    camera.up = new THREE.Vector3(0, 0, 1);
    var target = new THREE.Vector3(0.000, 0.000, 0.000);
    camera.lookAt(target);



    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;


    scene = new THREE.Scene();
    scene.add( new THREE.HemisphereLight());
    var directionalLight = new THREE.DirectionalLight( 0xffeedd );
    directionalLight.position.set( 0, 0, 2 );
    scene.add( directionalLight );

    var geometry = new THREE.PlaneBufferGeometry( 150000, 150000, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x515151, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );

    plane.position.z = -76000;

    scene.add( plane );




    var loader = new THREE.TDSLoader();
    loader.setResourcePath( 'texture/' );
    loader.load( 'model/try.3DS', function ( object ) {

        obj3d.add( object );

    });


    scene.add( group );
    group.add( obj3d );


    composer = new THREE.EffectComposer( renderer );
    var renderPass = new THREE.RenderPass( scene, camera );
    composer.addPass( renderPass );
    outlinePass = new THREE.OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
    outlinePass.pulsePeriod = 1;

    composer.addPass( outlinePass );


    var onLoad = function ( texture ) {
        outlinePass.patternTexture = texture;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
    };
    var loader1 = new THREE.TextureLoader();
    loader1.load( 'texture/tri_pattern.jpg', onLoad );


    effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
    effectFXAA.renderToScreen = true;
    composer.addPass( effectFXAA );

    window.addEventListener( 'resize', resize, false );

    window.addEventListener( 'mousemove', onTouchMove );
    window.addEventListener( 'touchmove', onTouchMove );



    function onTouchMove( event ) {



        var x, y;
        if ( event.changedTouches ) {
            x = event.changedTouches[ 0 ].pageX;
            y = event.changedTouches[ 0 ].pageY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }
        mouse.x = ( x / window.innerWidth ) * 2 - 1;
        mouse.y = - ( y / window.innerHeight ) * 2 + 1;
        checkIntersection();
    }
    function addSelectedObject( object ) {
        selectedObjects = [];
        selectedObjects.push( object );
    }
    function checkIntersection() {
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( [ scene ], true );
        if ( intersects.length > 0 ) {
            var selectedObject = intersects[ 0 ].object;
            addSelectedObject( selectedObject );
            outlinePass.selectedObjects = selectedObjects;
        } else {
            outlinePass.selectedObjects = [];
        }
    }


}




function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );

}


function animate() {




    controls.update();
    composer.render();
    renderer.render( scene, camera );
    requestAnimationFrame( animate );


    var timer = performance.now();
    if ( params.rotate ) {
        group.rotation.y = timer * 0.0001;
    }
}

