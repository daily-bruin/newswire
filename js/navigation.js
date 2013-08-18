// jQuery

$(document).ready(function(){
    $('#nav').onePageNav({
        currentClass: 'current',
        changeHash: false,
        scrollSpeed: 400,
        scrollOffset: 50,
        scrollThreshold: 0.4,
        filter: '',
        easing: 'swing',
        begin: function() {
            //I get fired when the animation is starting
        },
        end: function() {
            //I get fired when the animation is ending
        },
        scrollChange: function($currentListItem) {
            //I get fired when you enter a section and I pass the list item of the section
        }
    });
});