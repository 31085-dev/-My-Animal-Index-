const STORAGE_KEY = "AnimalDex";

let animals = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "[]"
);

let currentAnimal = null;

let currentView = "collection";

let verifiedAnimal = null;


/* =========================================
   DETAILED CATEGORIES
========================================= */

const categories = {

  "Mammals": [
    "Bears",
    "Big Cats",
    "Cats",
    "Wolves",
    "Foxes",
    "Dogs",
    "Otters",
    "Bats",
    "Monkeys",
    "Apes",
    "Lemurs",
    "Deer",
    "Giraffes",
    "Elephants",
    "Rhinos",
    "Horses",
    "Hippos",
    "Pigs",
    "Whales",
    "Dolphins",
    "Seals",
    "Walruses"
  ],

  "Birds": [
    "Eagles",
    "Hawks",
    "Falcons",
    "Owls",
    "Ravens",
    "Crows",
    "Parrots",
    "Macaws",
    "Penguins",
    "Ducks",
    "Geese",
    "Swans",
    "Songbirds"
  ],

  "Reptiles": [
    "Lizards",
    "Geckos",
    "Iguanas",
    "Chameleons",
    "Monitor Lizards",
    "Skinks",
    "Snakes",
    "Boas",
    "Pythons",
    "Vipers",
    "Cobras",
    "Turtles",
    "Tortoises",
    "Sea Turtles",
    "Crocodiles",
    "Alligators"
  ],

  "Amphibians": [
    "Frogs",
    "Toads",
    "Tree Frogs",
    "Salamanders",
    "Newts",
    "Axolotls",
    "Poison Dart Frogs"
  ],

  "Fish": [
    "Sharks",
    "Rays",
    "Skates",
    "Eels",
    "Reef Fish",
    "Freshwater Fish",
    "Deep-Sea Fish"
  ],

  "Arachnids": [
    "Spiders",
    "Tarantulas",
    "Jumping Spiders",
    "Wolf Spiders",
    "Scorpions"
  ],

  "Insects": [
    "Beetles",
    "Ladybugs",
    "Fireflies",
    "Butterflies",
    "Moths",
    "Bees",
    "Wasps",
    "Ants",
    "Dragonflies",
    "Damselflies"
  ],

  "Habitat": [
    "Forest",
    "Rainforest",
    "Desert",
    "Grassland",
    "Tundra",
    "Mountains",
    "Ocean",
    "Freshwater",
    "Wetlands",
    "Caves",
    "Coastlines"
  ],

  "Diet": [
    "Carnivore",
    "Herbivore",
    "Omnivore",
    "Insectivore",
    "Piscivore",
    "Scavenger"
  ],

  "Behavior": [
    "Arboreal",
    "Burrowing",
    "Diurnal",
    "Nocturnal",
    "Migratory",
    "Pack Animal",
    "Solitary",
    "Social"
  ],

  "Special": [
    "Rare",
    "Endangered",
    "Venomous",
    "Poisonous",
    "Bioluminescent",
    "Camouflaged",
    "Extinct",
    "Weird & Unusual"
  ]

};


/* =========================================
   SAVE DATA
========================================= */

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(animals)
  );

}


/* =========================================
   SORT ALPHABETICALLY
========================================= */

function alphabetical(list) {

  return [...list].sort(
    (a,b) =>
      a.name.localeCompare(
        b.name,
        undefined,
        { sensitivity:"base" }
      )
  );

}


/* =========================================
   GET ELEMENT
========================================= */

const $ = id =>
  document.getElementById(id);


/* =========================================
   SIDEBAR
========================================= */

$("menuBtn").onclick = () => {

  $("sidebar").classList.add("open");

  $("overlay").classList.add("show");

};

$("closeSidebar").onclick = closeSidebar;

$("overlay").onclick = closeSidebar;


function closeSidebar() {

  $("sidebar").classList.remove("open");

  $("overlay").classList.remove("show");

}


/* =========================================
   NAVIGATION
========================================= */

document
  .querySelectorAll(".nav-btn")
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll(".nav-btn")
        .forEach(b =>
          b.classList.remove("active")
        );

      button.classList.add("active");

      currentView =
        button.dataset.view;

      closeSidebar();

      render();

    };

  });


/* =========================================
   SEARCH
========================================= */

$("collectionSearch").oninput = render;


/* =========================================
   ADD ANIMAL
========================================= */

$("addAnimalBtn").onclick =
  () => openAnimalForm();


$("closeModal").onclick =
  closeAnimalForm;


$("cancelBtn").onclick =
  closeAnimalForm;


function openAnimalForm(animal=null) {

  currentAnimal = animal;

  $("animalModal")
    .classList.remove("hidden");

  $("animalForm").reset();

  $("verifiedPanel")
    .classList.add("hidden");

  $("verificationStatus")
    .textContent = "";

  $("editId").value =
    animal ? animal.id : "";

  if(animal) {

    $("modalTitle")
      .textContent =
      "EDIT ANIMAL";

    fillForm(animal);

  } else {

    $("modalTitle")
      .textContent =
      "ADD ANIMAL";

  }

  buildCategoryPicker(
    animal?.categories || []
  );

}


function closeAnimalForm() {

  $("animalModal")
    .classList.add("hidden");

}


/* =========================================
   CATEGORY CHECKBOXES
========================================= */

function buildCategoryPicker(
  selected=[]
) {

  $("categoryPicker").innerHTML = "";

  for(
    const [group,list]
    of Object.entries(categories)
  ) {

    const section =
      document.createElement("div");

    section.className =
      "category-group";

    section.innerHTML = `
      <h4>${group}</h4>

      <div class="category-options">

        ${[...list]
          .sort()
          .map(category => `

          <label>

            <input
              type="checkbox"
              value="${category}"
              ${selected.includes(category)
                ? "checked"
                : ""}
            >

            ${category}

          </label>

        `)
        .join("")}

      </div>
    `;

    $("categoryPicker")
      .appendChild(section);

  }

}


/* =========================================
   VERIFY ANIMAL
========================================= */

$("verifyBtn").onclick =
  verifyAnimal;


async function verifyAnimal() {

  const name =
    $("animalName")
      .value
      .trim();

  if(!name) {

    showStatus(
      "error",
      "Enter an animal name first."
    );

    return;

  }


  /* DUPLICATE CHECK */

  const duplicate =
    animals.find(
      animal =>
        animal.name.toLowerCase()
        === name.toLowerCase()
        &&
        animal.id != $("editId").value
    );


  if(duplicate) {

    showStatus(
      "error",
      "That animal is already in your AnimalDex!"
    );

    return;

  }


  $("verifyBtn").disabled = true;

  $("verifyBtn").textContent =
    "SEARCHING...";


  try {

    const response =
      await fetch(
        "https://api.gbif.org/v2/species/match?name="
        +
        encodeURIComponent(name)
      );


    const data =
      await response.json();


    if(
      !data ||
      data.matchType === "NONE"
    ) {

      showStatus(
        "error",
        "I couldn't verify that animal. Check the spelling."
      );

      return;

    }


    verifiedAnimal = data;


    fillVerifiedData(data);


    showStatus(
      "success",
      "✓ Animal verified!"
    );


  }

  catch(error) {

    showStatus(
      "error",
      "The animal database could not be reached."
    );

  }

  finally {

    $("verifyBtn").disabled = false;

    $("verifyBtn").textContent =
      "SEARCH";

  }

}


/* =========================================
   FILL VERIFIED DATA
========================================= */

function fillVerifiedData(data) {

  $("scientificName").value =
    data.scientificName ||
    data.canonicalName ||
    "";

  $("kingdom").value =
    data.kingdom || "";

  $("phylum").value =
    data.phylum || "";

  $("className").value =
    data.class || "";

  $("order").value =
    data.order || "";

  $("family").value =
    data.family || "";

  $("genus").value =
    data.genus || "";

  $("species").value =
    data.species ||
    data.canonicalName ||
    "";


  $("verifiedName").innerHTML = `

    <h2>
      ${data.canonicalName || data.scientificName}
    </h2>

    <p>
      ${data.scientificName || ""}
    </p>

  `;


  $("classificationPreview")
    .innerHTML = `

      <div class="fact">
        <small>KINGDOM</small>
        ${data.kingdom || "Unknown"}
      </div>

      <div class="fact">
        <small>PHYLUM</small>
        ${data.phylum || "Unknown"}
      </div>

      <div class="fact">
        <small>CLASS</small>
        ${data.class || "Unknown"}
      </div>

      <div class="fact">
        <small>ORDER</small>
        ${data.order || "Unknown"}
      </div>

      <div class="fact">
        <small>FAMILY</small>
        ${data.family || "Unknown"}
      </div>

      <div class="fact">
        <small>GENUS</small>
        ${data.genus || "Unknown"}
      </div>

    `;


  $("verifiedPanel")
    .classList.remove("hidden");


  autoCategories(data);

}


/* =========================================
   AUTOMATIC CATEGORIES
========================================= */

function autoCategories(data) {

  const selected = [];

  const family =
    (data.family || "").toLowerCase();

  const order =
    (data.order || "").toLowerCase();

  const className =
    (data.class || "").toLowerCase();


  if(className === "mammalia")
    selected.push("Mammals");

  if(className === "aves")
    selected.push("Birds");

  if(className === "reptilia")
    selected.push("Reptiles");

  if(className === "amphibia")
    selected.push("Amphibians");

  if(className === "insecta")
    selected.push("Insects");

  if(className === "arachnida")
    selected.push("Arachnids");

  if(family === "felidae") {

    selected.push("Cats");
    selected.push("Big Cats");

  }

  if(family === "ursidae")
    selected.push("Bears");

  if(family === "canidae") {

    selected.push("Wolves");
    selected.push("Foxes");

  }

  if(order === "chiroptera")
    selected.push("Bats");

  if(order === "squamata")
    selected.push("Lizards");

  if(order === "anura")
    selected.push("Frogs");

  buildCategoryPicker(
    selected
  );

}


/* =========================================
   STATUS MESSAGE
========================================= */

function showStatus(type,message) {

  const box =
    $("verificationStatus");

  box.textContent = message;

  box.className =
    type === "success"
      ? "status-success"
      : type === "error"
      ? "status-error"
      : "";

}


/* =========================================
   SAVE ANIMAL
========================================= */

$("animalForm").onsubmit =
  saveAnimal;


function saveAnimal(event) {

  event.preventDefault();


  const name =
    $("animalName")
      .value
      .trim();


  if(!verifiedAnimal &&
     !$("editId").value) {

    alert(
      "Please verify the animal first."
    );

    return;

  }


  /* DUPLICATE PROTECTION */

  const duplicate =
    animals.find(
      animal =>
        animal.name.toLowerCase()
        === name.toLowerCase()
        &&
        animal.id != $("editId").value
    );


  if(duplicate) {

    alert(
      "That animal is already in your AnimalDex!"
    );

    return;

  }


  const selectedCategories =
    [
      ...document
        .querySelectorAll(
          "#categoryPicker input:checked"
        )
    ]
    .map(input => input.value);


  const animal = {

    id:
      $("editId").value
      ||
      Date.now(),

    name,

    scientificName:
      $("scientificName").value,

    image:
      $("imageUrl").value,

    habitat:
      $("habitat").value,

    diet:
      $("diet").value,

    lifespan:
      $("lifespan").value,

    size:
      $("size").value,

    weight:
      $("weight").value,

    conservation:
      $("conservation").value,

    range:
      $("range").value,


    classification: {

      Kingdom:
        $("kingdom").value,

      Phylum:
        $("phylum").value,

      Class:
        $("className").value,

      Order:
        $("order").value,

      Family:
        $("family").value,

      Genus:
        $("genus").value,

      Species:
        $("species").value

    },


    categories:
      selectedCategories,


    facts:
      $("facts")
        .value
        .split("\n")
        .filter(Boolean),


    notes:
      $("notes").value,


    favorite:
      currentAnimal?.favorite || false,


    createdAt:
      currentAnimal?.createdAt
      ||
      Date.now()

  };


  const existingIndex =
    animals.findIndex(
      a =>
        a.id ==
        $("editId").value
    );


  if(existingIndex >= 0) {

    animals[existingIndex] =
      animal;

  }

  else {

    animals.push(animal);

  }


  saveData();

  closeAnimalForm();

  currentAnimal =
    animal;

  openProfile(
    animal.id
  );

  render();

}


/* =========================================
   FILL EDIT FORM
========================================= */

function fillForm(animal) {

  $("animalName").value =
    animal.name;

  $("scientificName").value =
    animal.scientificName;

  $("imageUrl").value =
    animal.image;

  $("habitat").value =
    animal.habitat;

  $("diet").value =
    animal.diet;

  $("lifespan").value =
    animal.lifespan;

  $("size").value =
    animal.size;

  $("weight").value =
    animal.weight;

  $("conservation").value =
    animal.conservation;

  $("range").value =
    animal.range;


  $("kingdom").value =
    animal.classification.Kingdom;

  $("phylum").value =
    animal.classification.Phylum;

  $("className").value =
    animal.classification.Class;

  $("order").value =
    animal.classification.Order;

  $("family").value =
    animal.classification.Family;

  $("genus").value =
    animal.classification.Genus;

  $("species").value =
    animal.classification.Species;


  $("facts").value =
    animal.facts.join("\n");

  $("notes").value =
    animal.notes;

}


/* =========================================
   RENDER COLLECTION
========================================= */

function renderCollection() {

  $("collectionView")
    .classList.remove("hidden");

  $("profileView")
    .classList.add("hidden");


  let list =
    alphabetical(animals);


  if(currentView === "favorites") {

    list =
      list.filter(
        animal =>
          animal.favorite
      );

  }


  if(currentView === "recent") {

    list =
      [...animals]
      .sort(
        (a,b) =>
          b.createdAt -
          a.createdAt
      );

  }


  const search =
    $("collectionSearch")
      .value
      .toLowerCase()
      .trim();


  if(search) {

    list =
      list.filter(animal =>

        animal.name
          .toLowerCase()
          .includes(search)

        ||

        animal.scientificName
          .toLowerCase()
          .includes(search)

        ||

        animal.categories
          .some(category =>
            category
              .toLowerCase()
              .includes(search)
          )

      );

  }


  if(!list.length) {

    $("contentArea").innerHTML = `

      <div class="empty">

        <h3>
          NO ANIMALS FOUND
        </h3>

        <p>
          Start researching animals
          and build your collection.
        </p>

      </div>

    `;

    return;

  }


  $("contentArea").innerHTML = `

    <div class="animal-grid">

      ${list
        .map(createCard)
        .join("")}

    </div>

  `;

}


/* =========================================
   ANIMAL CARD
========================================= */

function createCard(animal) {

  const image =
    animal.image

      ?

    `<img
      class="card-image"
      src="${animal.image}"
      alt="${animal.name}"
    >`

      :

    `<div class="card-placeholder">
      NO IMAGE
    </div>`;


  return `

    <article
      class="animal-card"
      onclick="openProfile(${animal.id})"
    >

      <small>
        #${animal.id}
      </small>

      ${image}

      <h3>
        ${animal.name}
      </h3>

      <em>
        ${animal.scientificName}
      </em>

      <div class="tags">

        ${animal.categories
          .slice(0,5)
          .map(
            category =>
              `<span class="tag">
                ${category}
              </span>`
          )
          .join("")}

      </div>

    </article>

  `;

}


/* =========================================
   OPEN PROFILE
========================================= */

function openProfile(id) {

  currentAnimal =
    animals.find(
      animal =>
        animal.id == id
    );


  if(!currentAnimal)
    return;


  $("collectionView")
    .classList.add("hidden");

  $("profileView")
    .classList.remove("hidden");


  renderProfile();

}


/* =========================================
   PROFILE
========================================= */

function renderProfile() {

  const animal =
    currentAnimal;


  const classification =
    animal.classification;


  $("profileArea").innerHTML = `

    <div class="profile-header">

      <div>

        ${
          animal.image

          ?

          `<img
            class="profile-image"
            src="${animal.image}"
            alt="${animal.name}"
          >`

          :

          `<div class="profile-placeholder">
            NO IMAGE
          </div>`
        }

      </div>


      <div>

        <p class="eyebrow">
          ANIMALDEX ENTRY #${animal.id}
        </p>

        <h2>
          ${animal.name}
        </h2>

        <p class="scientific">
          ${animal.scientificName}
        </p>


        <div class="profile-buttons">

          <button
            onclick="toggleFavorite()"
          >

            ${
              animal.favorite
              ? "★ FAVORITED"
              : "☆ FAVORITE"
            }

          </button>


          <button
            onclick="openAnimalForm(currentAnimal)"
          >
            EDIT
          </button>


          <button
            onclick="deleteAnimal()"
          >
            DELETE
          </button>

        </div>

      </div>

    </div>


    <section class="profile-section">

      <h3>
        QUICK FACTS
      </h3>

      <div class="fact-grid">

        ${makeFact(
          "Habitat",
          animal.habitat
        )}

        ${makeFact(
          "Diet",
          animal.diet
        )}

        ${makeFact(
          "Lifespan",
          animal.lifespan
        )}

        ${makeFact(
          "Size",
          animal.size
        )}

        ${makeFact(
          "Weight",
          animal.weight
        )}

        ${makeFact(
          "Conservation",
          animal.conservation
        )}

        ${makeFact(
          "Range",
          animal.range
        )}

      </div>

    </section>


    <section class="profile-section">

      <h3>
        SCIENTIFIC CLASSIFICATION
      </h3>

      <div class="fact-grid">

        ${Object.entries(
          classification
        )
        .map(
          ([key,value]) =>
            makeFact(key,value)
        )
        .join("")}

      </div>

    </section>


    <section class="profile-section">

      <h3>
        CATEGORIES
      </h3>

      <div class="tags">

        ${animal.categories
          .map(
            category =>
              `<span class="tag">
                ${category}
              </span>`
          )
          .join("")}

      </div>

    </section>


    <section class="profile-section">

      <h3>
        FUN FACTS
      </h3>

      <ul>

        ${
          animal.facts.length

          ?

          animal.facts
            .map(
              fact =>
                `<li>${fact}</li>`
            )
            .join("")

          :

          "<li>No facts added yet.</li>"
        }

      </ul>

    </section>


    <section class="profile-section">

      <h3>
        MY NOTES
      </h3>

      <p class="notes">
        ${
          animal.notes ||
          "No notes yet."
        }
      </p>

    </section>

  `;

}


function makeFact(
  title,
  value
) {

  if(!value)
    return "";


  return `

    <div class="fact">

      <small>
        ${title}
      </small>

      ${value}

    </div>

  `;

}


/* =========================================
   FAVORITE
========================================= */

function toggleFavorite() {

  currentAnimal.favorite =
    !currentAnimal.favorite;

  saveData();

  renderProfile();

  render();

}


/* =========================================
   DELETE
========================================= */

function deleteAnimal() {

  if(
    !confirm(
      `Delete ${currentAnimal.name} from your AnimalDex?`
    )
  )
    return;


  animals =
    animals.filter(
      animal =>
        animal.id !==
        currentAnimal.id
    );


  saveData();


  currentAnimal = null;

  render();

}


/* =========================================
   CATEGORIES PAGE
========================================= */

function renderCategories() {

  $("collectionView")
    .classList.remove("hidden");

  $("profileView")
    .classList.add("hidden");


  $("pageTitle")
    .textContent =
    "CATEGORIES";


  $("pageDescription")
    .textContent =
    "Browse your AnimalDex by category.";


  $("contentArea").innerHTML =

    Object.entries(categories)
      .map(
        ([group,list]) => `

          <div class="taxonomy-group">

            <button
              class="taxonomy-main"
              onclick="
                this
                .nextElementSibling
                .classList
                .toggle('hidden')
              "
            >

              + ${group}

            </button>


            <div
              class="taxonomy-children hidden"
            >

              ${
                [...list]
                .sort()
                .map(
                  category => `

                    <button
                      class="taxonomy-chip"
                      onclick="
                        filterCategory(
                          '${category}'
                        )
                      "
                    >

                      ${category}

                    </button>

                  `
                )
                .join("")
              }

            </div>

          </div>

        `
      )
      .join("");

}


/* =========================================
   CATEGORY FILTER
========================================= */

function filterCategory(category) {

  currentView =
    "collection";


  $("collectionSearch").value =
    category;


  render();

}


/* =========================================
   TAXONOMY
========================================= */

function renderTaxonomy() {

  $("collectionView")
    .classList.remove("hidden");

  $("profileView")
    .classList.add("hidden");


  $("pageTitle")
    .textContent =
    "TAXONOMY";


  $("pageDescription")
    .textContent =
    "Explore the scientific classification system.";


  $("contentArea").innerHTML = `

    <div class="taxonomy-group">

      <button class="taxonomy-main">
        KINGDOM ANIMALIA
      </button>

      <div class="taxonomy-children">

        <div class="taxonomy-branch">

          <div class="taxonomy-title">
            MAMMALS
          </div>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Cats')"
          >
            Cats
          </button>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Bears')"
          >
            Bears
          </button>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Wolves')"
          >
            Wolves
          </button>

        </div>


        <div class="taxonomy-branch">

          <div class="taxonomy-title">
            BIRDS
          </div>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Eagles')"
          >
            Eagles
          </button>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Owls')"
          >
            Owls
          </button>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Penguins')"
          >
            Penguins
          </button>

        </div>


        <div class="taxonomy-branch">

          <div class="taxonomy-title">
            REPTILES
          </div>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Lizards')"
          >
            Lizards
          </button>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Snakes')"
          >
            Snakes
          </button>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Turtles')"
          >
            Turtles
          </button>

        </div>


        <div class="taxonomy-branch">

          <div class="taxonomy-title">
            AMPHIBIANS
          </div>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Frogs')"
          >
            Frogs
          </button>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Salamanders')"
          >
            Salamanders
          </button>

        </div>


        <div class="taxonomy-branch">

          <div class="taxonomy-title">
            ARACHNIDS
          </div>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Spiders')"
          >
            Spiders
          </button>

          <button
            class="taxonomy-chip"
            onclick="filterCategory('Scorpions')"
          >
            Scorpions
          </button>

        </div>

      </div>

    </div>

  `;

}


/* =========================================
   STATS
========================================= */

function renderStats() {

  $("collectionView")
    .classList.remove("hidden");

  $("profileView")
    .classList.add("hidden");


  $("pageTitle")
    .textContent =
    "DEX PROGRESS";


  $("pageDescription")
    .textContent =
    "Watch your AnimalDex grow.";


  const favorites =
    animals.filter(
      animal =>
        animal.favorite
    ).length;


  const categoryCount =
    new Set(
      animals.flatMap(
        animal =>
          animal.categories
      )
    ).size;


  $("contentArea").innerHTML = `

    <div class="stats-grid">

      <div class="big-stat">

        ANIMALS

        <strong>
          ${animals.length}
        </strong>

      </div>


      <div class="big-stat">

        FAVORITES

        <strong>
          ${favorites}
        </strong>

      </div>


      <div class="big-stat">

        CATEGORIES USED

        <strong>
          ${categoryCount}
        </strong>

      </div>


      <div class="big-stat">

        SPECIES

        <strong>
          ${animals.length}
        </strong>

      </div>

    </div>

  `;

}


/* =========================================
   MAIN RENDER
========================================= */

function render() {

  $("animalCount")
    .textContent =
    animals.length;


  if(currentView === "categories") {

    renderCategories();

    return;

  }


  if(currentView === "taxonomy") {

    renderTaxonomy();

    return;

  }


  if(currentView === "stats") {

    renderStats();

    return;

  }


  renderCollection();

}


/* =========================================
   BACK BUTTON
========================================= */

$("backBtn").onclick = () => {

  currentAnimal = null;

  render();

};


/* =========================================
   INITIALIZE
========================================= */

buildCategoryPicker();

render();
