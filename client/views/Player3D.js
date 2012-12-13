module.exports = function(data, scene, geometry, materials, light){
  _.extend(this, data);

  this.scene = scene;
  this.light = light;

  /*var geometry = new THREE.CubeGeometry( 40, 40, 40 );

  this.model = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );*/

  this.model = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ));
  this.model.material.ambient = this.model.material.color;
  this.model.castShadow = true;
  this.model.receiveShadow = true;
  //this.model.rotation.x = 90 * (Math.PI / 180);

  this.light2 = new THREE.PointLight( 0xff6600, 10, 120 ); 
  //this.light.castShadow = true;
  this.light2.visible = false;
  this.light2.position.y = 90; 
  this.light2.position.z = 30; 
  this.model.add( this.light2 );

  this.scene.add( this.model );
}

_.extend(module.exports.prototype, {
  render: function(){
    this.light2.visible = this.hasTreasure;  

    if (this.directions.left && this.directions.top)
      this.model.rotation.y =  -135 * (Math.PI / 180);
    else
    if (this.directions.right && this.directions.top)
      this.model.rotation.y =  135 * (Math.PI / 180);
    else
    if (this.directions.left && this.directions.bottom)
      this.model.rotation.y =  -45 * (Math.PI / 180);
    else
    if (this.directions.right && this.directions.bottom)
      this.model.rotation.y =  45 * (Math.PI / 180);
    else
    if (this.directions.left)
      this.model.rotation.y =  -90 * (Math.PI / 180);
    else
    if (this.directions.right)
      this.model.rotation.y =  90 * (Math.PI / 180);
    else
    if (this.directions.top)
      this.model.rotation.y =  180 * (Math.PI / 180);
    else
    if (this.directions.bottom)
      this.model.rotation.y =  0 * (Math.PI / 180);

    this.model.position.x = this.x - 400;
    this.model.position.z = this.y - 300;

    if (this.hasTreasure) {
      this.light.position.x = this.x - 400;
      this.light.position.z = this.y - 300;  
    }

    return this;
  },
  remove: function(){
    this.scene.remove(this.model);
  }
});