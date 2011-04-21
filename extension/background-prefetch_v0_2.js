// Script is Public Domain
// Icon derived from http://www.flickr.com/photos/arthur-caranta/3008276379/

function prefetch(url) {
    alert(url);
    var f = document.createElement('iframe');
    f.src=url;
    f.style.display='none';
    document.body.appendChild(f);
}

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
  alert(pos.x+" "+pos.y);
  return pos;
}

function clickHandler(){ 
    //prefetch(this.href);
}

var anchors = document.getElementsByTagName("a");
i=anchors.length;
while (i--) {
    alert(anchors[i].href);
    getPosition(anchors[i]);
    anchors[i].addEventListener('click', clickHandler, false);
}


