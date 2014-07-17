var THREEx	= THREEx || {};

THREEx.CubeCamera	= function(object3d, textureW){
	// handle parameter default
	textureW	= textureW || 1024;

	// create the camera
	var camera	= new THREE.CubeCamera( 0.001, 1000, textureW );
	camera.position	= object3d.position
	this.object3d	= camera
	this.textureCube= camera.renderTarget

	// to avoid flickering on the border of the sphere
	camera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
	// object3d.add(camera)
	
	// update function
	this.update	= function(renderer, scene){
		// TODO what if object3d contains children
		// console.assert(object3d.children.length === 0)
		object3d.visible	= false;	// *cough*

		// var position	= object3d.position.clone()

		// // TODO compute position as world position
		// camera.position.copy(position)
		camera.updateCubeMap(renderer, scene)

		object3d.visible	= true;		// *cough*			
	}
}
