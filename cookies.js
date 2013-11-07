removeYouTubeAds();

function removeYouTubeAds() {
	var days = 30; //this will expire after 30days
	var name = "VISITOR_INFO1_LIVE";
	var value = "oKckVSqvaGw";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/; domain=.youtube.com";
}

function restoreToNormal() {
	var name = "VISITOR_INFO1_LIVE";
	var value = "oKckVSqvaGw";
	// no expire = expires after closing browser
	document.cookie = name+"="+value+"; path=/;  domain=.youtube.com";
}
