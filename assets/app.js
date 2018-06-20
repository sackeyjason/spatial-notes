var notes = [
  {
    text: "Hello",
    x: 100,
    y: 50
  }, {
    text: "World!<br><br>With the mouse, click and drag the background to pan the view.",
    x: 150,
    y: 100
  },
  {
    text: "Drag cards to move them. Double-click them to edit the text. Press 'N' to made new cards (Bug warning! This essential feature is incomplete!)", x: 80, y: 230
  }
];
var notesById = {};

// scroll
var currentPosition = [0,0];
var cardTemplate = _.template('<div class="card" draggable="true" id="card-<%= id %>" data-card-id="<%= id %>" style="left: <%= x %>px; top: <%= y %>px; z-index: <%= deriveZ(x, y) %>"><p><%= text %></div>');

function closest(q, el) {
  if (el.matches(q)) return el;
  if (el.matches(':root')) return undefined;
  return closest(q, el.parentElement);
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
  var positionShift = [0,0];
  var newPos = [0,0];
  var spaceEl = document.querySelector('.space');

  // add physics, inertia effect
  
  el.addEventListener('mousedown', function (e) {
    if (closest('.card', e.target)) {
      e.stopPropagation();
      return false;
    }
    isGrabbed = true;
    positionShift = [0,0];
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
      var p = window.prompt('Edit', notesById[id].text);
      if (p || p === '') {
        notesById[id].text = p;
        card.children[0].textContent = p;
      }
    }
  });
  
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
