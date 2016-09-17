// Hackweek Schedule
// @author Anthony Liu
// @date 2016/09/08
// @version 1.0

var HackweekSchedule = (function() {
  'use strict';

  // config
  var containerSel = '#container';
  
  function initHackweekSchedule() {
    var container = $(containerSel);

    var firstTime = SCHEDULE.reduce(function(overallMin, day) {
      return Math.min(overallMin, day.items.reduce(
        function(dayMin, item) {
          return Math.min(dayMin, item.start); 
        },
        Infinity
      ));
    }, Infinity);

    SCHEDULE.forEach(function(day) {
      container.append(getDayHtml(firstTime, day));
    });

    var clear = document.createElement('div');
    clear.className = 'clear';
    container.append(clear);
  }

  function getDayHtml(firstTime, day) {
    var div = document.createElement('div');
    div.className = 'day';
    div.appendChild(getDateHtml(day.date));

    div.appendChild(getTimesHtml(firstTime, day.items));
    div.appendChild(
      getEventsHtml(firstTime, day.date, day.items)
    );
    return div;
  }

  function getDateHtml(date) {
    var div = document.createElement('div');
    div.className = 'date';
    div.innerHTML = getDate(date);
    return div;
  }

  function getTimesHtml(firstTime, items) {
    var hoursToShow = items.reduce(function(carry, item) {
      return carry.concat([item.start, item.end]);
    }, []).sort().reduce(function(carry, item) {
      if (carry[1] !== item) {
        carry[0] = carry[0].concat([item]);
        carry[1] = item;
      }
      return carry;
    }, [[], false])[0];
    var pseudoItems = [];
    for (var i = 0; i < hoursToShow.length - 1; i++) {
      pseudoItems.push({
        start: hoursToShow[i],
        end: hoursToShow[i+1]
      });
    }

    var times = document.createElement('div');
    times.className = 'times';
    if (hoursToShow.length > 0) {
      var lastEndTime = firstTime;
      for (var i = 0; i < pseudoItems.length; i++) {
        var item = pseudoItems[i];
        var downTime = item.start - lastEndTime;
        var wasDownTime = downTime > 0;
        for (var time = downTime; time > 0; time -= 0.5) {
          var empty = time > 0.5 ? ' empty' : '';
          var space = document.createElement('div');
          space.className = 'half-hour' + empty + ' block';
          space.innerHTML = '&nbsp;';
          times.appendChild(space);
        }

        var wasFirstItem = i === 0;
        times.appendChild(
          getTimeHtml(wasDownTime, wasFirstItem, item)
        );

        lastEndTime = item.end;
      }

      var clear = document.createElement('div');
      clear.className = 'clear';
      times.appendChild(clear);
    }
    return times;
  }

  function getEventsHtml(firstTime, date, items) {
    // identify conflicts and split into separate lists
    var itemLists = resolveConflicts(items);

    // combine the item lists
    var div = document.createElement('div');
    itemLists.forEach(function(itemList) {
      div.appendChild(
        getNonconflictingEventsHtml(firstTime, date, itemList)
      );
    });

    return div;
  }

  function resolveConflicts(items) {
    var itemLists = [];

    for (var i = 0; i < items.length; i++) {
      var firstCompatibleList = getConsistentList(
        itemLists, items[i]
      );
      if (firstCompatibleList === -1) {
        itemLists.push([]);
        firstCompatibleList = itemLists.length - 1;
      } 
      itemLists[firstCompatibleList].push(items[i]);
    }

    return itemLists;
  }

  function getConsistentList(itemLists, item) {
    for (var i = 0; i < itemLists.length; i++) {
      if (isConsistent(itemLists[i], item)) {
        return i;
      }
    }

    return -1;
  }

  function isConsistent(itemList, item) {
    for (var i = 0; i < itemList.length; i++) {
      if (eventsCoincide(itemList[i], item)) {
        return false;
      }
    }

    return true;
  }

  function eventsCoincide(a, b) {
    return !(a.end <= b.start || a.start >= b.end);
  }

  function getNonconflictingEventsHtml(firstTime, date, items) {
    var events = document.createElement('div');
    events.className = 'infos';
    if (items.length > 0) {
      var lastEndTime = firstTime;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var downTime = item.start - lastEndTime;
        var wasDownTime = downTime > 0;
        for (var time = downTime; time > 0; time -= 0.5) {
          var space = document.createElement('div');
          space.className = 'half-hour block';
          space.innerHTML = '&nbsp;';
          events.appendChild(space);
        }

        var wasFirstItem = i === 0;
        events.appendChild(
          getEventHtml(date, item)
        );

        lastEndTime = item.end;
      }

      var clear = document.createElement('div');
      clear.className = 'clear';
      events.appendChild(clear);
    }
    return events;
  }

  function getTimeHtml(wasDownTime, wasFirstItem, item) {
    var duration = item.end - item.start;
    var durationClass = getClassFromDuration(duration);

    var div = document.createElement('div');
    div.className = durationClass + ' block';

    var left = document.createElement('span');
    left.className = 'left';
    left.innerHTML = (wasDownTime || wasFirstItem) ? getTime(item.start) : '';

    var right = document.createElement('span');
    right.className = 'right';
    right.innerHTML = getTime(item.end);

    div.appendChild(left);
    div.appendChild(right);
  
    return div;
  }

  function getEventHtml(date, item) {
    var duration = item.end - item.start;
    var durationClass = getClassFromDuration(duration);

    var div = document.createElement('div');
    var type = ({
      'talk': 'talk',
      'workshop': 'workshop',
      'lightning': 'lightning',
      'social': 'social'
    })[item.type];
    div.className = durationClass + ' ' + type + ' event';
    
    var title = document.createElement('div');
    title.className = 'title';
    title.innerHTML = item.title;

    var loc = document.createElement('div');
    loc.className = 'location';
    loc.innerHTML = item.location;

    var mobile = document.createElement('div');
    mobile.className = 'mobile';
    mobile.innerHTML = getTime(item.start) + ' - ' + getTime(item.end) + ' in ' + item.location;

    var people = document.createElement('i');
    var smallPeople = document.createElement('small');
    smallPeople.innerHTML = item.people.join(', ');
    people.appendChild(smallPeople);

    div.appendChild(title);
    div.appendChild(loc);
    div.appendChild(mobile);
    div.appendChild(people);

    div.addEventListener('click', function() {
      getModal(date, item).show();
    });

    return div;
  }

  function getClassFromDuration(duration) {
    var durations = {
      '0.5': 'half-hour',
      '1': 'one-hour',
      '1.5': 'one-and-a-half-hour',
      '2': 'two-hour',
    };
    return durations[duration.toString()];
  }

  function getModal(date, item) {
    var formattedDate = getDate(date);
    var content = '<small>' + formattedDate + ', <b>';
    content += getTime(item.start) + '-';
    content += getTime(item.end) + '</b> in <b>' + item.location;
    content += '</b></small>';
    content += '<br><b><a href="'+ item.fblink +'">' + item.title + ' [' + item.type + ']</a></b>';

    if ('people' in item && item.people.length > 0) {
      content += '<br><small><i>' + item.people.join(', ') + '</i></small>';
    }

    if ('description' in item && item.description.length > 0) {
      content += '<br>' + (item.description ? item.description : '');
    }

    return picoModal({
      content: content,
      modalStyles: function(styles) {
        styles.background = '#fffefa';
        styles.color = '#0b3b4b';
        styles.fontFamily = 'Lato';
        styles.width = '80%';
        styles.opacity = 0;
        return styles;
      },
      overlayStyles: function(styles) {
        styles.opacity = 0;
        return styles;
      },
      closeStyles: function(styles) {
        styles.outline = 'none';
        styles.background = 'transparent';
        return styles;
      }
    }).afterShow(function(modal){
        $(modal.overlayElem()).animate({opacity: .5}, 160);
        $(modal.modalElem()).animate({opacity: 1}, 160);
    }).beforeClose(function(modal, event) {
      event.preventDefault();
      $(modal.overlayElem()).add(modal.modalElem())
          .animate(
              { opacity: 0 },
              { complete: modal.forceClose }
          );
    });
  }

  function getTime(twentyFourHourTime) {
    var num = twentyFourHourTime % 12;
    var hour = Math.floor(num);
    var mins = Math.floor(60 * (num - hour));
    var str = hour;
    if (mins !== 0) {
      str += ':' + mins;
    }
    return str + ((twentyFourHourTime >= 12) ? 'p' : 'a');
  }

  function getDate(date) {
    return moment(date).format('ddd, MMM DD, YYYY');
  }

  return {
    init: initHackweekSchedule
  };
})();

window.addEventListener('load', HackweekSchedule.init);
