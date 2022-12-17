function Block(x,y,inputNum,outputNum,sequence,col,name){
  this.x = x;
  this.y = y;
  this.id = genId(5);
  this.seq = sequence;
  this.name = name;
  this.color = color(col.r,col.g,col.b);
  this.context = {inpNum:inputNum,outNum:outputNum};
  this.max = max(inputNum,outputNum);
  this.nodes = [];
  for(var i =0;i<this.context.inpNum;i++){
    this.nodes.push(new Node(this.x,this.y+(i*30)+10,"inp",this));
    Nodes.push(this.nodes[i]);
  }
  for(var i =0;i<this.context.outNum;i++){
    this.nodes.push(new Node(this.x+95,this.y+(i*30)+10,"out",this));
    Nodes.push(this.nodes[i+this.context.inpNum]);
  }
  
  this.render = () => {
    push();
    noStroke();
    fill(this.color);
    rect(this.x,this.y,95,this.max*25);
    for(var n of this.nodes){
      n.render();
    }
    fill(0);
    textSize(15);
    text(this.name,this.x+(40-(this.name.length)*2),this.y+(this.max*25)/1.5)
    pop();
  }
  
  this.calculateOutputs = () => {
    let inps = [];
    for(var i =0;i<this.context.inpNum;i++){
      inps[i] = this.nodes[i].value;
    }
    let outputs = getOutputs(inps,this.seq);
    for(var i=inps.length;i<this.nodes.length;i++){
     this.nodes[i].value = outputs[i-inps.length];
    }
  }
}



function getOutputs(inp,table){
  let inpNum = inp.length;
  let flag = true;
  for(var i =0;i<table.length;i++){
    flag = true;
    for(var j=0;j<inpNum;j++){
      
      if(inp[j] != table[i][j]){
        flag = false;
      }
      
    }
    if(flag){
      let res = [];
      for(var k = inpNum;k<table[i].length;k++){
        res.push(table[i][k]);
      }
      return res;
    }
  }
}