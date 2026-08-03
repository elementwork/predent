export function renderPageScript(): string {
  return `
function selectOption(btn) {
  var card = btn.closest('.question-card');
  if (card.classList.contains('checked')) return;
  card.querySelectorAll('.option-btn').forEach(function(b) {
    b.classList.remove('selected');
  });
  btn.classList.add('selected');
}

function checkAnswer(btn) {
  var card = btn.closest('.question-card');
  if (card.classList.contains('checked')) return;
  var selected = card.querySelector('.option-btn.selected');
  if (!selected) return;
  var correct = selected.getAttribute('data-correct') === 'true';
  card.classList.add('checked');
  card.classList.add(correct ? 'correct' : 'incorrect');
  selected.classList.add(correct ? 'correct-answer' : 'wrong-answer');
  var feedback = card.querySelector('.question-feedback');
  var letters = ['A', 'B', 'C', 'D'];
  var correctIndex = parseInt(card.getAttribute('data-correct-index'), 10);
  if (feedback) {
    feedback.style.display = 'block';
    feedback.textContent = correct
      ? 'Correct! Well done.'
      : 'Incorrect. The correct answer is ' + letters[correctIndex] + '.';
  }
  var checkBtn = card.querySelector('.btn-check');
  if (checkBtn) checkBtn.disabled = true;
  updateScore();
}

function toggleExplanation(btn) {
  var card = btn.closest('.question-card');
  var explanation = card.querySelector('.explanation');
  if (!explanation) return;
  var isHidden = explanation.style.display === 'none';
  explanation.style.display = isHidden ? 'block' : 'none';
  btn.textContent = isHidden ? 'Hide Explanation' : 'Show Explanation';
}

function revealCard(card) {
  card.classList.add('revealed');
  var explanation = card.querySelector('.explanation');
  if (explanation) explanation.style.display = 'block';
  var btn = card.querySelector('.btn-show-answer');
  if (btn) btn.textContent = 'Hide Explanation';
}

function showAllAnswers() {
  document.querySelectorAll('.question-card').forEach(revealCard);
  document.querySelectorAll('.answer-key').forEach(function(el) {
    el.style.display = 'block';
  });
}

function hideAllAnswers() {
  document.querySelectorAll('.question-card').forEach(function(card) {
    card.classList.remove('revealed');
    var explanation = card.querySelector('.explanation');
    if (explanation) explanation.style.display = 'none';
    var btn = card.querySelector('.btn-show-answer');
    if (btn) btn.textContent = 'Show Explanation';
  });
  document.querySelectorAll('.answer-key').forEach(function(el) {
    el.style.display = 'none';
  });
}

function filterQuestions() {
  var category = document.getElementById('filterCategory');
  var difficulty = document.getElementById('filterDifficulty');
  var catValue = category ? category.value : 'all';
  var diffValue = difficulty ? difficulty.value : 'all';
  var visible = 0;
  document.querySelectorAll('.question-card').forEach(function(card) {
    var matchCat = catValue === 'all' || card.getAttribute('data-category') === catValue;
    var matchDiff = diffValue === 'all' || card.getAttribute('data-difficulty') === diffValue;
    var show = matchCat && matchDiff;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  var counter = document.getElementById('visibleCount');
  if (counter) counter.textContent = visible;
}

function updateScore() {
  var cards = document.querySelectorAll('.question-card.checked');
  var correct = document.querySelectorAll('.question-card.correct');
  var answeredEl = document.getElementById('scoreAnswered');
  var correctEl = document.getElementById('scoreCorrect');
  if (answeredEl) answeredEl.textContent = String(cards.length);
  if (correctEl) correctEl.textContent = String(correct.length);
}

function toggleAnswerKey() {
  var el = document.querySelector('.answer-key');
  if (!el) return;
  var on = el.style.display !== 'none';
  el.style.display = on ? 'none' : 'block';
}

function buildAnswerKey() {
  var tbody = document.querySelector('.answer-key tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  document.querySelectorAll('.question-card').forEach(function(card) {
    var number = card.querySelector('.question-number');
    var category = card.querySelector('.question-category');
    var difficulty = card.querySelector('.question-difficulty');
    var correctIndex = parseInt(card.getAttribute('data-correct-index'), 10);
    var letters = ['A', 'B', 'C', 'D'];
    var summaryEl = card.querySelector('.explanation p');
    var row = document.createElement('tr');
    row.innerHTML = '<td>' + (number ? number.textContent : '') + '</td>' +
      '<td>' + (category ? category.textContent : '') + '</td>' +
      '<td>' + (difficulty ? difficulty.textContent : '') + '</td>' +
      '<td class="answer-letter">' + letters[correctIndex] + '</td>' +
      '<td>' + (summaryEl ? summaryEl.textContent : '') + '</td>';
    tbody.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  buildAnswerKey();
  updateScore();
  var counter = document.getElementById('visibleCount');
  if (counter) counter.textContent = String(document.querySelectorAll('.question-card').length);
});
`;
}
