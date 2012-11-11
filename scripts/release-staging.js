require('shelljs/global');

var p = require("../package.json");
var newVersion = p.version.split(".");
newVersion[2] = (parseInt(newVersion[2])+1).toString();
newVersion = newVersion.join(".");
cd(__dirname+"/../");

if(exec("git checkout master").code != 0) {
  echo("Error: failed to checkout master");
  exit(1);
}

if(exec("git pull --ff origin master").code != 0){
  echo("Error: failed to pull origin master");
  exit(1);
}

if(exec("git merge --ff develop").code != 0) {
  echo("Error: failed merge develop into master");
  exit(1);  
}

// TODO find out how to trap errors from sed bellow
sed('-i', '"version": "'+p.version+'"', '"version": "'+newVersion+'"', "package.json");

if(exec("git add --all").code != 0){
  echo("Error: failed to git add --all");
  exit(1);
}

if(exec("git commit -am '"+newVersion+" release'").code != 0){
  echo("Error: failed to commit version bump");
  exit(1);
}

if(exec("git checkout develop").code != 0) {
  echo("Error: failed to checkout develop");
  exit(1);
}

if(exec("git merge --ff master").code != 0) {
  echo("Error: failed to merge back from master");
  exit(1);
}  

if(exec("git push").code != 0){
  echo("Error: failed to git push");
  exit(1);
}

require("./restart-staging");
