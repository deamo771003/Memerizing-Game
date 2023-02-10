// 狀態S--
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const model = {
  revealedCards: [], // 暫存被翻開的牌

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,
  triedTimes: 0,
}

const Symbols = [
  // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png',
  // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png',
  // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png',
  // 梅花
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png'
]

// 牌組顯示
// 52張牌每13張換一次花色
const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  getCardContent(index) {
    // 取除以13的於數+1為卡片數字
    const number = this.transFromNumber((index % 13) + 1)
    // 取除以13後的整數為花色
    const symbol = Symbols[Math.floor(index / 13)]
    return `
        <p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>
    `
  },
  // 11.12.13.1轉換成J.Q.K.A
  transFromNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  // 畫面匯入
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    // Array(52) 52個空陣列的index就是0-51的值,再用keys迭代器各個取出,再使用Array.from迭代所有數字變成陣列,用map把數字陣列一組一組帶入getCardElement
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('') // 沒搞懂
  },
  // 翻牌函式
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      // 動畫結束就刪除class內容
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  // 結束畫面
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

// 洗牌
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const controller = {
  //初始設定
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 依照遊戲不同狀態做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        // 嘗試次數
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          // 分數+10
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          // 搞不是很懂...
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          // 呼叫結束畫面
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          // 翻開的牌配對失敗後帶入動畫
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}
// 狀態E--

// 顯示畫面
controller.generateCards()

// 點擊卡片監聽器
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})






