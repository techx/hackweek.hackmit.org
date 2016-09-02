// Hackweek Schedule
// @author Anthony Liu
// @date 2016/09/01

var HackweekSchedule = (function() {
  'use strict';

  // config
  var containerSel = '#container';
  
  function initHackweekSchedule() {
    var container = $(containerSel);
    SCHEDULE.forEach(function(day) {
      container.append('<b>' + day.date + '</b>');

      var date = day.date;
      day.items.forEach(function(item) {
        var div = document.createElement('div');
        div.innerHTML = item.title;
        container.append(div);
      });

      container.append('<br>');
    });
  }

  return {
    init: initHackweekSchedule
  };
})();

window.addEventListener('load', HackweekSchedule.init);
