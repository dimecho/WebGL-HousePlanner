var THREEx	= THREEx	|| {}

//////////////////////////////////////////////////////////////////////////////////
//		Comment								//
//////////////////////////////////////////////////////////////////////////////////
THREEx.ColliderSystem	= function(){

	//////////////////////////////////////////////////////////////////////////////////
	//		Comment								//
	//////////////////////////////////////////////////////////////////////////////////
	this.colliders	= []
	var colliders	= this.colliders
	/**
	 * Add a 
	 * @param {[type]} collider [description]
	 */
	this.add	= function(collider){
		this.colliders.push(collider)
	}
	this.remove	= function(collider){
		var index	= this.colliders.indexOf(collider)
		if( index === -1 )	return
		this.colliders.splice(index,1)
	}

	//////////////////////////////////////////////////////////////////////////////////
	//		Comment								//
	//////////////////////////////////////////////////////////////////////////////////
	var states	= {}
	/**
	 * Compute the collision and immediatly notify the listener
	 */
	this.compute	= function(){
		for(var i = 0; i < colliders.length; i++){
			var collider1	= colliders[i]
			for(var j = i+1; j < colliders.length; j++){
				var collider2	= colliders[j]
				// stay if they do collide
				var doCollide	= collider1.collideWith(collider2)
				// get previous state
				var stateLabel	= collider1.id + '-' + collider2.id
				var stateExisted= states[stateLabel] ? true : false
				// process depending do Collide
				if( doCollide ){
					// notify proper events
					if( stateExisted === true ){
						dispatchEvent(collider1, collider2, 'collideStay')
					}else{
						dispatchEvent(collider1, collider2, 'collideEnter')
					}
					// update states
					states[stateLabel]	= true
				}else{
					// notify proper events
					if( stateExisted ){
						dispatchEvent(collider1, collider2, 'collideExit')
					}
					// update states
					delete states[stateLabel]
				}
			}
		}

		function dispatchEvent(collider1, collider2, eventName){
			// send event to collider1
			collider1.dispatchEvent(eventName, collider2.object3d, collider1.object3d, collider2, collider1)
			// send event to collider2
			collider2.dispatchEvent(eventName, collider1.object3d, collider2.object3d, collider1, collider2)
		}
	}

	/**
	 * reset the events states
	 */
	this.reset	= function(){
		states	= {}
	}
}


/**
 * microevents.js - https://github.com/jeromeetienne/microevent.js
*/
THREEx.ColliderSystem.MicroeventMixin	= function(destObj){
	destObj.addEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
		return fct;
	};
	destObj.removeEventListener	= function(event, fct){
		if(this._events === undefined) 	this._events	= {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	};
	destObj.dispatchEvent	= function(event /* , args... */){
		if(this._events === undefined) 	this._events	= {};
		if( this._events[event] === undefined )	return;
		var tmpArray	= this._events[event].slice(); 
		for(var i = 0; i < tmpArray.length; i++){
			var result	= tmpArray[i].apply(this, Array.prototype.slice.call(arguments, 1))
			if( result !== undefined )	return result;
		}
		return undefined;
	};
};

//////////////////////////////////////////////////////////////////////////////////
//		Comment								//
//////////////////////////////////////////////////////////////////////////////////

THREEx.Collider	= function(object3d){
	this.id		= THREEx.Collider.idCount++
	this.object3d	= object3d
}

THREEx.Collider.idCount	= 0;

THREEx.ColliderSystem.MicroeventMixin(THREEx.Collider.prototype)

//////////////////////////////////////////////////////////////////////////////////
//		Comment								//
//////////////////////////////////////////////////////////////////////////////////

THREEx.Collider.createFromObject3d	= function(object3d){
	if( object3d.geometry instanceof THREE.SphereGeometry ){
		var sphere	= object3d.geometry.boundingSphere.clone()
		var collider	= new THREEx.ColliderSphere(object3d, sphere)
	}else if( object3d.geometry instanceof THREE.CubeGeometry ){
		object3d.geometry.computeBoundingBox()
		var box3	= object3d.geometry.boundingBox.clone()
		var collider	= new THREEx.ColliderBox3(object3d, box3)
	}else	console.assert(false)

	return collider
}

//////////////////////////////////////////////////////////////////////////////////
//		Comment								//
//////////////////////////////////////////////////////////////////////////////////
THREEx.ColliderSphere	= function(object3d, sphere){
	THREEx.Collider.call( this, object3d )
	this.sphere	= sphere
}

THREEx.ColliderSphere.prototype = Object.create( THREEx.Collider.prototype );

THREEx.ColliderSphere.prototype.collideWith	= function(otherCollider){
	if( otherCollider instanceof THREEx.ColliderSphere ){
		return this.collideWithSphere(otherCollider)
	}else if( otherCollider instanceof THREEx.ColliderBox3 ){
		return otherCollider.collideWithSphere(this)
	}else	console.assert(false)
}

THREEx.ColliderSphere.prototype.collideWithSphere	= function(otherCollider){
	console.assert( otherCollider instanceof THREEx.ColliderSphere )

	var thisCollider= this

	var thisSphere	= thisCollider.sphere.clone()
	thisCollider.object3d.updateMatrixWorld( true );
	thisSphere.applyMatrix4(thisCollider.object3d.matrixWorld)

	var otherSphere	= otherCollider.sphere.clone()
	otherCollider.object3d.updateMatrixWorld( true );
	otherSphere.applyMatrix4(otherCollider.object3d.matrixWorld)

	var doCollide	= thisSphere.intersectsSphere(otherSphere)
	return doCollide ? true : false
}

//////////////////////////////////////////////////////////////////////////////////
//		Comment								//
//////////////////////////////////////////////////////////////////////////////////

THREEx.ColliderBox3	= function(object3d, box3){
	THREEx.Collider.call( this, object3d )
	this.box3	= box3
}

THREEx.ColliderBox3.prototype = Object.create( THREEx.Collider.prototype );

THREEx.ColliderBox3.prototype.collideWith	= function(otherCollider){
	if( otherCollider instanceof THREEx.ColliderBox3 ){
		return this.collideWithBox3(otherCollider)
	}else if( otherCollider instanceof THREEx.ColliderSphere ){
		return this.collideWithSphere(otherCollider)
	}else	console.assert(false)
}

THREEx.ColliderBox3.prototype.collideWithBox3	= function(otherCollider){
	console.assert( otherCollider instanceof THREEx.ColliderBox3 )

	var thisCollider= this

	var thisBox3	= thisCollider.box3.clone()
	thisCollider.object3d.updateMatrixWorld( true );
	thisBox3.applyMatrix4(thisCollider.object3d.matrixWorld)

	var otherBox3	= otherCollider.box3.clone()
	otherCollider.object3d.updateMatrixWorld( true );
	otherBox3.applyMatrix4(otherCollider.object3d.matrixWorld)

	var doCollide	= thisBox3.isIntersectionBox(otherBox3)
	return doCollide ? true : false
}


THREEx.ColliderBox3.prototype.collideWithSphere	= function(otherCollider){
	console.assert( otherCollider instanceof THREEx.ColliderSphere )

	var thisCollider= this

	var thisBox3	= thisCollider.box3.clone()
	thisCollider.object3d.updateMatrixWorld( true );
	thisBox3.applyMatrix4(thisCollider.object3d.matrixWorld)

	var otherSphere	= otherCollider.sphere.clone()
	otherCollider.object3d.updateMatrixWorld( true );
	otherSphere.applyMatrix4(otherCollider.object3d.matrixWorld)
	
	var distanceTo	= thisBox3.distanceToPoint(otherSphere.center)
	var doCollide	= distanceTo <= otherSphere.radius ? true : false
	return doCollide
}






