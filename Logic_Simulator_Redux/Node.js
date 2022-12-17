function WireNode(x,y,p){
  this.x = x;
  this.y = y;
  this.d = 10;
  this.parent = p;
  this.a = null;
  
  this.update = () => {
    if(this.a && this.parent.type != "start"){
      this.parent.value = this.a.from.value;
    }
  }
  
  this.render = () =>{
    push();
    stroke(0);
    fill(255);
    circle(this.x,this.y,this.d);
    pop();
  }
}


function Node(x,y,type,a=null,inp=-1){
  this.x = x;
  this.y = y;
  this.d = 25;
  this.inpNum = inp;
  this.attached = a;
  this.type = type;
  this.value = false;
  this.id = genId(5);
  this.wn = new WireNode(this.x+12,this.y,this);
  if(this.type == "end" || this.type == "inp"){
    this.wn.x = this.x-12;
  }
  
  this.render = () => {
    push();
    noStroke();
    fill(0);
    if(this.value && (type == "start" || type == "end")){
      fill(245, 68, 32);
    }
    circle(this.x,this.y,this.d);
    pop();
    this.wn.render();
    this.wn.update();
  }
}


// const mouseOver = (cx,cy,cd) => {
//   return dist(mouseX,mouseY,cx,cy) < cd/2;
// }
const touchingMouse = (node) => {
  return dist(mouseX,mouseY,node.x,node.y) < node.d/2;
}

const genId = (len) =>{
  const alph = "abcdefghijklmnopqrstuvwxyz";
  let res = "";
  for(var i=0;i<len;i++){
    res += alph[int(random(26))];
  }
  return res;
}