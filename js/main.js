// Hackweek Schedule
// @author Anthony Liu
// @date 2016/09/02

var HackweekSchedule = (function() {
  'use strict';

  // config
  var containerSel = '#container';
  
  function initHackweekSchedule() {
    var container = $(containerSel);
    SCHEDULE.forEach(function(day) {
      container.append('<b>' + day.date + '</b>');

      day.items.forEach(function(item) {
        container.append(getDayHtml(day.date, item));
      });

      container.append('<br>');
    });
  }

  function getDayHtml(date, item) {
    var div = document.createElement('div');
    div.innerHTML = item.title;
    return div;
  }

  return {
    init: initHackweekSchedule
  };
})();

window.addEventListener('load', HackweekSchedule.init);
