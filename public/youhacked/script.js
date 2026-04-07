$.get('https://ip.youhacked.me/cdn-cgi/trace', function(data) {
  // Convert key-value pairs to JSON
  // https://stackoverflow.com/a/39284735/452587
  data = data.trim().split('\n').reduce(function(obj, pair) {
    pair = pair.split('=');
	return obj[pair[0]] = pair[1], obj;
  }, {});
  
  (function titleScroller(text) {
    document.title = text;
    setTimeout(function () {
        titleScroller(text.slice(1) + text.slice(0, 1));
    }, 500);
}( document.title + " - I know your IP address - " + data.ip + " - You can't hide forever - "));
});

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


class Symbol {
    constructor(x, y, fontSize, canvasHeight) {
        // this.characters = 'Prince';
        // this.characters = '❤';
        // this.characters = '404 not found';
        // this.characters = '☀☁❆WEATHER❅❄';
        // this.characters = '♔♕♖♗♘♙CHESS♚♛♜♝♞♟';
        this.characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンあいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩДЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ─│┌┐└┘├┤┬┴┼█▓▒░▄▀■□▪▫⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏ᚠᚡᚢᚣᚤᚥᚦᚧᚨᚩᚪᚫ∑∏∂∇∞≠≈±√∫∆∃∀↑↓←→↖↗↘↙↔↕';
		// this.characters = 'YOU HACKED ME'
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.text = '';
        this.canvasHeight = canvasHeight

    }
    draw(context) {
        this.text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
        // context.fillStyle = '#0aff0a';
        // context.fillStyle = 'red';
        context.fillText(this.text, this.x * this.fontSize, this.y * this.fontSize);
        if (this.y * this.fontSize > this.canvasHeight && Math.random() > 0.98) {
            this.y = 0;

        } else {
            this.y += 1;
        }
    }
}


class Effect {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.fontSize = 25;
        this.columns = this.canvasWidth / this.fontSize;
        this.symbols = [];
        this.#initialize();
        console.log(this.symbols);
    }
    #initialize() {
        for (let i = 0; i < this.columns; i++) {
            const randomY = Math.floor(Math.random() * (this.canvasHeight / this.fontSize)) * -1;
            this.symbols[i] = new Symbol(i, randomY, this.fontSize, this.canvasHeight);
        }
    }
    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.columns = this.canvasWidth / this.fontSize;
        this.symbols = [];
        this.#initialize();
    }
}

const effect = new Effect(canvas.width, canvas.height);
ctx.textAlign = 'center';
let lastTime = 0;
const fps = 30;
const nextFrame = 1000 / fps;
let timer = 0;
let rainbow = false;

function makeGradient() {
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, 'magenta');
    g.addColorStop(0.2, 'blue');
    g.addColorStop(0.4, 'cyan');
    g.addColorStop(0.6, 'green');
    g.addColorStop(0.8, 'yellow');
    g.addColorStop(1, 'red');
    return g;
}

function toggleRainbow() {
    rainbow = !rainbow;
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'r' || e.key === 'R') toggleRainbow();
});

const banner = document.querySelector('.hero_heading h1');
banner.addEventListener('click', toggleRainbow);
banner.addEventListener('touchend', function (e) {
    e.preventDefault();
    toggleRainbow();
});

function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    if (timer > nextFrame) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = rainbow ? makeGradient() : '#0aff0a';
        ctx.font = effect.fontSize + 'px monospace';
        effect.symbols.forEach(symbol => symbol.draw(ctx));

        timer = 0;
    }
    else {
        timer += deltaTime;
    }
    requestAnimationFrame(animate);
}
animate(0);

window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.resize(canvas.width, canvas.height);
})