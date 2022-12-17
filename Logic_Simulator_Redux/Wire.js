function Wire(from,to,bent,bends){
   // both the from and to are nodes
   this.to = to;
   this.from = from;
   this.bent = bent;
   this.bends = bends;
   this.render = () => {
    push();
    strokeWeight(3);
    var col = this.from.value ? color(255, 230, 0) : color(255);
    stroke(col);
    var index = this.bends.length-1;
    if(this.bent){
      for(var i=0;i<index;i++){
        line(this.bends[i].x,this.bends[i].y,this.bends[i+1].x,this.bends[i+1].y);
      }
    }
    line(this.bends[index].x,this.bends[index].y,this.to.wn.x,this.to.wn.y);
    pop();
   }
}