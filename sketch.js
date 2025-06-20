let model_url = 'https://cdn.jsdelivr.net/gh/sayanx64/ml5-crepe-model/models/pitch-detection/crepe/';
let pitch;
let audioContext;
let mic;
let freq = 0;
let threshold = 1;

let notes = [
  { note: 'A', freq: 440 },
  { note: 'E', freq: 329.63 },
  { note: 'C', freq: 261.63 },
  { note: 'G', freq: 392.00 }
];

function startAudioContext() {
  getAudioContext().resume().then(() => {
    document.getElementById("overlay").style.display = "none";
    console.log("Audio context started");
  });
}

function setup() {
  let canvas = createCanvas(360, 400);
  canvas.parent("sketch-holder");
  textFont('Courier New');

  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(() => {
    pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, () => {
      console.log("Model loaded");
      pitch.getPitch(gotPitch);
    });
  });
}

function gotPitch(error, frequency) {
  if (!error && frequency) {
    freq = frequency;
  }
  pitch.getPitch(gotPitch);
}

function draw() {
  background(20);
  textAlign(CENTER, CENTER);
  fill(255);

  textSize(20);
  text("Frequency:", width / 2, 40);
  textSize(36);
  text(freq.toFixed(2) + " Hz", width / 2, 80);

  let closestNote = getClosestNote(freq);
  textSize(20);
  text("Note:", width / 2, 130);
  textSize(48);
  text(closestNote.note, width / 2, 180);

  let diff = freq - closestNote.freq;
  let isTuned = abs(diff) < threshold;

  rectMode(CENTER);
  stroke(255);
  strokeWeight(1);
  fill(40);
  rect(width / 2, 250, 250, 40);

  let xShift = map(diff, -50, 50, -125, 125);
  xShift = constrain(xShift, -125, 125);

  noStroke();
  fill(isTuned ? '#00ff88' : '#ff4455');
  rect(width / 2 + xShift, 250, 10, 50);

  stroke(255);
  strokeWeight(2);
  line(width / 2, 230, width / 2, 270);
}

function getClosestNote(frequency) {
  let minDiff = Infinity;
  let closest = notes[0];
  for (let note of notes) {
    let d = abs(frequency - note.freq);
    if (d < minDiff) {
      minDiff = d;
      closest = note;
    }
  }
  return closest;
}
