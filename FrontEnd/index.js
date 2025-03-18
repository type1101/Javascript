let allWorks = []


async function getWorks() {
    try{
        const res = await fetch('http://localhost:3000/api/works')
        const data = await res.json()
        console.log(data)
        allWorks = data
        createGallery(data)
        return data

    }
        catch(e){
          console.log('une erreur est survenue', e)
          return []
        }

}
getWorks()


function createGallery(works) {
  const gallery = document.querySelector('.gallery')
  gallery.innerHTML = ''

  works.forEach(work => {
    const figure = document.createElement('figure')
    figure.innerHTML = `
    <img src = "http://localhost:3000/images/${work.imageUrl.split('/').pop()} " alt = "${work.title}">
    <figcaption>${work.title}</figcaption>
    `
    gallery.appendChild(figure)
  });

}




async function getCategories() {
  try {
    const categories = await fetch("http://localhost:3000/api/categories");
    const categoriesJson = await categories.json();
    console.log(categoriesJson);

    // Crée les boutons de filtre
    createFilterButtons(categoriesJson);

    // Remplit le menu déroulant dans la modale d'ajout de photo
    const categorySelect = document.getElementById("categoryChoice");
    if (categorySelect) {
      categorySelect.innerHTML = '<option value="">Sélectionner une catégorie</option>';
      categoriesJson.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }

  } catch (error) {
    console.error("Erreur lors du chargement des catégories :", error);
  }
}

getCategories();



function setActiveButton(selectedButton) {
  const buttons = document.querySelectorAll('.category-menu button');
  buttons.forEach(button => {
    button.classList.remove('active');
  });

  selectedButton.classList.add('active');
}

async function filterProjectsByCategory(categoryName) {
  try {
    const works = await getWorks();
    
    if (!works || !Array.isArray(works)) {
      console.error('Les projets récupérés ne sont pas valides.');
      return;
    }

    if (categoryName === 'Tous') {
      createGallery(works); 
    } else {
      const filteredWorks = works.filter(work => work.category && work.category.name === categoryName);
      createGallery(filteredWorks);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des projets :', error);
  }
}


function createFilterButtons(categories) {
  const filterContainer = document.querySelector('.category-menu');
  filterContainer.innerHTML = ''; 

  const allButton = document.createElement('button');
  allButton.innerText = 'Tous';
  allButton.classList.add('active');
  allButton.addEventListener('click', () => {
    setActiveButton(allButton);
    getWorks();
  });
  filterContainer.appendChild(allButton);

  categories.forEach(category => {
    const button = document.createElement('button');
    button.innerText = category.name;
    button.addEventListener('click', () => {
      setActiveButton(button);
      filterProjectsByCategory(category.name);
    });
    filterContainer.appendChild(button);
  });
}


const btnLogin = document.querySelector('.btnLogin');
const btnLogout = document.querySelector('.btnLogout');

console.log(btnLogout); 
console.log(document.querySelector('.btnLogout'));
const filter = document.querySelector('.category-menu')
const modification = document.querySelector(".modification");
const btnEdition = document.querySelector(".btnEdition");


function loginLogout() {

    if (localStorage.getItem("token")) {
        btnLogin.classList.add('inactive')
        btnLogout.classList.remove('inactive');
        filter.classList.add('inactive')
        modification.classList.remove('inactive')
    } else {
        btnLogin.classList.remove('inactive');
        btnLogout.classList.add('inactive');
        filter.classList.remove('inactive')
        modification.classList.add('inactive')
    }

}

btnLogout.addEventListener('click', () => {
  localStorage.removeItem("token")
  console.log("deconnecté")
  loginLogout()
})



btnEdition.addEventListener("click", function(){
  modal.showModal()
  modalGallery()

});

const token = localStorage.getItem("token");
console.log(localStorage.getItem("token"));


const modalGalleryContener = document.getElementById('modalGallery')

function modalGallery() {
  modalGalleryContener.innerHTML = '';
  allWorks.forEach(work => {
    const figure = document.createElement('figure')
    figure.dataset.id = work.id; 
    figure.innerHTML = `
    <img src = "http://localhost:3000/images/${work.imageUrl.split('/').pop()} " alt = "${work.title}">
    <figcaption>${work.title}</figcaption>
    <i class="fa-solid fa-trash-can"></i>
    ` 
    const deleteIcon = figure.querySelector('.fa-trash-can');
    deleteIcon.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        const response = await fetch(`http://localhost:3000/api/works/${work.id}`,{
          method: 'DELETE',
          headers: {
          'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          console.log("Projet supprimé avec succès !");
          figure.remove(); 
          allWorks = allWorks.filter((currentWork) => {
            console.log(work)
            if (currentWork.id === work.id){
              return false
            }
            else{
              return true
            }
          })
          createGallery(allWorks)
          console.log(allWorks)
        } else {
          console.error("Échec de la suppression, statut:", response.status);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    });

    modalGalleryContener.appendChild(figure)
  });

}

const addPicsBtn = document.getElementById("addPicsBtn");
const modalAdd = document.querySelector(".modalAdd");

addPicsBtn.addEventListener("click", function() {
  modalAdd.showModal()
});

const addPhoto = document.getElementById("addPics");
const fileChoice = document.getElementById("fileChoice");
const imagePreview = document.getElementById("fileSelected");

fileChoice.addEventListener("click", function(event) {
  event.preventDefault()
  addPhoto.click()
})

addPhoto.addEventListener("change", function(){
  const fileSelected = addPhoto.files[0]
  console.log(fileSelected)

  if (fileSelected){
    const reader = new FileReader();

    reader.onload = function(event) {
      imagePreview.src = event.target.result;
      imagePreview.style.display = "block";
    }
    reader.readAsDataURL(fileSelected)
  }
})

const ValidePics = document.getElementById("validePics");
const addPics = document.querySelector("#addPics");
const addCategory = document.getElementById("categoryChoice");

ValidePics.addEventListener("click", async function (e) {
  e.preventDefault(); // Empêche le rechargement de la page

  try {
    const formData = new FormData();
    formData.append("image", addPics.files[0]);
    formData.append("title", addTitle.value);
    formData.append("category", parseInt(addCategory.value));

    const response = await fetch(`http://localhost:3000/api/works`, {
      method: "POST",
      headers: {
          'Authorization': `Bearer ${token}`
          },
      body: formData
    });

    if (response.ok) {
      console.log("Succès");
      document.getElementById("modalAddPics").reset(); // Réinitialisation correcte du formulaire
      imagePreview.src = "";
      imagePreview.style.display = "none";

      document.querySelector(".gallery").innerHTML = ""; // Réinitialisation de la galerie
      await getWorks(); // Recharger la galerie avec les nouvelles données

      modalAdd.close(); // Fermer la modale après l'ajout
    } else {
      console.log("Erreur lors de l'ajout du projet.");
    }
  } catch (error) {
    console.error("Erreur lors de la requête :", error);
  }
});






const returnModale = document.querySelector(".fa-arrow-left");

returnModale.addEventListener("click", function() {
  modal.showModal()
});

// fermer la modale//
const close1 = document.querySelector(".closeModal");
const close2 = document.querySelector(".closeModal2");

close1.addEventListener("click", function() {
  modal.close()
  modalAdd.close()
});




loginLogout();