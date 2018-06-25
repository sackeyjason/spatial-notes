var notes = [
  {
    text: "Hello",
    x: 100,
    y: 50
  }, {
    text: "World!\n\nWith the mouse, click and drag the background to pan the view.",
    x: 150,
    y: 100
  },
  {
    text: "Drag cards to move them. Double-click them to edit the text. Press 'N' to made new cards.", x: 80, y: 230
  }
];
var notesById = {};

// scroll
var currentPosition = [0,0];
var cardTemplate = _.template('<div class="card" draggable="true" id="card-<%= id %>" data-card-id="<%= id %>" style="left: <%= x %>px; top: <%= y %>px; z-index: <%= deriveZ(x, y) %>"><p><%= renderText(text) %></div>');

function closest(q, el) {
  if (!el.matches) return undefined;
  if (el.matches(q)) return el;
  if (el.matches(':root')) return undefined;
  return closest(q, el.parentElement);
}

function renderText(text) {
  var output = text.replace(/\n/g, "<br />");
  return output;
}

function deriveZ(x, y) {
  return (y * 1000) + (x * 100);
}

function dragStartCard(e) {
  
}

function makeCard() {
  var newCard = document.createElement('div');
  var newData = {
    text: '',
    x: currentPosition[0] + 10,
    y: currentPosition[1] + 50,
    id: Math.random().toString().slice(2)
  };
  
  newCard.innerHTML = cardTemplate(newData);
  notes.push(newData);
  notesById[newData.id] = newData;
  
  document.querySelector('.space').appendChild(newCard.children[0]);
}

function initDragScroll(el) {
  var isGrabbed = false;
  var holdPoint = [0,0];
  var newPos = [0,0];

  var setHashCoords = _.debounce(function () {
    var h = '#' + el.scrollLeft + ',' + el.scrollTop;
    // account for additional negative space after extension is implemented
    
    console.log(h);
    if(history.pushState) {
      history.pushState(null, null, h);
    }
    else {
        location.hash = h;
    }
  }, 200);

  // add physics, inertia effect
  
  el.addEventListener('mousedown', function (e) {
    if (closest('.card', e.target)) {
      e.stopPropagation();
      return false;
    }
    isGrabbed = true;
    holdPoint = [e.screenX, e.screenY];
    currentPosition = [el.scrollLeft, el.scrollTop];
  });
  el.addEventListener('mousemove', function (e) {
    if (isGrabbed) {
      newPos[0] = currentPosition[0] + (holdPoint[0] - e.screenX);
      newPos[1] = currentPosition[1] + (holdPoint[1] - e.screenY);
      
      el.scrollLeft = newPos[0];
      el.scrollTop = newPos[1];
    }
  });
  el.addEventListener('mouseup', function () {
    isGrabbed = false;
    currentPosition = newPos.slice();
  });
  window.addEventListener('scroll', setHashCoords);
  // todo canvas extension when scrolling at boundary
}

function init () {
  var b = '';
  var dragged;
  var position = [0,0];
  
  // load
  
  notes.forEach(function(c, i) {
    c.id = i;
    b = b + cardTemplate(c);
    notesById[i] = c;
  });
  document.querySelector('.space').innerHTML = b;

  document.addEventListener('mousedown', function (e) {
    var card;
    if (e.target) card = closest('.card', e.target);
    if (card) {
      e.stopPropagation();
    }
  });

  document.addEventListener('dragstart', function (e) {
    var card;
    if (e.target) card = closest('.card', e.target);
    if (card) {
      dragged = card;
      e.dataTransfer.setData('text/plain',null);
      position = [e.screenX, e.screenY];
    }
  }, false);


  document.addEventListener('dragend', function (e) {
    if (e.target.className === 'card') {
      var positionDiff = [e.screenX - position[0], e.screenY - position[1]];
      var left = parseInt(e.target.style.left.split('px')[0]);
      var top = parseInt(e.target.style.top.split('px')[0]);

      var x = left + positionDiff[0];
      var y = top  + positionDiff[1];
      
      e.target.style.left = x + 'px';
      e.target.style.top  = y + 'px';
      e.target.style.zIndex = deriveZ(x, y);
      e.target.style.transform = '';

      dragged = null;
      
      // save
    }
  });

  document.addEventListener('dblclick', function (e) {
    var card;
    if (e.target) {
      card = closest('.card', e.target);
    }
    if (card) {
      var id = card.getAttribute('data-card-id');
      var oldText = notesById[id].text;
      card.children[0].innerHTML = '<textarea rows="5">' + oldText + '</textarea>';
      card.setAttribute('draggable', false);
      card.children[0].children[0].focus();
    }
  });

  document.addEventListener('blur', function (e) {
    var card;
    if (e.target) {
      card = closest('.card', e.target);
    }
    if (card && e.target.matches('textarea')) {
      var id = card.getAttribute('data-card-id');
      var newText = e.target.value;
      notesById[id].text = newText;
      card.setAttribute('draggable', true);
      card.children[0].innerHTML = renderText(newText);
    }
  }, true)
  
  // make new
  document.addEventListener('keydown', function(e) {
    if (e.key === 'n') {
      makeCard();
    }
  });
  
  
  initDragScroll(document.querySelector(':root'));
  
  // !! Accessibility: DOM order, horizontal/vertical ordering
  
}

init();

// Made by Jason Sackey in 2018
// Licence: GPL 3 or MIT or CC0 (pick your favourite)
