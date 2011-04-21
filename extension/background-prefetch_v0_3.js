/////////////////FUNCTION FOR PREFETCHING///////////////////////
function prefetch(url) {
    alert(url);
    var f = document.createElement('iframe');
    f.src=url;
    f.style.display='none';
    document.body.appendChild(f);
}


/////////////////FUNCTION FOR GET POSITION//////////////////////
function getPosition(that) {
  var targetElm=that, elemName=[];
  var pos = new function() {
    this.parent=""; this.x=0; this.y=0; this.width=0; this.height=0;
  }
  pos.width= targetElm.offsetWidth;
  pos.height= targetElm.offsetHeight;
    while( targetElm ){
      if (targetElm) elemName[elemName.length]=targetElm.tagName+"("+(targetElm.id || "id:Nan")+")";
    pos.x += targetElm.offsetLeft; 
    pos.y += targetElm.offsetTop; 
    targetElm = targetElm.offsetParent;
  }
  //alert(pos.x+" "+pos.y);
  return pos;
}


/////////////////REINFORCEMENT LEARNING//////////////////////////
var wsizeX=window.innerWidth, wsizeY=window.innerHeight, maxV = 40;
var sizeX = 100, sizeY = 50;
var sizeV = 20;
var tilesizeX = 10, tilesizeY = 5, tilesizeV =2;
var eps = 0.01, threshold = 0.1, alp = 0.1, gam = 0.9, reward = 1.0;
var QV_X = new Array(sizeX);
var QV_Y = new Array(sizeY);
var i,j,k,px=0,pvx=0,py=0,pvy=0;
for(i=0;i<sizeX;i++){
  QV_X[i] = new Array(sizeV);
  for(j=0;j<sizeV;j++){
    QV_X[i][j] = new Array(sizeX);
    for(k=0;k<sizeX;k++){
      QV_X[i][j][k] = Math.random() * eps;
    }
  }
}
for(i=0;i<sizeY;i++){
  QV_Y[i] = new Array(sizeV);
  for(j=0;j<sizeV;j++){
    QV_Y[i][j] = new Array(sizeY);
    for(k=0;k<sizeY;k++){
      QV_Y[i][j][k] = Math.random() * eps;
    }
  }
}
function rLearning(cur){
  var sw,buf_maxX,buf_maxY,buf;
  var curX,curY,velX,velY;
  var xx,vx,ax=0;
  var yy,vy,ay=0;
  
  curX = cur.x;
  curY = cur.y;
  
  var buf_ret = new function(){
    this.ax=0; this.ay=0; this.xx=0; this.vx=0; this.yy=0; this.vy=0;
  }
  velX = curX - bufX;
  velY = curY - bufY;
  //alert(curX+" "+bufX+" "+curY+" "+bufY);
  
  xx = Math.min(sizeX-1,Math.floor(curX*sizeX/wsizeX));
  yy = Math.min(sizeY-1,Math.floor(curY*sizeY/wsizeY));
  vx = Math.max(0,Math.min(sizeV-1,Math.floor((velX+maxV/2)*sizeV/maxV)));
  vy = Math.max(0,Math.min(sizeV-1,Math.floor((velY+maxV/2)*sizeV/maxV)));
  
  //decide action
  sw = Math.random();
  if(sw<threshold){
    ax = Math.floor(Math.random()*sizeX);
    ay = Math.floor(Math.random()*sizeY);
  }else{
    buf_maxX = -1.0E10;
    for(k=0;k<sizeX;k++){
      if(buf_maxX<QV_X[xx][vx][k]){
        buf_maxX = QV_X[xx][vx][k];
        ax = k;
      }
    }
    if(buf_maxX<eps){
      ax = Math.floor(Math.random()*sizeX);
    }
    buf_maxY = -1.0E10;
    for(k=0;k<sizeY;k++){
      if(buf_maxY<QV_Y[yy][vy][k]){
        buf_maxY = QV_Y[yy][vy][k];
        ay = k;
      }
    }
    if(buf_maxY<eps){
      ay = Math.floor(Math.random()*sizeY);
    }
  }
  
  //port.postMessage({from:'content', type:'pointer', position:[curX, curY], velocity:[velX, velY], tbl:[xx, yy], vtb:[vx, vy], pr:[ax, ay], num:tst});
  //update Q-value
  for(i=Math.ceil(-tilesizeX);i<Math.floor(tilesizeX);i++){
    if(px+i>-1 && px+i<sizeX){
      for(j=Math.ceil(-tilesizeV);j<Math.floor(tilesizeV);j++){
        if(pvx+j>-1 && pvx+j<sizeV){
          QV_X[px+i][pvx+j][ax] = (1-alp)*QV_X[px][pvx][ax]+alp*(gam*buf_maxX);
        }
      }
    }
  }
  for(i=Math.ceil(-tilesizeY);i<Math.floor(tilesizeY);i++){
    if(py+i>-1 && py+j<sizeY){
      for(j=Math.ceil(-tilesizeV);j<Math.floor(tilesizeV);j++){
        if(pvy+j>-1 && pvy+j<sizeV){
          QV_Y[py+i][pvy+j][ay] = (1-alp)*QV_Y[py][pvy][ay]+alp*(gam*buf_maxY);
        }
      }
    }
  }
  px = xx;
  py = yy;
  pvx = vx;
  pvy = vy;
  
  buf_ret.xx = xx;
  buf_ret.vx = vx;
  buf_ret.ax = ax;
  buf_ret.yy = yy;
  buf_ret.vy = vy;
  buf_ret.ay = ay;
  
  return buf_ret;
}



function clickHandler(){ 
    //prefetch(this.href);
}

///////////////JAVASCRIPT START FROM THIS POINT (INIT)//////////////////
var anchors = document.getElementsByTagName("a");
var i=anchors.length;
var a_list = new Array();
var buf_pos;
var arraySize=100
var res_que = new Array(arraySize);
while (i--) {
  //alert(anchors[i].href);
  buf_pos = getPosition(anchors[i]);
  a_list.push([buf_pos.x,buf_pos.y,anchors[i].href]);
  anchors[i].style.backgroundColor="black";
  anchors[i].style.color="white";
}

var port = chrome.extension.connect({"name": "content"});
var rl_res;
var bufX=0,bufY=0;

//chrome.windows.onRemoved.addListener(function() {alert("test");});
window.addEventListener('mousemove', function(evt) {
  var cur = new function(){
    this.x = 0; this.y = 0;
  }
  cur.x = evt.clientX;
  cur.y = evt.clientY;
  if (cur.x-bufX != 0 || cur.y-bufY != 0) {
    rl_res = rLearning(cur);
    res_que.push([rl_res.xx,rl_res.vx,rl_res.ax,rl_res.yy,rl_res.vy,rl_res.ay]);
    var tst = res_que.shift();
  }
  
  bufX = cur.x;
  bufY = cur.y;
}, true);


