interface WordsListArray { 
  [key: string]: string[];
}


class Hangman {
  hangmanImage: HTMLElement | null;
  buttonNewGame: HTMLElement | null;
  wordContainer: HTMLElement | null;
  keyboard: HTMLElement | null;
  themes: NodeList;
  keys: NodeList;
  theme: string;
  word: string;
  mistake: number;
  usedKeys: string[];

  constructor() {
    this.hangmanImage = this.$(".hangman img");
    this.buttonNewGame = this.$(".newgame-button");
    this.wordContainer = this.$(".word-container");
    this.keyboard = this.$("#keyboard");
    this.themes = document.querySelectorAll("#select-theme .theme");
    this.keys = document.querySelectorAll("#keyboard .letter-button");
    this.theme = '';
    this.word = '';
    this.mistake = 0;
    this.usedKeys = [];

    this.toggleSelectThemeModal = this.toggleSelectThemeModal.bind(this);
    this.handleKeyboard = this.handleKeyboard.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  $<T extends HTMLElement>(seletor: string): T | null { return document.querySelector(seletor) };

  toggleSelectThemeModal() { this.$("#select-theme")?.classList.toggle("visible") };

  alertMessage(message: string) {
    const alertElement = this.$("#alert-game");
    if(alertElement && this.keyboard) {
      this.keyboard.classList.remove("visible");
      alertElement.classList.add("visible");
      alertElement.innerHTML = message;
    }
  }

  resetGame() {
    this.mistake = 0;
    this.usedKeys = [];
    this.$("#alert-game")?.classList.remove("visible");

    if(this.keyboard && this.hangmanImage instanceof HTMLImageElement) {
      this.hangmanImage.src = `/assets/forca-${this.mistake}.png`;
      this.keyboard.classList.add("visible");
      [...this.keyboard.children].forEach(key => key.removeAttribute("disabled"));
    }
  }

  wordContainerConstructor(theme: string, word: string) {
    let content = '';
    let win = 0;

    [...word].forEach(char => {
      if(this.usedKeys?.includes(char)) {
        win++
        content += `<span class="letter">${char}</span>`;
      } else {
        content += `<span class="letter"></span>`;
      }
    });

    if(this.wordContainer) {
      this.wordContainer.innerHTML = `
        <h4 class="theme">${theme}</h4>
        <div class="word">${content}</div>
      `
    }

    if(win === word.length) this.alertMessage("You win! :)");
  }

  async fecthWords() {
    const response = await fetch('../words.json');
    return await response.json();
  }

  async handleWord(theme: string) {
    const wordsArray: WordsListArray = await this.fecthWords();
    const length = wordsArray[theme].length;
    const randomNum = Math.floor(Math.random() * length);
    const word = wordsArray[theme][randomNum].toUpperCase(); 
    this.wordContainerConstructor(theme, word);

    this.theme = theme;
    this.word = word;
  }

  startGame({ currentTarget }: Event) {
    if(currentTarget instanceof HTMLAnchorElement) {
      const theme = currentTarget.dataset.theme;
      if(theme) this.handleWord(theme);
    }

    this.toggleSelectThemeModal();
    this.resetGame();
  }


  handleKeyboard({ target }: Event) {
    if(!(target instanceof HTMLButtonElement)) return;
    target.setAttribute("disabled", "");
    const letter = target.innerText;
    this.usedKeys = [...this.usedKeys, letter];
    
    if(!this.word.includes(letter) && this.hangmanImage instanceof HTMLImageElement) {
      this.mistake++;
      this.hangmanImage.src = `/assets/forca-${this.mistake}.png`;
      if(this.mistake === 6) {
        this.alertMessage("You lose! :(");
      }
    }

    this.wordContainerConstructor(this.theme, this.word);
  }

  init() {
    this.alertMessage('Click "New game" to start');
    this.buttonNewGame?.addEventListener("click", this.toggleSelectThemeModal);
    this.themes.forEach(theme => theme.addEventListener("click", this.startGame));
    this.keys.forEach(key => {
      key?.addEventListener("click",  this.handleKeyboard);
    });
  }
}

const hangman = new Hangman();
hangman.init();
