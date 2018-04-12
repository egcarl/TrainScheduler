// Initialize Firebase
var config = {
  apiKey: "AIzaSyAGG3c04zK6OJuxs3IUSH0fAmzhS8YbKA8",
  authDomain: "mytrainproject-27cd5.firebaseapp.com",
  databaseURL: "https://mytrainproject-27cd5.firebaseio.com",
  projectId: "mytrainproject-27cd5",
  storageBucket: "",
  messagingSenderId: "844966489940"
};
firebase.initializeApp(config);

var database = firebase.database();

//Initial values
var trainName = "";
var destination = "";
var firstTime = "";
var frequency = 0;
var currentTime = moment();

$("#submitTrain").on("click", function (event) {
  event.preventDefault();

  // Getting the user input
  trainName = $("#nameInput").val().trim();
  destination = $("#destinationInput").val().trim();
  firstTime = $("#startInput").val().trim();
  frequency = $("#frequencyInput").val().trim();
  
  // Doing the maths for the train arrival vs current time
  var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
  var timeDiff = moment().diff(moment(firstTimeConverted), "minutes");
  var timeLeft = timeDiff % frequency;
  var minutesAway = frequency - timeLeft;
  var nextTrain = moment().add(minutesAway, "minutes");
  var nextArrival = moment(nextTrain).format("HH:mm");
  
  // Creating an object to store the variables to push to firebase
  var newTrain = {
    trainName,
    destination,
    firstTime,
    frequency,
    minutesAway,
    nextArrival,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  };
  
  // Pushing the object into firebase
  database.ref().push(newTrain);

  // Clearing user input data
  $("#nameInput").val("");
  $("#destinationInput").val("");
  $("#startInput").val("");
  $("#frequencyInput").val("");

});

// When creating a new entry in firebase, populating the html to show the new child.
database.ref().orderByChild("dateAdded").on("child_added", function (childSnapshot) {

  // Grabbing the values of the new child
  var name = childSnapshot.val().trainName;
  var destination = childSnapshot.val().destination;
  var firstTime = childSnapshot.val().firstTime;
  var frequency = childSnapshot.val().frequency;
  var minutesAway = childSnapshot.val().minutesAway;
  var nextArrival = childSnapshot.val().nextArrival;

  // Appending the values to the respective html columns. Adding the ID of the child from firebase.
  var tr = $(`<tr data-key=${ childSnapshot.key }>`)
  tr.append($("<td>").text(name));
  tr.append($("<td>").text(destination));
  tr.append($("<td>").text(frequency));
  tr.append($("<td>").text(nextArrival));
  tr.append($("<td>").text(minutesAway));

  // Adding delete button to each child row
  tr.append($('<td>').append($('<button class="delete">').text("Delete")))

  $("#trainSchedules").append(tr);
})

// Creating event listener for clicking delete button for the row of specific train and using firebase key as identifier to delete
$(document).on("click", ".delete", function () {
  var tableRow = $(this).parent().parent()
  var key = tableRow.attr("data-key")

  database.ref().child(key).remove()
  tableRow.remove()
})