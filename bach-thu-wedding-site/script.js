const DESIGN_WIDTH = 682;
const DESIGN_HEIGHT = 2048;

function fitCanvas() {
  const scale = Math.min(1, window.innerWidth / DESIGN_WIDTH);
  const viewport = document.getElementById('viewport');
  viewport.style.transform = `scale(${scale})`;
  viewport.style.width = `${DESIGN_WIDTH}px`;
  viewport.style.height = `${DESIGN_HEIGHT * scale}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

const hero = document.querySelector('.hero');
const openInvitation = () => {
  hero.classList.add('open');
  setTimeout(() => document.getElementById('welcome').scrollIntoView({behavior:'smooth'}), 500);
};
document.getElementById('openButton').addEventListener('click', openInvitation);
document.getElementById('openCta').addEventListener('click', openInvitation);

function openDialog(id){
  const dialog = document.getElementById(id);
  if (!dialog.open) dialog.showModal();
}
document.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });
});

document.getElementById('quizButton').addEventListener('click', () => openDialog('quizModal'));
document.getElementById('luckyBag').addEventListener('click', () => openDialog('quizModal'));
document.querySelectorAll('[data-answer]').forEach(button => {
  button.addEventListener('click', () => {
    const result = document.getElementById('quizResult');
    result.textContent = button.dataset.answer === 'correct'
      ? 'Chính xác! Con số may mắn của bạn là 18.'
      : 'Chưa đúng rồi, thử lại một lần nữa nhé!';
  });
});

document.getElementById('wishForm').addEventListener('submit', event => {
  event.preventDefault();
  const value = document.getElementById('wish').value.trim();
  if (!value) {
    document.getElementById('wish').focus();
    return;
  }
  localStorage.setItem('bach-thu-wish', value);
  event.currentTarget.reset();
  openDialog('wishModal');
});

document.getElementById('videoButton').addEventListener('click', () => openDialog('videoModal'));

document.getElementById('rsvpButton').addEventListener('click', () => openDialog('rsvpModal'));
document.querySelectorAll('[data-rsvp]').forEach(button => {
  button.addEventListener('click', () => {
    const attending = button.dataset.rsvp === 'yes';
    localStorage.setItem('bach-thu-rsvp', attending ? 'yes' : 'no');
    document.getElementById('rsvpResult').textContent = attending
      ? 'Cảm ơn bạn. Hẹn gặp bạn tại lễ cưới!'
      : 'Cảm ơn bạn đã phản hồi. Bách & Thư rất trân trọng tình cảm của bạn.';
  });
});

document.getElementById('editMessage').addEventListener('click', () => {
  const next = prompt('Nhập lời nhắn của cô dâu chú rể:', localStorage.getItem('bach-thu-message') || '');
  if (next !== null && next.trim()) {
    localStorage.setItem('bach-thu-message', next.trim());
    document.getElementById('editMessage').textContent = next.trim();
  }
});
const savedMessage = localStorage.getItem('bach-thu-message');
if (savedMessage) document.getElementById('editMessage').textContent = savedMessage;
