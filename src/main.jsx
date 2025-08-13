import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import usePokemons from './PokeSelect.jsx';
import "nes.css/css/nes.min.css";
import './styles/board.css'
import './styles/cards.css'
import './styles/score-sheet.css'
import './styles/general.css'
import CardBack from './assets/card-back.svg'
import Bill from './assets/bill.jpeg'

function PokemonApp() {
  const { pokemons, getRandomPokemons, setPokemons } = usePokemons();
  const[displayPokemons, setDisplayPokemons] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameData, setGameData] = useState({
    cardsClicked: [],
    win: false,
    currentScore: 0,
    bestScore: 0,
    level: 1,
    messageLibrary: ["So far, so good!",
                     "Looks like you chose the same Pokemon twice! I've updated your scores. You can try again!",
                     "Nice job! I'll have to make this a little harder.",
                     "Let's see if you can choose all the unique pokemon!"],
    displayMessage: "Let's see if you can choose all the unique pokemon!"
  });

  useEffect(() => {
    async function initializeGame() {
      const initialPokemons = await getRandomPokemons(gameData.level + 4);
      setPokemons(initialPokemons);
      setDisplayPokemons(shuffle(initialPokemons));
    }
    initializeGame();
  }, [gameData.level]);

  const handleGameReset = async (isWin = false) => {

    const nextLevel = isWin ? gameData.level + 1 : 1;
    const newBestScore = Math.max(gameData.currentScore, gameData.bestScore);
    const newCurrentScore = isWin ? gameData.currentScore + 1 : 0;

    setIsAnimating(true);

    const initialPokemons = await getRandomPokemons(nextLevel + 4);

    setTimeout(() => {
      setPokemons(initialPokemons);
      setDisplayPokemons(shuffle(initialPokemons));
      setIsAnimating(false);
      setGameData(prevData => ({
        ...prevData,
        cardsClicked: [],
        currentScore: newCurrentScore,
        level: nextLevel,
        bestScore: newBestScore,
        displayMessage: isWin ? prevData.messageLibrary[2] : prevData.messageLibrary[1],
        win: isWin,
      }));
    }, 600);
  };

  function shuffle(array) {
    const arrayCopy = [...array];
    let newOrder = [];
    while (arrayCopy.length != 0) {
      let randomIndex = Math.floor(Math.random() * arrayCopy.length)
      let randomPokemon = arrayCopy[randomIndex];
      newOrder.push(randomPokemon);
      arrayCopy.splice(randomIndex, 1);
    }
    return newOrder;
  }

  useEffect(() => {
    let charIndex = -1;
    const fullText = gameData.displayMessage;
    const typingSpeed = 50;

    setTypedMessage("");

    const typingInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        setTypedMessage(prevTypedMessage => prevTypedMessage + fullText.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [gameData.displayMessage]);


  function userSelection(id) {
    if (isAnimating) {
      return;
    }

    if (gameData.cardsClicked.includes(id)) {
      handleGameReset(false);
      return;
    }

    setGameData(prevGameData => {
        const newCardsClicked = [...prevGameData.cardsClicked, id];
        const newCurrentScore = prevGameData.currentScore + 1;

        if (newCardsClicked.length === pokemons.length) {
          handleGameReset(true);
          return {
            ...prevGameData,
            win: true,
            currentScore: newCurrentScore,
            bestScore: Math.max(newCurrentScore, prevGameData.bestScore),
            displayMessage: prevGameData.messageLibrary[2]
          };
        } else {
          setIsAnimating(true);
          setTimeout(() => {
            setDisplayPokemons(shuffle(pokemons));
            setTimeout(() => {
              setIsAnimating(false);
            }, 600);
          }, 600);
          return {
            ...prevGameData,
            cardsClicked: newCardsClicked,
            currentScore: newCurrentScore,
            displayMessage: prevGameData.messageLibrary[0]
          };
        }
    });
  }

  return (
    <div>
      <span id='game-title' className="nes-text is-error"><i className="nes-pokeball"></i>Bill's Pokemon Safari Challenge!<i class="nes-pokeball"></i></span>
      <div id='score-card'>
        <div id='score-container'>
          <p id='level' className='game-header nes-container is-dark is-rounded is-centered'>Level: {gameData.level}</p>
          <p id='current-score' className='game-header nes-container is-dark is-rounded is-centered'>Current Score: {gameData.currentScore}</p>
          <p id='best-score' className='game-header nes-container is-dark is-rounded is-centered'>Best Score: {gameData.bestScore}</p>
        </div>
        <div id='message-container'>
          <img id='bill' src={Bill}/>
          <p id='game-message' className='game-header nes-container is-dark is-rounded' >{typedMessage}</p>
        </div>
      </div>
      <div id='game-container'>
        <div id='card-grid-container'>
          {displayPokemons.map((pokemon) => (
            <div className={`card-container ${isAnimating ? 'is-flipped' : ''}`} key={pokemon.id} onClick={() => userSelection(pokemon.id)}>
              <div className='flip-card-container'>
                <div className='card-front-container'>
                  <img src={pokemon.image} className='card-front-image'/>
                </div>
                <div className='card-back-container'>
                  <img src={CardBack} alt='card back' className='card-back-image'/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PokemonApp />
  </StrictMode>
);
