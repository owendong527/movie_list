const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_RUL = BASE_URL + "/api/movies/"
const POSTER_URL = BASE_URL + "/posters/"


const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
// const searchInput = document.querySelector('#search-input')



//2.render整個頁面
function renderMovieList(data) {
  let rawHTML = ''

  // processing
  data.forEach((item) => {
    //title, image
    rawHTML += `
      <div class="col-sm-2">
        <div class="mb-2">
          <div class="card" >
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id= "${item.id}">More</button>
            <button class="btn btn-danger btn-remove-favorite" data-id= "${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}


//和add相似 先把list 從local storage拿出來 再去減掉點擊這個id的元素 最後再把list塞回去
function removeFromFavorite(id) {

  const movieIndex = movies.findIndex((movie) => movie.id === id)//find 找到後回傳該元素 findIndex找到後回傳該元素的索引 
  movies.splice(movieIndex, 1)

  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}


//3.設定監聽器：點擊more，出現modal的訊息
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
    //6.設定監聽器：點擊+ 收藏按鈕，把電影加入收藏裡面
  } else if (event.target.matches('.btn-remove-favorite')){
    removeFromFavorite(Number(event.target.dataset.id))

  }
})


//4.利用id取得節點在設變數後，再利用api抓取特定資料的細節後再利用innerText去改變內容
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_RUL + id).then(response => {
    // console.log(response.data.results)
    //response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = `Release date:` + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class= "img-fluid">
`
  })
}

renderMovieList(movies)

