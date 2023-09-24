let puzzleData;

function createPuzzle(e) {
  e.preventDefault();

  const form = document.getElementById("create-form");
    var formData = new FormData(form);
    
  var data = encodePuzzle(formData);

  const playLink = document.getElementById("play-link");
    playLink.href = "?p=" + data;
    playLink.classList.toggle("hide");

  navigator.clipboard.writeText(
    window.location.origin + window.location.pathname + "?p=" + data
  );
}

window.onload = () => {
  const form = document.getElementById("create-form");
  form.addEventListener("submit", createPuzzle);

  var queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const puzzleDataEncoded = urlParams.get("p");
    if (puzzleDataEncoded) {
        puzzleData = decodePuzzle(puzzleDataEncoded);
    createPlayButtons(puzzleData);
  }

  setPage(!puzzleData);

  const submitButton = document.getElementById("submit-button");
  submitButton.addEventListener("click", submitGuess);
  
  const deselectButton = document.getElementById("deselect-button")
  deselectButton.addEventListener("click", deselectAll)
};

function setPage(isCreating) {
  const createPage = document.getElementById("create-container");
  const playPage = document.getElementById("play-container");
  if (isCreating) {
    createPage.classList.remove("hide");
    playPage.classList.add("hide");
  } else {
    createPage.classList.add("hide");
    playPage.classList.remove("hide");
  }
}
function encodePuzzle(formData) {
  const connections = [];
  for (let i = 1; i <= 4; i++) {
    const category = formData.get(`category${i}`);
    if (category === null) {
      break;
    }
    const words = [];
    for (let j = 1; j <= 4; j++) {
      words.push(formData.get(`${i}-${j}`));
    }
    connections.push({
      category: category,
      words: words,
    });
  }

  var connectionsJson = JSON.stringify(connections);
  var data = btoa(connectionsJson);
  return data;
}

function decodePuzzle(data) {
  return JSON.parse(atob(data));
}

function createPlayButtons(puzzleDataDecoded) {
  const playDiv = document.getElementById("play");


  const words = puzzleDataDecoded.flatMap((connection) => connection.words);
  shuffle(words);

  words.forEach((word) => {
    let wordButton = document.createElement("div");
    wordButton.classList.add(); // TODO: add class
    wordButton.textContent = word;
    wordButton.classList.add("option-button");
    wordButton.addEventListener("click", toggleWord);
    playDiv.appendChild(wordButton);
  });
}

function toggleWord(event) {
    const clicked = event.target;
    const selectedButtons = Array.from(
      document.getElementsByClassName("selected")
    );
    const alreadySelected = selectedButtons.some((element) =>
      element.isEqualNode(clicked)
    );

    if (!alreadySelected && selectedButtons.length >= 4) {
      return;
    }

    clicked.classList.toggle("selected");
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function submitGuess() {

    const selectedElements = Array.from(document.getElementsByClassName("selected"));
    const selectedWords = selectedElements.map(el => el.textContent);

    const connection = isGuessCorrect(selectedWords, puzzleData);
    if (connection) {
        const connectionNumber = puzzleData.indexOf(connection) + 1;

        console.log("Correct: The connection is " + connection.category);
        selectedElements.forEach(element => {
            element.removeEventListener("click", toggleWord);
            element.classList.remove("selected");
            element.classList.add(`category${connectionNumber}-found`);
        });

    } else {
        console.log("Incorrect Guess");
        deselectAll();
    }
    
}

// guess is an array of 4 guesses
// puzzle data is the decoded puzzle data above
function isGuessCorrect(guess, puzzleData) {
  const guessStr = guess.toSorted().join("-");

  const matchingConnection = puzzleData.find((answer) => {
    return answer.words.toSorted().join("-") === guessStr;
  });

  return matchingConnection;
}


function deselectAll() {
  const selected = Array.from(document.getElementsByClassName("selected"))
  selected.forEach((button) => {button.classList.toggle("selected")})
}