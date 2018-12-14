var container, controls;


var camera, scene, renderer, boundingbox, arrAllChildren, arrAllChildrenName, ControllerChangeList, domEvents, mainObj;



init();
animate();


function init() {
    arrAllChildrenName = [];



    var FizzyText = function() {
        this["Выберите датчик"] = '';

    };

    var text = new FizzyText();
    var gui = new dat.GUI();


    scene = new THREE.Scene();

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 100, 1961853.250);
    camera.position.set(93966.352, -93731.602, 148673.781);


    camera.up = new THREE.Vector3(0, 0, 1);
    var target = new THREE.Vector3(0.000, 0.000, 0.000);
    camera.lookAt(target);



    controls = new THREE.TrackballControls(camera, renderer.domElement);

    controls.rotateSpeed = 3.6;
    controls.zoomSpeed = 0.8;
    controls.panSpeed = 1;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.12;



    scene.add( new THREE.HemisphereLight());
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.1 );
    directionalLight.position.set( 10, 20, 15 );
    scene.add( directionalLight );

    domEvents = new THREEx.DomEvents(camera, renderer.domElement);

    materials = {};
    new_material = new THREE.MeshLambertMaterial();


    var loader = new THREE.TDSLoader();
    loader.setResourcePath( 'texture/' );
    loader.load( 'model/try.3DS', function ( object ) {
        arrAllChildren = object.children;

        mainObj = object;
        for (const childrenItem of arrAllChildren) {


            if (childrenItem.material.type == "MeshFaceMaterial"){

                childrenItem.material = childrenItem.material.materials[1]

            }

            materials[childrenItem.uuid] = childrenItem.material;


            domEvents.addEventListener(childrenItem, 'mouseover', function(event){
                new_material.color = new THREE.Color( "skyblue" );
                childrenItem.material = new_material;
               return renderer.render(scene, camera)
            }, false)


            domEvents.addEventListener(childrenItem, 'mouseout', function(event){
                childrenItem.material = materials[childrenItem.uuid]
               return renderer.render(scene, camera)
            }, false)


            domEvents.addEventListener(childrenItem, 'dblclick', function(event){

                fitCameraToObject(camera, childrenItem, undefined, controls);

            }, false)


        }



        for (const arrAllChildrenItem of arrAllChildren) {
            arrAllChildrenName.push("Объект целиком");
            arrAllChildrenName.push(arrAllChildrenItem.name);
        }


        ControllerChangeList = gui.add(text, 'Выберите датчик', arrAllChildrenName );

        ControllerChangeList.onChange(function (val) {

         if (val === "Объект целиком"){




             controls.target = new THREE.Vector3();

             controls.update();



         }
            for (const arrAllChildrenItem of arrAllChildren) {


                if (arrAllChildrenItem.name === val) {



                    fitCameraToObject(camera, arrAllChildrenItem, undefined, controls);


                }
            }


        });


        scene.add( object );


    });




    window.addEventListener( 'resize', resize, false );




}

const fitCameraToObject = function ( camera, object, offset, controls ) {

    offset = offset || 1.25;



    const boundingBox = new THREE.Box3();

    // get bounding box of object - this will be used to setup controls and camera
    boundingBox.setFromObject( object );

    const center = boundingBox.getCenter();

    const size = boundingBox.getSize();








    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max( size.x, size.y, size.z );
    const fov = camera.fov * ( Math.PI / 180 );
    let cameraZ = Math.abs( maxDim / 4 * Math.tan( fov * 2 ) );

    cameraZ *= offset; // zoom out a little so that objects don't fill the screen

    camera.position.z = cameraZ;

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;











    camera.updateProjectionMatrix();







    if ( controls ) {

        // set camera to rotate around center of loaded object
        controls.target = center;

        // prevent camera from zooming out far enough to create far plane cutoff
        //controls.maxDistance = cameraToFarEdge * 2;

        controls.maxDistance = 11000;



        setTimeout(function () {
            controls.maxDistance = cameraToFarEdge * 2;
            controls.update();
        }, 1000);

        let indexCubeSelect = arrAllChildren.findIndex(item => item.name === "cubeSelect");


        if (indexCubeSelect !== -1) {
            arrAllChildren.pop();

        }




        let objCopy = object.clone();
        new_material.color = new THREE.Color( "skyblue" );

        objCopy.material = new_material;
        objCopy.position.x += 50;
        objCopy.position.y += 50;
        objCopy.position.z += 50;

        objCopy.name = "cubeSelect";
        objCopy.parent = object.parent;

        arrAllChildren.push( objCopy );



        controls.update();

    } else {

        camera.lookAt( center )

    }

};



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

