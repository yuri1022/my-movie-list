const BASE_URL = " https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/movies"
const POSTER_URL = BASE_URL + "/posters/"
const dataPanel = document.querySelector('#data-panel')
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
let filteredMovies = []
const movies = []
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')



//不直接用movies這個變數是為了降低耦合性
function rendermovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
  <div class="mb-2">
    <div class="card">
    <img
    src=${POSTER_URL + item.image}
    class="card-img-top" alt="Movie Post">
    <div class="card-body">
      <h5 class="card-title">${item.title}</h5>
    </div>

    <div class="card-footer">
      <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
        data-bs-target="#movie-modal" data-id='${item.id}'>More</button>
      <button class="btn btn-info btn-add-favorite" data-id='${item.id}'>+</button>
    </div>
    </div>
  </div>
  </div> `
  });

  dataPanel.innerHTML = rawHTML;
}


function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 0; page < numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-id=${page + 1}>${page + 1}</a></li>`
  }

  paginator.innerHTML = rawHTML;
}


//分頁
function getMovieByPage(page) {
  //page1 -> movie 0 - 11
  //p2 -> 12 - 23
  //movies ; filteredMovies
  const data = filteredMovies.length ? filteredMovies : movies
  //意思是filteredMovies有長度(做了有效搜尋)的話就給我filter 如果沒有就給我movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//回傳ID
function showMovieModal(id) {

  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-img')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + '/' + id).then(response => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })

}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單中')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

paginator.addEventListener('click', function onPageClicked(event) {
  if (event.target.matches('.page-link')) {
    console.log(event.target.dataset.id)
    rendermovieList(getMovieByPage(Number(event.target.dataset.id)))
  }
})

dataPanel.addEventListener('click', function onPanelClicked(event) {

  if (event.target.matches('.btn-show-movie')) {
    console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  }
  else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//綁定的事件名稱為submit(提交)

searchForm.addEventListener('submit', function onSearchFormSubmit(event) {
  //請瀏覽器不要做預設的動作
  event.preventDefault()
  //toLowerCase = 把資料都變成小寫 trim = 空白去頭去尾
  const keyword = searchInput.value.trim().toLowerCase()
  //驗證資料是否合法
  // if (!keyword.length) {
  //   return alert('Please Enter Valid String')
  // }


  //寫法一：FOR迴圈
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  //寫法二:FILTER
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  rendermovieList(filteredMovies)

  if (filteredMovies.length === 0) {
    return alert('找不到你要的電影！')
  }
  renderPaginator(filteredMovies.length)
  rendermovieList(getMovieByPage(1))


})




axios.get(INDEX_URL)
  .then(function (response) {
    //把資料推到自己定義的陣列裡面(使用展開運算)
    movies.push(...response.data.results);
    renderPaginator(movies.length)
    rendermovieList(getMovieByPage(1))

  })

