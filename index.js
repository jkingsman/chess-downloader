let username;

const download = (filename, text) => {
  let element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

//Checks if the username has Lichess account (True or false is returned)

const doesLichessUserExist = async (username) => {
  const result = await fetch(`https://lichess.org/api/games/user/${username}`, {
    method: "HEAD",
  });
  if (!result.ok) {
    console.log("This user does not have a Lichess account");
  } else {
    return result.ok;
  }
};

//Checks if the username has a chess.com account (True or false is returned)
const doesChesscomUserExist = async (username) => {
  const result = await fetch(`https://api.chess.com/pub/player/${username}`, {
    method: "HEAD",
  });
  if (!result.ok) {
    console.log("This user does not have a Chess.com account");
  } else {
    return result.ok;
  }
};

const validateUsername = async () => {
  username = document.getElementById("username").value;
  let lichess_button = document.getElementById("lichess");
  let chesscom_button = document.getElementById("chesscom");
  let no_Input = document.getElementById("noInput");
  let userNotFound = document.getElementById("userNotFound");
  let lichessUserExists = true;
  let chesscomUserExists = true;
  username = username.replace(/\s/g, "");

  if (!username) {
    no_Input.classList.remove("hidden");
    userNotFound.classList.add("hidden");
    lichess_button.classList.add("hidden");
    chesscom_button.classList.add("hidden");

    return;
  } else {
    no_Input.classList.add("hidden");
  }

  if (await doesLichessUserExist(username)) {
    lichess_button.classList.remove("hidden");
    userNotFound.classList.add("hidden");
  } else {
    lichess_button.classList.add("hidden");
    lichessUserExists = false;
  }

  if (await doesChesscomUserExist(username)) {
    chesscom_button.classList.remove("hidden");
    userNotFound.classList.add("hidden");
  } else {
    chesscom_button.classList.add("hidden");
    chesscomUserExists = false;
  }

  if (!lichessUserExists && !chesscomUserExists) {
    userNotFound.classList.remove("hidden");
  }
};

let loader = document.getElementById("loader");

const downloadLichess = async () => {
  loader.classList.remove("hidden");
  let lichess_games = await (
    await fetch(`https://lichess.org/api/games/user/${username}`)
  ).text();

  const filename = `${username}_lichess_${new Date()
    .toISOString()
    .slice(0, 10)}.pgn`;
  download(filename, lichess_games);
  loader.classList.add("hidden");
};

const downloadChessCom = async () => {
  loader.classList.remove("hidden");
  let game_index_json = await (
    await fetch(`https://api.chess.com/pub/player/${username}/games/archives`)
  ).json();

  let games = [];
  current_page = 1;
  for (const game_page of game_index_json.archives) {
    let game_page_json = await (await fetch(game_page)).json();

    games = games.concat(game_page_json.games.map((game) => game.pgn));
    current_page++;
  }

  const filename = `${username}_chess.com_${new Date()
    .toISOString()
    .slice(0, 10)}.pgn`;
  download(filename, games.join("\n"));
  loader.classList.add("hidden");
};

document.getElementById("username").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    validateUsername();
  }
});
document.getElementById("load").addEventListener("click", validateUsername);
document.getElementById("chesscom").addEventListener("click", downloadChessCom);
document.getElementById("lichess").addEventListener("click", downloadLichess);
