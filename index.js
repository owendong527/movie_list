const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_RUL = BASE_URL + "/api/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const MOVIES_PER_PAGE = 12 //為了設定每個分頁可以放幾張卡片

const movies = []
let filteredMovies = []  //因為最後最後收藏清單的分頁器也要製作 所以存放輸入關鍵字後搜尋完的結果 從5.拿到外面來的原因是5的函式結束後filterMovies也消失了，這樣分頁的頁數就無法因為篩出來電影的數量多寡去改變它的頁數
                         //放在跟movies同一個階層下這樣我們也可以存取到它，而當收尋是空陣列代表使用者沒有做收尋所以顯示出來的就是那80部電影
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') //去抓輸入格的值
const paginator = document.querySelector('#paginator')


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
            <button class="btn btn-info btn-add-favorite" data-id= "${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML
}

//9.製作分頁器的數量
function renderPaginator(amount) {   //需要知道幾部電影才知道要分幾頁 amount是電影的數量
  //80 / 12 = 6...8 =7頁，所以只要有餘數就是無條件進位多一頁  Math.ceil() 無條件進位
  //Math.ceil(12.1) ->13
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}


//8.當輸入分頁頁數時 會回傳該page的哪12部電影資料
function getMoviesByPage(page) {
  //page1 ->movies 0-11
  //page2 ->movies 12-23
  //page3 ->movies 24-35

//11.收藏清單的分頁器也要製作所以要幫分頁器判斷你是在movies的分頁器還是filteredMovies的分頁器
  //其實抓到的movies是有兩種意思 1.完整的80部電影movies 2.被使用者收尋出來的電影filteredMovies 因為這兩種都必須被分頁
  //所以把原本的movies改成多設個變數data 來表示 1 or 2

  const data = filteredMovies.length ? filteredMovies : movies
  //問號後面第一個是說 filteredMovies這陣列是有東西有長度的 data= filteredMovies，如果該陣列是空的代表沒做收藏 data= movies 80部電影
  
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  // return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


//4.利用id取得節點在設變數後，再利用api抓取特定資料的細節後 再利用innerText去改變內容
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

//7.建立函式 把傳入特定id的電影丟入local storage
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] //先去取local storage裡面的資料而取出要再用JSON.parse轉成物件
  const movie = movies.find((movie) => movie.id === id) //find遍歷movies後 和６.選出來的id做比對，find只會回傳第一次就中的條件函式的值

  if (list.some(movie =>movie.id === id)) {
        return alert ('此電影已在書藏清單中！')
  }
  list.push(movie)
  // console.log(list)
  // const jsonString = JSON.stringify(list)  //stringify()函式可以把JS的資料變成JSON字串
  // console.log('json string:', jsonString)
  // console.log('json object:',JSON.parse(jsonString)) //JSON.parse把JSON字串 轉回JS資料
 
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
// 上面這段程式碼在做的事是：
// 在 addToFavorite 傳入一個 id
// 請 find 去電影總表中查看，找出 id 相同的電影物件回傳，暫存在 movie
// 把 movie 推進收藏清單
// 接著呼叫 localStorage.setItem，把更新後的收藏清單同步到 local storage



//3.設定監聽器：點擊more，出現modal的訊息
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id)) //dataset.取得屬性的值是字串，所以要加上Number來轉成數字
//6.設定監聽器：點擊+ 收藏按鈕，把電影加入收藏裡面
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//10.監聽分頁器，點擊每個分頁 每個<li>會顯示該頁的電影清單 所以就在li裡面的<a>綁一個data-page
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  // <a> </a>
  // console.log(event.target.dataset.page) 顯示點到2就出現2的頁數
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})


//5.要設定search按鈕的事件監聽，回到HTML裡的<form>，給他個id="search-form"後在這上面給他個變數searchForm
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //請瀏覽器不要做預設的重新導向當前頁面的動作
  // console.log(searchInput.value)  //input type是text的 會用value這attribute 去取到搜尋欄input的值
  const keyword = searchInput.value.trim().toLowerCase()  //toLowerCase 把輸入的字都變小寫 ,.trim會幫我們把字串前面和後面有空白的去掉

  //判斷一
  // if (!keyword.length) {
  //   return alert ('Please enter a valid string')
  // }     //當我們沒有輸入任何關鍵字的時候應該是要顯示全部的電影的但這個會全空白

  //方法一 for of 去搜尋符合關鍵字的電影然後放到filteredMovies你收尋完的結果
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  //方法二 使用filter 是陣列用的方法 去遍歷陣列裡的全部元素後 篩出條件函式要的元素  還有其他的方法map , reduce 陣列操作三寶
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )  //movies.filter((movie) => { return movie.title.toLowerCase().includes(keyword)}

  //判斷二 錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyword)
  }

  renderPaginator(filteredMovies.length)
  // renderMovieList(filteredMovies) //重新呼叫 renderMovieList 會導致瀏覽器重新渲染 #data-panel 裡的 template，此時畫面上就只會出現符合搜尋結果的電影。最後因為分頁要改動
  renderMovieList(getMoviesByPage(1))
})


//1.取得頁面的API資料
axios
  .get(INDEX_RUL)
  .then(response => {

    // console.log(response)
    // console.log(response.data)
    // console.log(response.data.results) //Array(80)

    // movies.push(response.data.results)
    // console.log(movies)  // movies 會變成一個只有 1 個元素的陣列，要的是80個元素的array而不是再包一層變[Array(80)]

    //方法一
    //   for (const movie of response.data.results) {
    //   movies.push(movie)
    // }
    //方法二 ...三個點點就是展開運算子，他的主要功用是「展開陣列元素」
    movies.push(...response.data.results)
    //renderMovieList(movies) 因為配合有分頁器之後 就不能一次去顯示全部的電影了
    renderMovieList(getMoviesByPage(1))
    renderPaginator(movies.length)
  })
  .catch((err) => console.log(err))




