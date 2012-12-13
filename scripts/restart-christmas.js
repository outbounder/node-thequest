require('shelljs/global');

var home = "cd ~/thequest;";
var remote = function(command){
  return 'ssh node@176.58.101.229 ". /home/node/.nvm/nvm.sh; nvm use v0.8.14;'+command+'"';
}
var updateCommand = home+" git fetch; git pull --ff origin master";
if(exec(remote(updateCommand)).code != 0){
  echo("Error: failed to update remote "+updateCommand);
  exit(1);
}

var updateDependenciesCommand = home+" npm install";
if(exec(remote(updateDependenciesCommand)).code != 0){
  echo("Error: failed to stop remote "+updateDependenciesCommand);
  exit(1);
}

var stopCommand = home+" forever stop thequest.js";
if(exec(remote(stopCommand)).code != 0){
  echo("Error: failed to stop remote "+stopCommand);
  exit(1);
}

var startCommand = home+" NODE_ENV=staging PORT=3001 forever start thequest-christmas.js";
if(exec(remote(startCommand)).code != 0){
  echo("Error: failed to start remote "+startCommand);
  exit(1);
}