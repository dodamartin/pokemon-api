import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [pokemonName, setPokemonName] = useState('');
  const [currentPokemonData, setCurrentPokemonData] = useState(null);
  const [evolutionChain, setEvolutionChain] = useState([]);

  const handleInputChange = (event) => {
    setPokemonName(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      searchPokemon();
    }
  };

  const searchPokemon = () => {
    axios
      .get(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`)
      .then((response) => {
        const currentPokemon = response.data;
        setCurrentPokemonData(currentPokemon);

        axios.get(response.data.species.url)
          .then((speciesResponse) => {
            axios.get(speciesResponse.data.evolution_chain.url)
              .then((evolutionResponse) => {
                const evolutionChainData = traverseEvolutionChain(evolutionResponse.data.chain);
                setEvolutionChain(evolutionChainData);
              })
              .catch((evolutionError) => {
                console.error('Error fetching evolution data:', evolutionError);
              });
          })
          .catch((speciesError) => {
            console.error('Error fetching species data:', speciesError);
          });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const getSpriteUrl = (url) => {
    return url;
  };

  const traverseEvolutionChain = (chain) => {
    const evolutionChain = [];

    const traverse = (evolutionData) => {
      evolutionChain.push({
        name: evolutionData.species.name,
        id: getPokemonId(evolutionData.species.url),
      });

      if (evolutionData.evolves_to && evolutionData.evolves_to.length > 0) {
        evolutionData.evolves_to.forEach((evolution) => {
          traverse(evolution);
        });
      }
    };

    traverse(chain);

    return evolutionChain;
  };

  const getPokemonId = (url) => {
    const match = url.match(/\/(\d+)\//);
    return match ? match[1] : null;
  };

  return (
    <div className="App">
      <header className="Header">
        <h1 className="Title">Pokemon App</h1>
      </header>
      <main className="Main">
        <div className="SearchContainer">
          <input
            className="Input"
            type="text"
            placeholder="Enter Pokémon Name"
            value={pokemonName}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <button className="Button" onClick={searchPokemon}>
            Search
          </button>
        </div>
        {currentPokemonData && (
          <div className="CurrentPokemonInfo">
            <h2 className="PokemonName">{currentPokemonData.name}</h2>
            <img
              className="PokemonImage"
              src={getSpriteUrl(currentPokemonData.sprites.front_default)}
              alt={currentPokemonData.name}
            />
            <div className="Attributes">
              <p className="Attribute">Height: {currentPokemonData.height}</p>
              <p className="Attribute">Weight: {currentPokemonData.weight}</p>
            </div>
            <p className="AbilitiesTitle">Abilities:</p>
            <ul className="AbilitiesList">
              {currentPokemonData.abilities.map((ability, index) => (
                <li key={index} className="Ability">
                  {ability.ability.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {evolutionChain.length > 0 && (
          <div className="EvolutionChain">
            <h1 className="EvolutionTitle">Pokémon Evolution Chain</h1>
            {evolutionChain.map((pokemon, index) => (
              <div className="PokemonInfo" key={index}>
                <h2 className="PokemonName">{pokemon.name}</h2>
                <img
                  className="PokemonImage"
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                  alt={pokemon.name}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
