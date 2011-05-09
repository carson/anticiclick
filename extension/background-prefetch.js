//
// USER DATA IS STORED AT THE DIRECTRY (Vista or 7)
// C:\Users\[username]\AppData\Local\Google\Chrome\User Data\Default\Local Storage
//
//
//
//

/////////////////FUNCTION FOR PREFETCHING///////////////////////
function prefetch(url) {
    //alert(url);
    //var f = document.createElement('iframe');
    //f.src=url;
    //f.style.display='none';
    //document.body.appendChild(f);
    port.postMessage({from:'content', type:'prefetch', val:url});
}


/////////////////FUNCTION FOR GET POSITION//////////////////////
function getPosition(that) {
  var targetElm=that, elemName=[];
  var pos = new function() {
    this.parent=""; this.x=0; this.y=0; this.width=0; this.height=0;
  }
  //pos.width= targetElm.offsetWidth;
  //pos.height= targetElm.offsetHeight;
  pos.x = 0.5*targetElm.offsetWidth;
  pos.y = 0.5*targetElm.offsetHeight;
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
var wsizeX=window.innerWidth, wsizeY=window.innerHeight, maxV = 32;
var tilesizeX = 32, tilesizeY = 32, tilesizeV =16;
var threshold = 0.1, alp = 0.1, gam = 0.9, reward = 1.0, nreward = -1.0;
var px=0,pvx=0,py=0,pvy=0;
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
    if(py+i>-1 && py+i<sizeY){
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


/////////////////CALICURATE NEAREST ANCHOR////////////////////
function minDis(ipt){
  var xpos = ipt.ax;
  var ypos = ipt.ay;
  var buf_min = 1.0E10;
  var buf_k = 0;
  for(i=0;i<a_list.length;i++){
    if(buf_min>((a_list[i][0]-xpos)*(a_list[i][0]-xpos)+(a_list[i][1]-ypos)*(a_list[i][1]-ypos))){
      buf_min = ((a_list[i][0]-xpos)*(a_list[i][0]-xpos)+(a_list[i][1]-ypos)*(a_list[i][1]-ypos));
      buf_k = i;
    }
  }
  return buf_k;
}


//////////////////IF ANCHOR IS CLICKED///////////////////////////
function clickHandler(){
  var p;
  for(p=0;p<arraySize;p++){
    if(cand_que[p]>-1) {
      if(cand_que[p]-this.num!=0){
        QV_X[res_que[p][0]][res_que[p][1]][res_que[p][2]] = (1-alp)*QV_X[res_que[p][0]][res_que[p][1]][res_que[p][2]]+alp*(reward);
        QV_Y[res_que[p][3]][res_que[p][4]][res_que[p][5]] = (1-alp)*QV_Y[res_que[p][3]][res_que[p][4]][res_que[p][5]]+alp*(reward);
      } else {
        QV_X[res_que[p][0]][res_que[p][1]][res_que[p][2]] = (1-alp)*QV_X[res_que[p][0]][res_que[p][1]][res_que[p][2]]+alp*(nreward);
        QV_Y[res_que[p][3]][res_que[p][4]][res_que[p][5]] = (1-alp)*QV_Y[res_que[p][3]][res_que[p][4]][res_que[p][5]]+alp*(nreward);
      }
    }
  }
  click_result.push(this.num);
  click_result.push("n");
  var cobj = new Object();
  cobj.name = "anticiclick_x";
  cobj.value = QV_X.join(',');
  localStorage.setItem(cobj.name, cobj.value);
  var cobj2 = new Object();
  cobj2.name = "anticiclick_y";
  cobj2.value = QV_Y.join(',');
  localStorage.setItem(cobj2.name, cobj2.value);
  var cobj3 = new Object();
  cobj3.name = "click_result";
  cobj3.value = click_result.join(',');
  localStorage.setItem(cobj3.name, cobj3.value);
  //alert("stored");
}


///////////////TABLELOAD FROM LOCALSTRAGE OR SET/////////////////////////
function setTableX() {
  for(i=0;i<sizeX;i++){
    QV_X[i] = new Array(sizeV);
    for(j=0;j<sizeV;j++){
      QV_X[i][j] = new Array(sizeX);
      for(k=0;k<sizeX;k++){
        //QV_X[i][j][k] = Math.random() * eps;
        QV_X[i][j][k] = Math.pow(Math.E, -(k-i+10*j)*(k-i+10*j)) * eps;
      }
    }
  }
}
function setTableY() {
  for(i=0;i<sizeY;i++){
    QV_Y[i] = new Array(sizeV);
    for(j=0;j<sizeV;j++){
      QV_Y[i][j] = new Array(sizeY);
      for(k=0;k<sizeY;k++){
        //QV_Y[i][j][k] = Math.random() * eps;
        QV_Y[i][j][k] = Math.pow(Math.E, -(k-i+10*j)*(k-i+10*j)) * eps;
      }
    }
  }
}

function CSVParseX(storestr) {
  var buf_table = storestr.split(",");
  for(i=0;i<sizeX;i++){
    QV_X[i] = new Array(sizeV);
    for(j=0;j<sizeV;j++){
      QV_X[i][j] = new Array(sizeX);
      for(k=0;k<sizeX;k++){
        QV_X[i][j][k] = buf_table[sizeV*sizeX*k+sizeX*j+i];
      }
    }
  }
}
function CSVParseY(storestr) {
  buf_table = storestr.split(",");
  for(i=0;i<sizeY;i++){
    QV_Y[i] = new Array(sizeV);
    for(j=0;j<sizeV;j++){
      QV_Y[i][j] = new Array(sizeY);
      for(k=0;k<sizeY;k++){
        QV_Y[i][j][k] = buf_table[sizeV*sizeY*k+sizeY*j+i];
      }
    }
  }
}

function cresultParse(storestr) {
  buf_table = storestr.split(",");
  for(i=0;i<buf_table.length;i++){
    click_result.push(buf_table[i]);
  }
}

function tableInitialize(){
  if(localStorage.getItem("anticiclick_x")){
    //alert("loadTableX");
    CSVParseX(localStorage.getItem("anticiclick_x"));
  } else {
    setTableX();
    //alert("setTableX");
  }
  if(localStorage.getItem("anticiclick_y")){
    //alert("loadTableY");
    CSVParseY(localStorage.getItem("anticiclick_y"));
  } else {
    setTableY();
    //alert("setTableY");
  }
  if(localStorage.getItem("click_result")){
    cresultParse(localStorage.getItem("click_result"));
    //alert("getCResult");
  }
}


///////////////JAVASCRIPT START FROM THIS POINT (INIT)//////////////////
var anchors = document.getElementsByTagName("a");
var m=anchors.length;
var n;
var a_list = new Array();
var buf_pos, cand, res, buf_res=0;
var arraySize=1;
var res_que = new Array(arraySize);
var cand_que = new Array(arraySize);
var vote_list = new Array(m);
for(n=0;n<vote_list.length;n++){
  vote_list[n] = 0;
}

var sizeX = 64, sizeY = 64;
var sizeV = 8;
var i,j,k;
var eps = 0.01;
var QV_X = new Array(sizeX);
var QV_Y = new Array(sizeY);
var click_result = new Array();
tableInitialize();

for(n=0;n<m;n++) {
  //alert(anchors[m].href);
  buf_pos = getPosition(anchors[n]);
  //a_list.push([buf_pos.x,buf_pos.y,anchors[m].href]);
  //alert(Math.floor(buf_pos.x*sizeX/wsizeX)+" "+Math.floor(buf_pos.y*sizeY/wsizeY));
  a_list.push([Math.floor(buf_pos.x*sizeX/wsizeX),Math.floor(buf_pos.y*sizeY/wsizeY),anchors[n].href]);
  //anchors[m].style.backgroundColor="black";
  //anchors[m].style.color="white";
  anchors[n].num=n;
  anchors[n].addEventListener('click', clickHandler, false);
}

var port = chrome.extension.connect({"name": "content"});
var rl_res;
var bufX=0,bufY=0;

//alert("startcheck");

window.addEventListener('mousemove', function(evt) {
  var cur = new function(){
    this.x = 0; this.y = 0;
  }
  cur.x = evt.clientX;
  cur.y = evt.clientY;
  if (cur.x-bufX != 0 || cur.y-bufY != 0) {
    rl_res = rLearning(cur);
    res_que.push([rl_res.xx,rl_res.vx,rl_res.ax,rl_res.yy,rl_res.vy,rl_res.ay]);
    res_que.shift();
    
    cand = minDis(rl_res);
    
    //anchors[cand].style.backgroundColor="black";
    //anchors[cand].style.color="white";
    cand_que.push(cand);
    vote_list[cand]++;
    if(cand_que[0]>-1){
      vote_list[cand_que.shift()]--;
      res = 0;
      for(n=0;n<vote_list.length;n++){
        if(vote_list[n]>vote_list[res]) res = n;
      }
      if(res-buf_res!=0){
        anchors[buf_res].style.backgroundColor="";
        anchors[buf_res].style.color="";
        anchors[res].style.backgroundColor="black";
        anchors[res].style.color="white";
        click_result.push(res);
        prefetch(anchors[res].href);
      }
      //alert(vote_list);
      buf_res = res;
    } else {
      cand_que.shift();
    }
    
    //alert("checkpoint");
  }
  
  
  bufX = cur.x;
  bufY = cur.y;
}, true);


