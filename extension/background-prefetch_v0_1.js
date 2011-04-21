// Script is Public Domain
// Icon derived from http://www.flickr.com/photos/arthur-caranta/3008276379/

function prefetch(url) {
    alert(url);
    var f = document.createElement('iframe');
    f.src=url;
    f.style.display='none';
    document.body.appendChild(f);
}

function clickHandler(){ 
    //prefetch(this.href);
    var element = document.getElementsByTagName("a");
    i=element.length;
		while (i--) {
    	alert(element[i].offsetTop);
	}
}

var anchors = document.getElementsByTagName("a");
i=anchors.length;
while (i--) {
    anchors[i].addEventListener('click', clickHandler, false);
}	     


