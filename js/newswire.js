/* utility functions */
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function comparePublishTime(a,b) {
    if (Date(a.publishedDate) < Date(b.publishedDate))
        return -1;
    if (Date(a.publishedDate) > Date(b.publishedDate))
        return 1;
    return 0;
}

/* initialization */
var sections = {ns: [], sp: [], ae: [], op: []};
google.load("feeds", "1");

function OnLoad() {
    // Create feed instances
    feeds = {daily_bruin: new google.feeds.Feed("http://dailybruin.com/feed/"), 
             daily_trojan: new google.feeds.Feed("http://feeds.feedburner.com/DailyTrojan-rss/"),
             daily_aztec: new google.feeds.Feed("http://thedailyaztec.com/feed/")};

    for (var feed in feeds) {
        var obj = feeds[feed];
        obj.load(feedLoaded);
    }
}

/* callback when a feed is loaded */
var internal_counter = 0;
function feedLoaded(result) {
    if (!result.error) {
        if (result.feed.entries.length === 0)
            console.log("No entries found for "+result.feed.title+"'s feed!");
        for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            entry.source = result.feed.title;
            if (categorize(entry) === "uncategorized")
                console.log("Article '"+entry.title+"' from "+entry.source+
                " uncategorized. Categories: "+entry.categories.join(', ')+".");
        }
    }
    if (++internal_counter === Object.size(feeds)) {
        build();
    }
}

function categorize(entry) {
    for (var i = 0; i < entry.categories.length; i++) {
        var c = entry.categories[i].toLowerCase();
        switch(c) {
            case "news":
            case "breaking":
                sections.ns.push(entry);
                return "ns";

            case "sports":
                sections.sp.push(entry);
                return "sp";

            case "ae":
            case "lifestyle":
            case "a&amp;e":
            case "arts":
            case "entertainment":
                sections.ae.push(entry);
                return "ae";

            case "opinion":
            case "columns":
                sections.op.push(entry);
                return "op";
        }
    }
    return "uncategorized";
}

/* DOM interface */
function build() {
    var wire = document.getElementById("wire");
    for (var section in sections) {
        var obj = sections[section];
        obj.sort(comparePublishTime);
        var s = document.getElementById(section);
        for (var j = 0; j < obj.length; j++){
            var entry = obj[j];
            
            var article = document.createElement("div");
            article.className = "article";
            s.appendChild(article);
            
            var title_link = document.createElement("a");
            title_link.className = "title";
            title_link.href = entry.link;
            title_link.target = "blank";
            article.appendChild(title_link);
            
            var title = document.createTextNode(entry.title);
            title_link.appendChild(title);
            
            var source_span = document.createElement("span");
            source_span.className = "source";
            article.appendChild(source_span);
            
            var source = document.createTextNode(entry.source);
            source_span.appendChild(source);
            
            var published_span = document.createElement("span");
            article.appendChild(published_span);
            
            var published = document.createTextNode(moment(entry.publishedDate).fromNow());
            published_span.appendChild(published);
        }
    }
}

google.setOnLoadCallback(OnLoad);