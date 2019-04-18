var currentBlank, totalBlanks, answered;

var iQuestion = -1;
var questions = [];

$(document).ready(function() {
    var topic = window.location.href.split("/").pop();
    $.get("/api/questions/topic/" + topic, function(data) {
        questions = data;
        nextQuestion();
    });
});

$("#answerButtons").on("click", ".buttonGuess", function() {
    if(parseInt($(this).attr("data-correctAnswerIndex")) === parseInt(currentBlank)) {
        // Answer was correct
        correctAnswer($(this));
    }
});

$("#questionText").on("click", ".questionBlank", function() {
    selectBlank($(this).attr("data-index"));
});

$("#skip").on("click", function() {
    nextQuestion();
});

function nextQuestion() {
    currentBlank = 0;
    totalBlanks = 0;
    answered = [];

    $("#skip").text("Skip");
    iQuestion++;
    displayQuestion(questions[iQuestion]);
    convertBlanksToSpans();
    selectBlank(currentBlank);
}

function displayQuestion(questionInfo) {
    $("#questionText").text(questionInfo.text);
    
    $("#answerButtons").empty();
    questionInfo.Answers.forEach(function(answer) {
        var newBtn = $("<button>");
        newBtn.addClass("btn btn-info buttonGuess");
        newBtn.text(answer.text);
        newBtn.attr("data-correctAnswerIndex", answer.correctAnswerIndex);
        $("#answerButtons").append(newBtn);
    });
}

function convertBlanksToSpans() {
    var questionHtml = $("#questionText").html();
    var token = "????";
    var iToken = questionHtml.indexOf(token, 0);
    var iBlank = 0;

    while(iToken >= 0) {
        // Create span tag strings
        var spanOpen = "<span class='questionBlank' data-index=" + iBlank + ">";
        var spanClose = "</span>";

        // Add the span to the question HTML
        questionHtml =
            questionHtml.substring(0, iToken)
            + spanOpen
            + questionHtml.substring(iToken, iToken + token.length)
            + spanClose
            + questionHtml.substring(iToken + token.length);
        $("#questionText").html(questionHtml);

        // Get the index of the next blank
        iToken = questionHtml.indexOf(token, iToken + spanOpen.length + token.length + spanClose.length);
        answered.push(false);
        iBlank++;
    }

    // Store the total number of blanks in the question
    totalBlanks = iBlank;
}

function selectBlank(iSpan) {
    // Change the previous blank if it was unanswered
    if(!answered[currentBlank]) {
        var prevSpan = $("#questionText").find("[data-index='" + currentBlank + "']");
        prevSpan.removeClass("questionBlankSelected").addClass("questionBlank");
    }

    // Store the index of the blank we are selecting
    currentBlank = iSpan;

    // Change the colors to show which blank is selected
    var selectedSpan = $("#questionText").find("[data-index='" + currentBlank + "']");
    selectedSpan.removeClass("questionBlank").addClass("questionBlankSelected");
}

function selectNextBlank() {
    currentBlank++;
    if(currentBlank < totalBlanks) {
        // Get the next blank
        selectBlank(currentBlank);
    } else {
        // Go back to beginning to find unanswered blanks
        var nextBlank = answered.findIndex(function(answer) { return answer === false; });
        if(nextBlank >= 0) {
            selectBlank(nextBlank);
        } else {
            // No more blanks, question is complete
            $("#skip").text("Next");
            $("#answerButtons").empty();
        }
    }
}

function correctAnswer(button) {
    answered[currentBlank] = true;

    // Replace the span text with the correct answer
    var correctSpan = $("#questionText").find("[data-index='" + currentBlank + "']");
    correctSpan.removeClass("questionBlankSelected").addClass("questionBlankCorrect");
    correctSpan.text(button.text());

    // Remove the button that was clicked
    button.remove();

    // Highlight the next blank
    selectNextBlank();
}