// Youtube Instant Load Algorithm is from Feross
// He owns the script and algorithm
// I own nothing :(

google.load("swfobject", "2.1");
google.load("jquery", "1.4.2");

var _MAX_THUMBNAILS = 4;

// Recursively call
function _run() {
  loadPlayer();
}

// Then load the player
function loadPlayer() {
  currentVideoId = "OYws8biwOYc";
  var params = {
    allowScriptAccess: "always"
  };
  var atts = {
    id: "ytPlayer",
    allowFullScreen: "true"
  };
  swfobject.embedSWF("http://www.youtube.com/v/" + currentVideoId + "&enablejsapi=1&playerapiid=ytplayer" + "&rel=0&autoplay=0&egm=0&loop=0&fs=1&hd=0&showsearch=0&showinfo=0&iv_load_policy=3&cc_load_policy=1", "innerVideoDiv", "720", "405", "8", null, null, params, atts);
}

function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("ytPlayer");
  ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
  var searchBox = $("#searchBox");
  searchBox.keyup(doInstantSearch);
  $(document.documentElement).keydown(onKeyDown);
  $("#originalLink").click(function(e) {
    $(this).select();
  });
  $("#originalName").click(function(e) {
    $(this).select();
  });
  if (window.location.hash) {
    var searchTerm = $('<div/>').text(getHash()).html(); // escape html
    $("#searchBox").val(searchTerm).focus();
  } else {
	var defaultTerm = "im awesome spose";
    $("#searchBox").val(defaultTerm).select().focus();
  }
  onBodyLoad();
  doInstantSearch();
}

function onBodyLoad() {
  currentSearch = "";
  currentSuggestion = "";
  currentVideoId = "";
  playlistShowing = false;
  playlistArr = [];
  currentPlaylistPos = 0;
  currentPlaylistPage = 0;
  xhrWorking = false;
  pendingSearch = false;
  pendingDoneWorking = false;
  playerState = -1;
  hashTimeout = false;
}

function onPlayerStateChange(newState) {
  playerState = newState;
  if (pendingDoneWorking && playerState == 1) {
    doneWorking();
    pendingDoneWorking = false;
  } else if (playerState == 0) {
    goNextVideo();
  }
}

function onKeyDown(e) {
  if (e.keyCode == 39 || e.keyCode == 40) {
    goNextVideo();
  } else if (e.keyCode == 37 || e.keyCode == 38) {
    goPrevVideo();
  } else if (e.keyCode == 13) {
    playPause();
  }
}

function goNextVideo() {
  if (currentPlaylistPos == _MAX_THUMBNAILS - 1) {
    return;
  }
  goVid(currentPlaylistPos + 1, currentPlaylistPage);
}

function goPrevVideo() {
  if (currentPlaylistPos == 0) {
    return;
  }
  goVid(currentPlaylistPos - 1, currentPlaylistPage);
}

function goVid(playlistPos, playlistPage) {
  if (playlistPage != currentPlaylistPage) {
    currentPlaylistPage = playlistPage;
    return;
  }
  loadAndPlayVideo(playlistArr[playlistPage][playlistPos].id, playlistPos);
}

function doInstantSearch() {
  if (xhrWorking) {
    pendingSearch = true;
    return;
  }
  var searchBox = $("#searchBox");
  if (searchBox.val() == currentSearch) {
    return;
  }
  currentSearch = searchBox.val();
  if (searchBox.val() == "") {
    $("#playlistWrapper").slideUp("slow");
    playlistShowing = false;
    pauseVideo();
    clearVideo();
    updateHash("");
    currentSuggestion = "";
    updateSuggestedKeyword("<strong>your search keyword</strong>");
    return;
  }
  searchBox.attr("class", "statusLoading");
  keyword = searchBox.val();
  var the_url = "http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&jsonp=window.yt.www.suggest.handleResponse&q=" + encodeURIComponent(searchBox.val()) + "&cp=1";
  $.ajax({
    type: "GET",
    url: the_url,
    dataType: "script"
  });
  xhrWorking = true;
}

yt = {};

yt.www = {};

yt.www.suggest = {};

yt.www.suggest.handleResponse = function(suggestions) {
  if (suggestions[1][0]) {
    var searchTerm = suggestions[1][0][0];
  } else {
    var searchTerm = null;
  }
  updateHash(currentSearch);
  if (!searchTerm) {
    searchTerm = keyword;
    updateSuggestedKeyword(searchTerm + " (not related)");
  } else {
    updateSuggestedKeyword(searchTerm);
    if (searchTerm == currentSuggestion) {
      doneWorking();
      return;
    }
  }
  getTopSearchResult(searchTerm);
  currentSuggestion = searchTerm;
};

function getTopSearchResult(keyword) {
  var the_url = "http://gdata.youtube.com/feeds/api/videos?q=" + encodeURIComponent(keyword) + "&format=5&max-results=" + _MAX_THUMBNAILS + "&v=2&alt=jsonc";
  $.ajax({
    type: "GET",
    url: the_url,
    dataType: "jsonp",
    success: function(responseData, textStatus, XMLHttpRequest) {
      if (responseData.data.items) {
        var videos = responseData.data.items;
        playlistArr = [];
        playlistArr.push(videos);
        updateVideoDisplay(videos);
        pendingDoneWorking = true;
      } else {
        updateSuggestedKeyword('No results for "' + keyword + '"');
        doneWorking();
      }
    }
  });
}

function updateVideoDisplay(videos) {
  var numThumbs = videos.length >= _MAX_THUMBNAILS ? _MAX_THUMBNAILS : videos.length;
  var playlist = $("<div />").attr("id", "playlist");
  for (var i = 0; i < numThumbs; i++) {
    var videoId = videos[i].id;
    var img = $("<img />").attr("src", videos[i].thumbnail.sqDefault);
    var a = $("<a />").attr("href", "javascript:loadAndPlayVideo('" + videoId + "', " + i + ")");
    var title = $("<div />").html(videos[i].title);
    playlist.append(a.append(img).append(title));
  }
  var playlistWrapper = $("#playlistWrapper");
  $("#playlist").remove();
  playlistWrapper.append(playlist);
  if (!playlistShowing) {
    playlistWrapper.slideDown("slow");
    playlistShowing = true;
  }
  currentPlaylistPos = -1;
  if (currentVideoId != videos[0].id) {
    loadAndPlayVideo(videos[0].id, 0, true);
  }
}

function doneWorking() {
  xhrWorking = false;
  if (pendingSearch) {
    pendingSearch = false;
    doInstantSearch();
  }
  var searchBox = $("#searchBox");
  searchBox.attr("class", "statusPlaying");
}

function updateHTML(elmId, value) {
  document.getElementById(elmId).innerHTML = value;
}

function updateSuggestedKeyword(keyword) {
  // this is where I update the vid name
  $("#originalName").val(keyword);	
  updateHTML("searchTermKeyword", keyword);
}

function updateHash(hash) {
  var timeDelay = 1e3;
  if (hashTimeout) {
    clearTimeout(hashTimeout);
  }
  hashTimeout = setTimeout(function() {
    window.location.replace("#" + encodeURI(hash));
    document.title = '"' + currentSuggestion.toTitleCase() + '" - Faster youtube';
  }, timeDelay);
}

function getHash() {
  return decodeURIComponent(window.location.hash.substring(1));
}

function loadVideo(videoId) {
  if (ytplayer) {
    ytplayer.cueVideoById(videoId);
    currentVideoId = videoId;
  }
}

function playVideo() {
  if (ytplayer) {
    ytplayer.playVideo();
  }
}

function loadAndPlayVideo(videoId, playlistPos, bypassXhrWorkingCheck) {
  if (currentPlaylistPos == playlistPos) {
    playPause();
    return;
  }
  if (!bypassXhrWorkingCheck && xhrWorking) {
    return;
  }
  if (ytplayer) {
    xhrWorking = true;
    ytplayer.loadVideoById(videoId);
    currentVideoId = videoId;
	// this is where i update the vid URL
	$("#originalLink").val(ytplayer.getVideoUrl());
    pendingDoneWorking = true;
  }
  currentPlaylistPos = playlistPos;
  $("#playlistWrapper").removeClass("play0 play1 play2 play3 play4 pauseButton playButton").addClass("pauseButton play" + playlistPos);
  var playlist = $("#playlist");
  playlist.children().removeClass("selectedThumb");
  playlist.children(":nth-child(" + (playlistPos + 1) + ")").addClass("selectedThumb");
  $("#embedUrl").val('<object width="640" height="385"><param name="movie" value="http://www.youtube.com/v/' + currentVideoId + '?fs=1&hl=en_US"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/' + currentVideoId + '?fs=1&hl=en_US" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="640" height="385"></embed></object>');
}

function setPlaybackQuality(quality) {
  if (ytplayer) {
    ytplayer.setPlaybackQuality(quality);
  }
}

function pauseVideo() {
  if (ytplayer) {
    ytplayer.pauseVideo();
  }
}

function muteVideo() {
  if (ytplayer) {
    ytplayer.mute();
  }
}

function unMuteVideo() {
  if (ytplayer) {
    ytplayer.unMute();
  }
}

function clearVideo() {
  if (ytplayer) {
    ytplayer.clearVideo();
  }
}

function getVideoUrl() {
  alert(ytplayer.getVideoUrl());
}

function setVolume(newVolume) {
  if (ytplayer) {
    ytplayer.setVolume(newVolume);
  }
}

function getVolume() {
  if (ytplayer) {
    return ytplayer.getVolume();
  }
}

function playPause() {
  if (ytplayer) {
    if (playerState == 1) {
      pauseVideo();
      $("#playlistWrapper").removeClass("pauseButton").addClass("playButton");
    } else if (playerState == 2) {
      playVideo();
      $("#playlistWrapper").removeClass("playButton").addClass("pauseButton");
    }
  }
}

String.prototype.toTitleCase = function() {
  return this.replace(/([\w&`'‘’"“.@:\/\{\(\[<>_]+-? *)/g, function(match, p1, index, title) {
    if (index > 0 && title.charAt(index - 2) !== ":" && match.search(/^(a(nd?|s|t)?|b(ut|y)|en|for|i[fn]|o[fnr]|t(he|o)|vs?\.?|via)[ \-]/i) > -1) return match.toLowerCase();
    if (title.substring(index - 1, index + 1).search(/['"_{(\[]/) > -1) return match.charAt(0) + match.charAt(1).toUpperCase() + match.substr(2);
    if (match.substr(1).search(/[A-Z]+|&|[\w]+[._][\w]+/) > -1 || title.substring(index - 1, index + 1).search(/[\])}]/) > -1) return match;
    return match.charAt(0).toUpperCase() + match.substr(1);
  });
};

google.setOnLoadCallback(_run);