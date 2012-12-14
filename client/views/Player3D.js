module.exports = function(data, scene, geometry, materials, light){
  _.extend(this, data);

  this.scene = scene;
  this.light = light;

  this.phase = 0;

  this.model = new THREE.Object3D();

  this.body = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial( materials ));
  this.body.material.ambient = this.body.material.color;
  this.body.castShadow = true;
  this.body.receiveShadow = true;

  this.light2 = new THREE.PointLight( 0xff6600, 10, 120 ); 
  this.light2.visible = false;
  this.light2.position.y = 90; 
  this.light2.position.z = 20; 
  this.body.add( this.light2 );


  var geometry = new THREE.Geometry();
  var sprite = THREE.ImageUtils.loadTexture( "textures/snowflake4.png" );

  for ( i = 0; i < 150; i ++ ) {

    var vertex = new THREE.Vector3();
    vertex.x = Math.random() * 60 - 30;
    vertex.y = Math.random() * 30 - 15;
    vertex.z = Math.random() * 30 - 15;

    geometry.vertices.push( vertex );

  }

  this.color = [0.80, 0, 0.15];

  this.particlesMaterial = new THREE.ParticleBasicMaterial( { size: 35, map: sprite, blending: THREE.AdditiveBlending, transparent : true } );
  this.particlesMaterial.color.setHSV(this.color[0], this.color[1], this.color[2]);

  this.particles = new THREE.ParticleSystem( geometry, this.particlesMaterial );
  this.particles.position.y = 15;
  this.particles.position.z = -15;



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

      var time = Date.now() * 0.005;

      this.particles.rotation.x = time * ( i < 4 ? i + 1 : - ( i + 1 ) ); // Math.random() * 360 * (Math.PI / 180);
      this.particles.scale.x = 0.01 + (d / 20);
      this.particles.scale.y = this.particles.scale.x;
      this.particles.scale.z = this.particles.scale.x;
      this.particlesMaterial.color.setHSV( h, 0.2, 1);

      h = ( 360 * ( this.color[0] + time ) % 360 ) / 360;
      this.particlesMaterial.color.setHSV( h, this.color[1], this.color[2] );
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