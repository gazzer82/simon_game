







/*
//JQuery Bits
$(document).ready(function(){
  setWindow();
  $(window).resize(function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setWindow(), 100);
  });
  $('.simonButton').click(function(){
    buttonClicked(this);
  });
  $('#startStop').click(function(){
    startStop(this);
  });
  $('#strict').click(function(){
    toggleStrict(this);
  });
});
//Main JS Stuff

//All our variables - Thanks Hoisting!
var running = false;
var strict = false;
var gameArray = [];
var userArray = [];
var demoIndex = 0;
var userIndex = 0;
var mode = 'none'; //Can be none, demo, or user
var limit = 1; //How many steps through are we

//Set time to our slowest value
var timerSpeed = 2000;

//Window resize time
var resizeTimer;
var demoLoopTimer;
var buttonOffTimer;

//Generic set window function

function setWindow(){
  var height = $('.button').width();
  $('.button').height(height);
}

function buttonClicked(button){
  userFlashButton(button.id);
  if(testButton(button)){
    console.log('correct move');
    userIndex ++;
    console.log('userIndex = ' + userIndex);
    console.log('limit = ' + limit);
    if(userIndex === limit){
      limit ++;
      demoMoves();
    }
  } else {
    console.log('error');
  }
}

function startStop(button){
  running  = !running;
  console.log('running = ' + running);
  generateMoves();
}

function toggleStrict(button){
  strict = !strict;
  console.log('strict ' + strict);
}

function generateMoves(){
  gameArray = [];
  userIndex = 0;
  demoIndex = 0;
  for(var i=0; i<20; i++){
    gameArray.push(Math.floor(Math.random()*4)+1);
  }
  mode = 'demo';
  demoMoves(2);
}

function demoMoves(){
  console.log('demo start');
  if(demoIndex < limit){
    demoFlashButton(gameArray[demoIndex]);
    demoIndex ++;
    demoLoopTimer = setTimeout(demoMoves, timerSpeed);
  } else {
    demoIndex = 0;
  }
}

function demoFlashButton(button){
  $('#'+button).addClass('button-active');
  buttonOffTimer = setTimeout(resetButtons, timerSpeed * .75);
}

function userFlashButton(button){
  $('#'+button).addClass('button-active');
  buttonOffTimer = setTimeout(resetButtons, 300);
}

function resetButtons(){
  $('.simonButton').removeClass('button-active');
}

function testButton(button){
  console.log(typeof button.id);
  console.log(typeof gameArray[userIndex]);
  return (gameArray[userIndex] === parseInt(button.id,10));
}*/