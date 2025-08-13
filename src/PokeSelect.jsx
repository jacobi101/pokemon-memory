import { useState } from "react";
import uniqid from "uniqid";

export default function usePokemons() {
  const [pokemons, setPokemons] = useState([]);
  const POSSIBLE_POKEMONS = 493; // Gen 6: 721

  const getPokemon = async ({ id }) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const { name, sprites } = await res.json();
    const image = sprites["front_default"];
    return { name, image, id };
  };
  const getRandomPokemons = async (amount) => {
    const pokemonsToShow = [];
    let tries = 0;

    while (pokemonsToShow.length < amount && tries < 100) {
      const randomId = Math.floor(Math.random() * POSSIBLE_POKEMONS) + 1;

      const isDuplicateId = pokemonsToShow.find(({ id }) => id === randomId);
      if (isDuplicateId) tries++;
      else pokemonsToShow.push({ id: randomId});
    }

    return await Promise.all(pokemonsToShow.map(getPokemon));
  };

  function shufflePokemons() {
    const availableCards = [...pokemons];
    const shuffledPokemons = [];
    while (availableCards.length) {
      const index = Math.floor(Math.random() * availableCards.length);
      const card = availableCards[index];
      // Need to give a new key/uniqid for react to detect a rerender
      card.id = uniqid();
      shuffledPokemons.push(card);
      availableCards.splice(index, 1);
    }
    setPokemons(shuffledPokemons);
  }

  return { pokemons, getRandomPokemons, shufflePokemons, setPokemons };
}