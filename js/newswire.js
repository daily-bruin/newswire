//vanilla js

/* utility functions */
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function comparePublishTime(a,b) {
    a = new Date(a.publishedDate);
    b = new Date(b.publishedDate);
    if (a > b)
        return -1;
    if (a < b)
        return 1;
    return 0;
}

function daysBeforeNow(date_string) {
    var day = new Date(date_string);
    if (isNaN(day.valueOf())) {
        console.log("Invalid date!");
        return;
    }
    var today = new Date();
    var diff_in_milliseconds = today - day;
    var diff_in_days = diff_in_milliseconds/(1000*60*60*24);
    return diff_in_days;
}

/* initialization */
var sections = {ns: [], sp: [], ae: [], op: []};
google.load("feeds", "1");

function OnLoad() {
    // Create feed instances
    feeds = {daily_bruin: new google.feeds.Feed("http://dailybruin.com/feed/"), 
             daily_trojan: new google.feeds.Feed("http://feeds.feedburner.com/DailyTrojan-rss/"),
             daily_aztec: new google.feeds.Feed("http://thedailyaztec.com/feed/"),
             daily_cal: new google.feeds.Feed("http://dailycal.org/feed/"),
             daily_49er: new google.feeds.Feed("http://www.daily49er.com/feed/"),
             daily_sundial: new google.feeds.Feed("http://feeds.feedburner.com/dailysundial/"),
             the_aggie: new google.feeds.Feed("http://www.theaggie.org/feed/"),
             the_collegian: new google.feeds.Feed("http://collegian.csufresno.edu/feed/"),
            };

    for (var feed in feeds) {
        var obj = feeds[feed];
        obj.includeHistoricalEntries(); //show historical entries no longer in xml
        obj.setNumEntries(30);
        obj.load(feedLoaded);
    }
}

/* callback when a feed is loaded */
var internal_counter = 0;
var total_uncategorized = 0;
function feedLoaded(result) {
    if (!result.error) {
        if (result.feed.entries.length === 0)
            console.log("No entries found for "+result.feed.title+"'s feed!");
        for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            if (daysBeforeNow(entry.publishedDate) > 15) {
                break;
            }
            entry.source = result.feed.title;
            if (categorize(entry) === "uncategorized") {
                console.log("\""+entry.title+"\" from "+entry.source+
                " was not categorized. Categories: "+entry.categories.join(', '));
                total_uncategorized++;
            }
        }
    }
    if (++internal_counter === Object.size(feeds)) {
        build();
    }
}

/* crude way of determining feed categorization */
function categorize(entry) {
    for (var i = 0; i < entry.categories.length; i++) {
        var c = entry.categories[i].toLowerCase();
        switch(c) {
            case "news":
            case "breaking":
            case "crime":
            case "campus":
            case "ucpd":
            case "city":
            case "breaking news":
            case "research":
            case "research &amp; ideas":
                sections.ns.push(entry);
                return "ns";

            case "sports":
            case "football":
                sections.sp.push(entry);
                return "sp";

            case "ae":
            case "lifestyle":
            case "a&amp;e":
            case "arts":
            case "entertainment":
            case "arts &amp; entertainment":
            case "restaurants":
            case "spotlight":
            case "life &amp; style":
            case "science &amp; technology":
                sections.ae.push(entry);
                return "ae";

            case "opinion":
            case "columns":
            case "editorial":
            case "editorials":
            case "editorial cartoons":
            case "opinions":
                sections.op.push(entry);
                return "op";
        }
    }
    return "uncategorized";
}

/* DOM interface */
function build() {
    console.log(total_uncategorized+" uncategorized articles");
    var wire = document.getElementById("wire");
    for (var section in sections) {
        var obj = sections[section];
        var s = document.getElementById(section);
        
        if (obj.length === 0) {
            var info_span = document.createElement("span");
            info_span.className = "info";
            s.appendChild(info_span);
            
            var info = document.createTextNode("There are no stories to display in this section right now.");
            info_span.appendChild(info);
        }
        
        else {
            obj.sort(comparePublishTime);
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
                published_span.className = "published";
                article.appendChild(published_span);
                
                var published = document.createTextNode(moment(entry.publishedDate).fromNow());
                published_span.appendChild(published);
                
                var snippet_span = document.createElement("span");
                snippet_span.className = "snippet";
                snippet_span.innerHTML = entry.contentSnippet;
                //using innerHTML here instead of createTextNode because of character encoding
                article.appendChild(snippet_span);
            }
        }
    }
}

google.setOnLoadCallback(OnLoad);