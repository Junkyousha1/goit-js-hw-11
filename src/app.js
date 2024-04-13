import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import "simplelightbox/dist/simple-lightbox.min.css";


const PIXABAY_API_KEY = "43369077-5baf35802a1d034a9e1357834";

async function fetchPixabayImages(query, page = 1) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: PIXABAY_API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: 40,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching images from Pixabay.');
  }
}

function notifySuccess(message) {
  Notiflix.Notify.success(message);
}

function notifyEndOfResults() {
  Notiflix.Notify.info(
    "We're sorry, but you've reached the end of search results."
  );
}

function renderGallery(images) {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';

  images.forEach(image => {
    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card');
    photoCard.innerHTML = `
      <a href="${image.largeImageURL}" data-lightbox="image">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy">
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    `;
    gallery.appendChild(photoCard);
  });

  const lightbox = new SimpleLightbox('.gallery a', {});
  lightbox.refresh();
}

async function handleSearch(event) {
  event.preventDefault();
  const query = event.target.searchQuery.value.trim();
  if (!query) {
    notifyFailure('Please enter a search query.');
    return;
  }

  try {
    Notiflix.Loading.standard('Searching for images...');
    const searchData = await fetchPixabayImages(query);
    if (searchData.hits.length === 0) {
      notifyEndOfResults();
    } else {
      renderGallery(searchData.hits);
      notifySuccess(`Hooray! ${searchData.totalHits} images found.`);
      const loadMoreButton = document.querySelector('.load-more');
      loadMoreButton.style.display =
        searchData.totalHits > 40 ? 'block' : 'none';
    }
  } catch (error) {
    notifyFailure(error.message);
  } finally {
    Notiflix.Loading.remove();
  }
}

async function handleLoadMore(event) {
  event.preventDefault();
  const query = document.getElementById('searchQuery').value.trim();
  const currentPage = parseInt(event.target.dataset.page);
  const nextPage = currentPage + 1;

  try {
    Notiflix.Loading.standard('Loading more images...');
    const searchData = await fetchPixabayImages(query, nextPage);
    if (searchData.hits.length === 0) {
      notifyEndOfResults();
    } else {
      renderGallery(searchData.hits);
      event.target.dataset.page = nextPage;
      const loadMoreButton = document.querySelector('.load-more');
      loadMoreButton.style.display =
        searchData.totalHits > nextPage * 40 ? 'block' : 'none';
    }
  } catch (error) {
    notifyFailure(error.message);
  } finally {
    Notiflix.Loading.remove();
  }
}

export { handleSearch, handleLoadMore };
