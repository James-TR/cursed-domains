const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let pos = 0;

document.addEventListener('keydown', e => {
  if (e.key === KONAMI[pos]) {
    pos++;
    if (pos === KONAMI.length) {
      pos = 0;
      reveal();
    }
  } else {
    pos = e.key === KONAMI[0] ? 1 : 0;
  }
});

setTimeout(() => {
  const hint = document.getElementById('hint');
  hint.classList.add('visible');
  setTimeout(() => hint.classList.remove('visible'), 5000);
}, 30000);

function reveal() {
  document.getElementById('spinner').style.display = 'none';
  document.getElementById('message').style.display = 'none';
  document.getElementById('reason').classList.add('visible');
  document.title = 'reason found';
}
