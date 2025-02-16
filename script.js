async function getTypeRelations(types) {
    let weaknesses = new Set();
    let resistances = new Set();
    let immunities = new Set();

    for (const type of types) {
        const typeUrl = `https://pokeapi.co/api/v2/type/${type}`;
        const response = await fetch(typeUrl);
        const data = await response.json();

        data.damage_relations.double_damage_from.forEach(t => weaknesses.add(t.name));
        data.damage_relations.half_damage_from.forEach(t => resistances.add(t.name));
        data.damage_relations.no_damage_from.forEach(t => immunities.add(t.name));
    }

    weaknesses = [...weaknesses].filter(w => !resistances.has(w) && !immunities.has(w));

    return { weaknesses, resistances: [...resistances], immunities: [...immunities] };
}

async function searchPokemon() {
    const name = document.getElementById("pokemonName").value.toLowerCase();
    const url = `https://pokeapi.co/api/v2/pokemon/${name}`;

    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("pokemonInfo").classList.add("hidden");

    try {
        const response = await fetch(url);
        if (!response.ok) {
            alert("Pokémon não encontrado!");
            document.getElementById("loading").classList.add("hidden");
            return;
        }

        const data = await response.json();

        document.getElementById("pokeName").innerText = data.name;
        document.getElementById("pokeId").innerText = data.id;
        document.getElementById("pokeType").innerText = data.types.map(t => t.type.name).join(", ");
        document.getElementById("pokeHeight").innerText = (data.height / 10).toFixed(1);
        document.getElementById("pokeWeight").innerText = (data.weight / 10).toFixed(1);
        document.getElementById("pokeAbilities").innerText = data.abilities.map(a => a.ability.name).join(", ");

        // Adicionar estatísticas (HP, ataque, defesa, etc.)
        const statsList = document.getElementById("pokeStats");
        statsList.innerHTML = "";
        data.stats.forEach(stat => {
            const li = document.createElement("li");
            li.textContent = `${stat.stat.name}: ${stat.base_stat}`;
            statsList.appendChild(li);
        });
        

        const types = data.types.map(t => t.type.name);
        const { weaknesses, resistances, immunities } = await getTypeRelations(types);

        document.getElementById("pokeWeaknesses").innerText = weaknesses.join(", ") || "Nenhuma";
        document.getElementById("pokeResistances").innerText = resistances.join(", ") || "Nenhuma";
        document.getElementById("pokeImmunities").innerText = immunities.join(", ") || "Nenhuma";

        document.getElementById("pokemonImage").src = data.sprites.other["official-artwork"].front_default;
        document.getElementById("pokemonInfo").classList.remove("hidden");

        document.querySelectorAll("ul li").forEach(item => {
            item.textContent = item.textContent
                .split("-")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
        });
    } catch (error) {
        alert("Erro ao buscar Pokémon!");
    } finally {
        document.getElementById("loading").classList.add("hidden");
    }
}

// Função para adicionar Pokémon aos favoritos
function addToFavorites() {
    const name = document.getElementById("pokeName").innerText;
    const imageUrl = document.getElementById("pokemonImage").src;
    if (!name) return;

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (!favorites.some(pokemon => pokemon.name === name)) {
        favorites.push({ name, imageUrl });
        localStorage.setItem("favorites", JSON.stringify(favorites));
        updateFavorites();

    } else {
        alert("Este Pokémon já está nos favoritos!");
    }
}

// Função para atualizar a lista de favoritos
function updateFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const list = document.getElementById("favoritesList");
    list.innerHTML = ""; // Limpa a lista antes de atualizar

    favorites.forEach(pokemon => {
        const li = document.createElement("li");
        li.classList.add("favorite-item");

        const img = document.createElement("img");
        img.src = pokemon.imageUrl;
        img.alt = pokemon.name;

        const span = document.createElement("span");
        span.textContent = pokemon.name;

        const removeButton = document.createElement("button");
        removeButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        removeButton.onclick = () => removeFavorite(pokemon.name);

        li.appendChild(img);
        li.appendChild(span);
        li.appendChild(removeButton);
        list.appendChild(li);
    });
}

// Função para remover um favorito
function removeFavorite(name) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(pokemon => pokemon.name !== name);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavorites();
}

// Atualiza a lista de favoritos ao carregar a página
document.addEventListener("DOMContentLoaded", updateFavorites);
