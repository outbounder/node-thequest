module.exports = function(data, scene, geometry, materials, light){
  _.extend(this, data);

  this.scene = scene;
  this.light = light;

  this.phase = 0;

  /*var geometry = new THREE.CubeGeometry( 40, 40, 40 );

  this.model = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );*/

  
  //this.model.rotation.x = 90 * (Math.PI / 180);

  this.model = new THREE.Object3D();

  this.body = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ));
  this.body.material.ambient = this.body.material.color;
  this.body.castShadow = true;
  this.body.receiveShadow = true;

  this.light2 = new THREE.PointLight( 0xff6600, 10, 120 ); 
  //this.light.castShadow = true;
  this.light2.visible = false;
  this.light2.position.y = 90; 
  this.light2.position.z = 30; 
  this.body.add( this.light2 );





  var geometry = new THREE.Geometry();
  var sprite = THREE.ImageUtils.loadTexture( "textures/snowflake4.png" );

  for ( i = 0; i < 200; i ++ ) {

    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 3000 - 1500;
    vertex.y = Math.random() * 1500;
    vertex.z = Math.random() * 3000 - 1500;

    geometry.vertices.push( vertex );

  }

  this.particlesMaterial = new THREE.ParticleBasicMaterial( { size: 5, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent : true } );
  this.particlesMaterial.color.setHSV(0.1, 0.2, 1;

  this.particles = new THREE.ParticleSystem( geometry, this.particlesMaterial );



  this.model.add(this.particles);
  this.model.add(this.body);
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

    var mx = this.model.position.x - (this.x - 400);
    var my = this.model.position.z - (this.y - 300);

    var d = Math.sqrt((mx * mx) + (my * my));

    if (d > 1 && this.phase == 0)
      this.phase += 20;

    if (this.phase != 0)
    {
      this.phase = this.phase + 20 > 360 ? 0 : this.phase + 20;
      this.body.rotation.y = 25 * (Math.PI / 180) * Math.sin(this.phase * Math.PI / 180) * (d / 20);
      this.body.rotation.z = 15 * (Math.PI / 180) * Math.sin(this.phase * Math.PI / 180) * (d / 20);

      /*var time = Date.now() * 0.00005;

      this.particles.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
      this.particlesMaterial.color.setHSV( h, 0.2, 1);*/
    }

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