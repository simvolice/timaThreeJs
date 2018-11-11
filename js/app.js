var container, controls;
var camera, scene, renderer, boundingbox, sceneRadiusForCamera;
init();
animate();
function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.z = 2;
    controls = new THREE.TrackballControls( camera );
    scene = new THREE.Scene();
    scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );



    var loader = new THREE.TDSLoader( );
    loader.setResourcePath( 'texture/' );
    loader.load( 'model/try.3Ds', function ( object ) {



        scene.add( object );



    } );
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', resize, false );
}
function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {


    controls.update();
    renderer.render( scene, camera );
    requestAnimationFrame( animate );
}