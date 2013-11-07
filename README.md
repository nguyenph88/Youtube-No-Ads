Youtube No Advertisement (Ad-free)
============

Why I make this:
---------------
So this morning I was watching some youtube videos and I was annoyed a lot when I there were 5 ads in a row that couldn't be "skipped". Other than that, 3 of them were about ipage which I really don't care much about. No matter how many times I click "No" for "show me this ads like this", it still pops out.

So I decide to make a pure youtube without any ads (well, not the long one at least), no comments, links, spam etc ...

SO I make this: http://www.nguyenphuoc.net/tools/youtube/

The Story Behind:
----------------
This work-around is very simple. It's completely legal, that is to use the cookie session of the Goolge TestTube (A product of Google - Youtube that people can try new things). Whenever we trigger a youtube video, we will create a cookie "VISITOR_INFO1_LIVE" which a random value.

The way to work-around is to set the value to a given value (which is believed to disable long ads).

> VISITOR_INFO1_LIVE=oKckVSqvaGw

Website:
--------
So I tried to implement that method and it worked. Moreover, I found a very nice way to make an instant youtube which automatically plays the video as you search. The algorithm belongs to Feross@Stanford.

Other way to disable Youtube Ads:
--------------------------------
In fact, that website is just a fancy way to show off. You can easily turn of the ads when watching youtube.com without any third party software.

Go to youtube.com and watch any video. For firefox, bring up the developer console by Ctrl + Shift + K (For chrome: Ctrl + Shift + J) then type and execute this command:

> document.cookie="VISITOR_INFO1_LIVE=oKckVSqvaGw; path=/; domain=.youtube.com";window.location.reload();

That's all you need to disable ads on youtube.
