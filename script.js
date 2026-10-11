/* Elingua: prototype interaktif (HTML + CSS + JavaScript murni, tanpa library) */
(() => {
'use strict';

/* =====================================================================
   Utilitas
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const rupiah = n => 'Rp' + Number(n).toLocaleString('id-ID');
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const norm = s => String(s).toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const lev = (a, b) => {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
};
const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* =====================================================================
   Ikon dan maskot (SVG inline)
   ===================================================================== */
const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" ${extra}>${d}</svg>`;
const ICON = {
  speaker: svg('<path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/>'),
  mic: svg('<path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11h-2z"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/>'),
  send: svg('<path d="M3 11.5l18-8.5-8.5 18-2.2-7.3L3 11.5z"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'),
  lock: svg('<path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1zm2 0h6V8a3 3 0 0 0-6 0v2z"/>'),
  slow: svg('<path d="M12 4a8 8 0 1 0 8 8h-2a6 6 0 1 1-6-6V4zm1 3h-2v6l5 3 1-1.7-4-2.3V7z"/>'),
  nav: {
    home: svg('<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z"/>'),
    practice: svg('<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>'),
    tutor: svg('<path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4V5a1 1 0 0 1 1-1z"/>'),
    rank: svg('<path d="M4 21V11h4.5v10H4zm5.8 0V3h4.4v18H9.8zM15.5 21v-7H20v7h-4.5z"/>'),
    profile: svg('<circle cx="12" cy="8" r="4.2"/><path d="M4 21c0-4.2 3.8-6.5 8-6.5s8 2.3 8 6.5H4z"/>')
  }
};
function mascot(mood = 'happy', size = 80) {
  const eyes = mood === 'cheer'
    ? '<path d="M36 52q10-11 20 0M64 52q10-11 20 0" stroke="#14213D" stroke-width="4.6" fill="none" stroke-linecap="round"/>'
    : '<circle cx="46" cy="52" r="9" fill="#fff"/><circle cx="74" cy="52" r="9" fill="#fff"/><circle cx="47.5" cy="53" r="4.6" fill="#14213D"/><circle cx="75.5" cy="53" r="4.6" fill="#14213D"/>';
  const mouth = mood === 'think'
    ? '<path d="M52 76h16" stroke="#fff" stroke-width="4.2" stroke-linecap="round"/>'
    : mood === 'cheer'
      ? '<path d="M45 68q15 24 30 0z" fill="#fff"/>'
      : '<path d="M47 71q13 13 26 0" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
  return `<svg class="mascot" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">
    <path d="M36 90L24 114l32-21z" fill="#4F46E5"/>
    <rect x="14" y="18" width="92" height="76" rx="32" fill="#4F46E5"/>
    <path d="M42 22q18-16 36 0z" fill="#FF8A3D"/>
    ${eyes}${mouth}
    <circle cx="33" cy="69" r="5.5" fill="#FF8A3D" opacity=".75"/><circle cx="87" cy="69" r="5.5" fill="#FF8A3D" opacity=".75"/>
  </svg>`;
}

/* =====================================================================
   Suara: pemutar audio (TTS), pengenal ucapan (STT), efek bunyi
   ===================================================================== */
let voices = [];
const loadVoices = () => { try { voices = speechSynthesis.getVoices(); } catch (e) { /* abaikan */ } };
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
const enVoice = () => voices.find(v => /^en[-_]US/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang)) || null;
function say(text, rate = 0.92) {
  if (!('speechSynthesis' in window)) { toast('Audio belum didukung di peramban ini. Coba Chrome atau Safari.'); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    const v = enVoice();
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { /* abaikan */ }
}
const stopSpeech = () => { try { speechSynthesis.cancel(); } catch (e) { /* abaikan */ } };

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listen({ onStart, onResult, onError, onEnd }) {
  if (!SR) { onError && onError('unsupported'); onEnd && onEnd(false); return null; }
  let rec;
  try { rec = new SR(); } catch (e) { onError && onError('unsupported'); onEnd && onEnd(false); return null; }
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;
  let got = false;
  rec.onstart = () => onStart && onStart();
  rec.onresult = e => { got = true; onResult && onResult(e.results[0][0].transcript); };
  rec.onerror = e => { onError && onError(e.error || 'error'); };
  rec.onend = () => { onEnd && onEnd(got); };
  try { rec.start(); } catch (e) { onError && onError('error'); onEnd && onEnd(false); }
  return rec;
}

let audioCtx;
function tone(freq, dur, type = 'sine', gain = 0.06, when = 0) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(audioCtx.destination);
    const t = audioCtx.currentTime + when;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur);
  } catch (e) { /* abaikan */ }
}
const sfx = {
  good() { tone(660, 0.12); tone(880, 0.2, 'sine', 0.06, 0.1); },
  bad() { tone(190, 0.25, 'sawtooth', 0.04); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.06, i * 0.11)); }
};

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function confetti(n = 70) {
  if (reduceMotion) return;
  const app = $('#app');
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#4F46E5', '#FF8A3D', '#17A34A', '#F5B301', '#E5484D', '#0EA5A4'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = pick(colors);
    p.style.animationDelay = Math.random() * 0.5 + 's';
    p.style.animationDuration = 1.8 + Math.random() * 1.4 + 's';
    p.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    box.appendChild(p);
  }
  app.appendChild(box);
  setTimeout(() => box.remove(), 3800);
}

/* =====================================================================
   Data: kurikulum contoh
   ===================================================================== */
const PAST = { go: 'went', eat: 'ate', buy: 'bought', see: 'saw', meet: 'met', play: 'played', watch: 'watched' };

const UNITS = [
  { id: 'u1', title: 'Unit 1', name: 'Perkenalan', color: '#4F46E5', lessons: [
    { id: 'u1l1', title: 'Menyapa', icon: '👋', ex: [
      { t: 'choose', q: 'Pilih arti yang tepat', word: 'Good morning', opts: ['Selamat pagi', 'Selamat malam', 'Terima kasih', 'Sampai jumpa'], ans: 0, why: 'Good morning dipakai dari pagi sampai sebelum tengah hari. Untuk malam hari: good evening.', key: 'Good morning' },
      { t: 'choose', q: 'Pilih arti yang tepat', word: 'Thank you', opts: ['Terima kasih', 'Sama-sama', 'Maaf', 'Silakan'], ans: 0, why: 'Bunyi "th" di awal: ujung lidah di antara gigi, bukan "t" atau "s".', key: 'Thank you' },
      { t: 'order', q: 'Susun kalimat berikut', src: 'Nama saya Budi.', words: ['name', 'My', 'Budi', 'is', 'am', 'the'], ans: ['My', 'name', 'is', 'Budi'], why: 'Kalimat bahasa Inggris wajib punya kata kerja: My name IS Budi.', key: 'My name is Budi' },
      { t: 'type', q: 'Ketik dalam bahasa Inggris', src: 'Apa kabar?', ans: ['how are you'], why: '"How are you?" memakai are, bukan is. Jawaban umum: I am fine, thank you.', key: 'How are you?' },
      { t: 'listen', q: 'Ketik apa yang kamu dengar', say: 'Nice to meet you', ans: ['nice to meet you'], why: '"Meet" berbunyi miit dengan vokal panjang, bukan "mit".', key: 'Nice to meet you' },
      { t: 'spell', q: 'Dengarkan, lalu eja kata ini', say: 'friend', ans: 'friend', hint: 'teman', why: 'Dieja f-r-i-e-n-d dan dibaca "frend": huruf ie di sini berbunyi e.', key: 'friend' },
      { t: 'match', q: 'Pasangkan kata dengan artinya', pairs: [['Hello', 'Halo'], ['Thank you', 'Terima kasih'], ['Goodbye', 'Selamat tinggal'], ['Sorry', 'Maaf']], why: '' }
    ] },
    { id: 'u1l2', title: 'Berkenalan', icon: '🤝', ex: [
      { t: 'order', q: 'Susun kalimat berikut', src: 'Senang bertemu denganmu.', words: ['you', 'to', 'Nice', 'meet', 'see', 'am'], ans: ['Nice', 'to', 'meet', 'you'], why: 'Pola yang sering dipakai: Nice to meet you.', key: 'Nice to meet you' },
      { t: 'type', q: 'Ketik dalam bahasa Inggris', src: 'Saya berasal dari Indonesia.', ans: ['i am from indonesia', "i'm from indonesia", 'i come from indonesia'], why: 'Boleh "I am from" atau "I come from". Jangan lupa kata from.', key: 'I am from Indonesia' },
      { t: 'choose', q: 'Pilih terjemahan yang tepat', word: 'I am twenty years old.', opts: ['Umur saya dua puluh tahun.', 'Saya punya dua puluh tahun.', 'Saya dua puluh tua.', 'Saya berumur dua puluh bulan.'], ans: 0, why: 'Bahasa Inggris memakai "I am 20", bukan "I have 20 years". Ini kesalahan yang sering muncul.', key: 'I am twenty years old' },
      { t: 'speak', q: 'Ucapkan kalimat ini', text: 'Thank you very much', tip: 'Untuk "th", julurkan ujung lidah sedikit di antara gigi lalu hembuskan udara. Jangan diganti "t" atau "s".', key: 'Thank you very much' },
      { t: 'write', q: 'Tulis kata ini dengan tulisan tangan', word: 'thanks', hint: 'terima kasih', say: 'thanks', key: 'thanks' },
      { t: 'listen', q: 'Ketik apa yang kamu dengar', say: 'My name is Dewi', ans: ['my name is dewi'], why: 'Nama orang tetap diawali huruf besar.', key: 'My name is Dewi' }
    ] },
    { id: 'u1l3', title: 'Pamit dan terima kasih', icon: '🙏', ex: [
      { t: 'choose', q: 'Pilih arti yang tepat', word: 'See you tomorrow', opts: ['Sampai jumpa besok', 'Sampai jumpa kemarin', 'Selamat pagi', 'Terima kasih banyak'], ans: 0, why: 'Tomorrow = besok, yesterday = kemarin.', key: 'See you tomorrow' },
      { t: 'type', q: 'Ketik dalam bahasa Inggris', src: 'Terima kasih banyak.', ans: ['thank you very much', 'thanks a lot', 'thank you so much'], why: 'Beberapa jawaban benar diterima.', key: 'Thank you very much' },
      { t: 'listen', q: 'Ketik apa yang kamu dengar', say: 'Have a nice day', ans: ['have a nice day'], why: 'Ucapan perpisahan yang sopan dan umum.', key: 'Have a nice day' },
      { t: 'spell', q: 'Dengarkan, lalu eja kata ini', say: 'goodbye', ans: 'goodbye', hint: 'selamat tinggal', why: 'Dua kata "good" dan "bye" digabung: goodbye.', key: 'goodbye' },
      { t: 'order', q: 'Susun kalimat berikut', src: 'Sampai jumpa nanti.', words: ['later', 'See', 'you', 'tomorrow', 'am'], ans: ['See', 'you', 'later'], why: 'See you later dipakai untuk bertemu lagi hari yang sama.', key: 'See you later' }
    ] }
  ] },
  { id: 'u2', title: 'Unit 2', name: 'Keluarga dan teman', color: '#0EA5A4', premium: true, lessons: [
    { id: 'u2l1', title: 'Anggota keluarga', icon: '👪', ex: [
      { t: 'choose', q: 'Pilih arti yang tepat', word: 'Mother', opts: ['Ibu', 'Ayah', 'Kakak', 'Nenek'], ans: 0, why: 'Bunyi "th" di tengah kata mother adalah "dh" yang bergetar.', key: 'Mother' },
      { t: 'type', q: 'Ketik dalam bahasa Inggris', src: 'Ayah saya seorang guru.', ans: ['my father is a teacher'], why: 'Jangan lupa a sebelum nama pekerjaan: a teacher.', key: 'My father is a teacher' },
      { t: 'spell', q: 'Dengarkan, lalu eja kata ini', say: 'brother', ans: 'brother', hint: 'saudara laki-laki', why: 'Dieja b-r-o-t-h-e-r. Huruf o berbunyi seperti "a" pendek.', key: 'brother' },
      { t: 'listen', q: 'Ketik apa yang kamu dengar', say: 'She is my sister', ans: ['she is my sister'], why: 'Subjek she memakai is.', key: 'She is my sister' },
      { t: 'match', q: 'Pasangkan kata dengan artinya', pairs: [['Mother', 'Ibu'], ['Father', 'Ayah'], ['Sister', 'Saudara perempuan'], ['Brother', 'Saudara laki-laki']], why: '' }
    ] },
    { id: 'u2l2', title: 'Teman dan tetangga', icon: '🏘️', ex: [] }
  ] },
  { id: 'u3', title: 'Unit 3', name: 'Makan dan minum', color: '#F97316', premium: true, lessons: [
    { id: 'u3l1', title: 'Memesan makanan', icon: '🍜', ex: [
      { t: 'choose', q: 'Pilih arti yang tepat', word: 'Rice', opts: ['Nasi', 'Roti', 'Mie', 'Sayur'], ans: 0, why: 'Rice dibaca "rais".', key: 'Rice' },
      { t: 'type', q: 'Ketik dalam bahasa Inggris', src: 'Saya mau segelas air.', ans: ['i want a glass of water', 'i would like a glass of water', "i'd like a glass of water"], why: 'I would like terdengar lebih sopan daripada I want.', key: 'I would like a glass of water' },
      { t: 'listen', q: 'Ketik apa yang kamu dengar', say: 'I would like some tea', ans: ['i would like some tea', "i'd like some tea"], why: 'Singkatan I would menjadi I\'d diterima.', key: 'I would like some tea' },
      { t: 'spell', q: 'Dengarkan, lalu eja kata ini', say: 'chicken', ans: 'chicken', hint: 'ayam', why: 'Dieja c-h-i-c-k-e-n. Huruf ck berbunyi k.', key: 'chicken' },
      { t: 'match', q: 'Pasangkan kata dengan artinya', pairs: [['Rice', 'Nasi'], ['Chicken', 'Ayam'], ['Water', 'Air'], ['Egg', 'Telur']], why: '' }
    ] },
    { id: 'u3l2', title: 'Di restoran', icon: '🍽️', ex: [] }
  ] }
];

const ALL_EX = UNITS.flatMap(u => u.lessons.flatMap(l => l.ex));
const WRITE_WORDS = [{ word: 'thanks', hint: 'terima kasih' }, { word: 'hello', hint: 'halo' }, { word: 'friend', hint: 'teman' }];
const SPEAK_LINES = [
  { text: 'Thank you very much', tip: 'Untuk "th", julurkan ujung lidah sedikit di antara gigi. Jangan diganti "t" atau "s".' },
  { text: 'Nice to meet you', tip: 'Panjangkan bunyi "ii" pada meet dan jangan hilangkan bunyi t di akhir.' },
  { text: 'I think this is fine', tip: 'Kata think dimulai dengan "th" tanpa suara, bukan "tink".' }
];
const VOCAB = [
  { en: 'Good morning', id: 'Selamat pagi' }, { en: 'Thank you', id: 'Terima kasih' }, { en: 'Goodbye', id: 'Selamat tinggal' },
  { en: 'Sorry', id: 'Maaf' }, { en: 'Please', id: 'Tolong' }, { en: 'Welcome', id: 'Selamat datang' },
  { en: 'Friend', id: 'Teman' }, { en: 'Family', id: 'Keluarga' }, { en: 'Mother', id: 'Ibu' },
  { en: 'Father', id: 'Ayah' }, { en: 'Rice', id: 'Nasi' }, { en: 'Water', id: 'Air' },
  { en: 'Chicken', id: 'Ayam' }, { en: 'Egg', id: 'Telur' }, { en: 'Tea', id: 'Teh' }, { en: 'Hello', id: 'Halo' }
];
const CLINIC = [
  { id: 'th', title: 'Bunyi "th"', sub: 'think, three, thank', tip: 'Banyak penutur Indonesia mengucapkan "tink" atau "sink". Letakkan ujung lidah di antara gigi, lalu hembuskan udara tanpa menyentuhkan lidah ke langit-langit.', words: ['think', 'three', 'thank', 'thin', 'mother'] },
  { id: 'final', title: 'Konsonan di akhir kata', sub: 'cold, world, asked', tip: 'Bunyi akhir sering hilang, misalnya "col" untuk cold. Dalam bahasa Inggris bunyi terakhir ikut menentukan arti.', words: ['cold', 'world', 'asked', 'help', 'bed'] },
  { id: 'vf', title: 'Bunyi v dan f', sub: 'very, fairy, five', tip: 'Untuk v, gigi atas menyentuh bibir bawah dan pita suara bergetar. Untuk f, posisi sama tetapi tanpa getaran.', words: ['very', 'fairy', 'five', 'vote', 'fine'] },
  { id: 'ae', title: 'Vokal "a" dan "e"', sub: 'bad dan bed', tip: 'Dalam bahasa Inggris bad dan bed berbeda arti. Untuk "a" buka mulut lebih lebar, untuk "e" bukaan lebih kecil.', words: ['bad', 'bed', 'man', 'men', 'sat'] },
  { id: 'ed', title: 'Akhiran -ed', sub: 'walked, played, wanted', tip: 'Akhiran -ed punya tiga bunyi: "t" pada walked, "d" pada played, dan "id" pada wanted.', words: ['walked', 'played', 'wanted', 'liked'] }
];
const RIVALS = [['Sari', 860], ['Budi', 745], ['Dewi', 690], ['Rizky', 610], ['Putri', 560], ['Agus', 480], ['Maya', 420], ['Tono', 380], ['Lina', 300]];
const PHRASES = {
  'terima kasih': 'Thank you / Thanks',
  'selamat pagi': 'Good morning',
  'sama-sama': "You're welcome",
  'sama sama': "You're welcome",
  'maaf': "I'm sorry / Sorry",
  'permisi': 'Excuse me',
  'sampai jumpa': 'See you / Goodbye',
  'tolong': 'Please help me / Could you help me?',
  'selamat malam': 'Good evening (menyapa) / Good night (pamit tidur)'
};
const FIXES = [
  { re: /\bi (?:am go|go|goed) to ([a-z ]+?) (yesterday|last (?:night|week|month))\b/i, rep: (m, place, t) => `I went to ${place} ${t}`, why: 'Kejadian yang sudah lewat memakai bentuk lampau: go menjadi went. Kata "am" tidak diperlukan.' },
  { re: /\bi am go\b/i, rep: 'I am going', why: 'Setelah "am", kata kerja memakai -ing (I am going). Atau cukup pakai "I go".' },
  { re: /\bi have (\d+) years? old\b/i, rep: (m, n) => `I am ${n} years old`, why: 'Umur memakai am/is/are, bukan have. Ini kesalahan yang sering terjadi.' },
  { re: /\b(yesterday|last (?:night|week|month))\s+(i|we|they|he|she)\s+(go|eat|buy|see|meet|play|watch)\b/i, rep: (m, t, s, v) => `${t} ${s} ${PAST[v.toLowerCase()]}`, why: 'Kejadian yang sudah lewat memakai bentuk lampau: go menjadi went, eat menjadi ate.' },
  { re: /\b(he|she) don't\b/i, rep: (m, s) => `${s} doesn't`, why: 'Untuk he, she, dan it, bentuk negatifnya doesn\'t, bukan don\'t.' },
  { re: /\bmore better\b/i, rep: 'better', why: '"Better" sudah berarti lebih baik. Jangan ditambah "more".' },
  { re: /\bdiscuss about\b/i, rep: 'discuss', why: '"Discuss" sudah berarti membicarakan, jadi tanpa "about".' },
  { re: /\bi very like\b/i, rep: 'I really like', why: '"Very" tidak dipakai langsung sebelum kata kerja. Pakai "really like" atau "like ... very much".' },
  { re: /\bi am agree\b/i, rep: 'I agree', why: '"Agree" sudah kata kerja, jadi tidak perlu "am".' },
  { re: /\bdidn't went\b/i, rep: "didn't go", why: 'Setelah didn\'t, kata kerja kembali ke bentuk dasar: didn\'t go.' }
];

/* =====================================================================
   State (disimpan di perangkat, hanya untuk demo)
   ===================================================================== */
const KEY = 'elingua-demo-v1';
const todayStr = () => ymd(new Date());
function defaults() {
  const t = new Date();
  return { onboarded: false, goal: 'Karier dan kerja', level: 'Pemula', daily: 40, xp: 120, todayXp: 0, todayKey: todayStr(),
    days: [ymd(addDays(t, -3)), ymd(addDays(t, -2)), ymd(addDays(t, -1))], done: {}, premium: false, review: [], plan: 'yearly', method: 'GoPay', clinic: 0 };
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return Object.assign(defaults(), JSON.parse(raw));
  } catch (e) { /* abaikan */ }
  return defaults();
}
let S = load();
if (S.todayKey !== todayStr()) { S.todayKey = todayStr(); S.todayXp = 0; }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* abaikan */ } }
function streak() {
  const set = new Set(S.days);
  let d = new Date(), n = 0;
  if (!set.has(ymd(d))) d = addDays(d, -1);
  while (set.has(ymd(d))) { n++; d = addDays(d, -1); }
  return n;
}
const doneCount = u => u.lessons.filter(l => S.done[l.id]).length;
const lessonsDone = () => Object.keys(S.done).length;
function lessonState(u, i) {
  const l = u.lessons[i];
  if (S.done[l.id]) return 'done';
  if (u.premium && !S.premium) return 'prem';
  let unlocked;
  if (i > 0) unlocked = !!S.done[u.lessons[i - 1].id];
  else {
    const ui = UNITS.indexOf(u);
    unlocked = ui === 0 || S.premium || doneCount(UNITS[ui - 1]) === UNITS[ui - 1].lessons.length;
  }
  return unlocked ? 'current' : 'locked';
}

/* =====================================================================
   Lapisan layar (overlay) dan navigasi
   ===================================================================== */
const L1 = () => $('#layer1');
const L2 = () => $('#layer2');
function openLayer1(html) { L1().innerHTML = html; L1().classList.add('on'); }
function closeLayer1() { L1().classList.remove('on'); L1().innerHTML = ''; LS.ctl = null; stopSpeech(); }
function openModal(html) { L2().innerHTML = html; L2().classList.add('on'); }
function closeModal() { L2().classList.remove('on'); L2().innerHTML = ''; }

let TAB = 'home';
const NAV = [['home', 'Belajar'], ['practice', 'Latihan'], ['tutor', 'Tutor AI'], ['rank', 'Peringkat'], ['profile', 'Profil']];
function renderNav() {
  $('#nav').innerHTML = NAV.map(([k, label]) =>
    `<button class="nav-btn${k === TAB ? ' on' : ''}" data-act="tab" data-tab="${k}" aria-label="${label}"${k === TAB ? ' aria-current="page"' : ''}>${ICON.nav[k]}<span>${label}</span></button>`).join('');
}
function goTab(t) { TAB = t; renderView(); renderNav(); }

/* =====================================================================
   Tampilan tab
   ===================================================================== */
const topStats = () => `<div class="chips"><span class="chip" title="Streak">🔥 <b>${streak()}</b></span><span class="chip" title="Total XP">⭐ <b>${S.xp}</b></span>${S.premium ? '<span class="chip prem">PRO</span>' : ''}</div>`;
const topbar = title => `<header class="topbar"><div class="brand">${title ? `<h1>${title}</h1>` : `${mascot('happy', 30)}<b>Elingua</b>`}</div>${topStats()}</header>`;

function viewHome() {
  const pct = Math.min(100, Math.round(S.todayXp / S.daily * 100));
  const st = streak();
  const first = lessonsDone() === 0;
  let h = topbar('');
  h += `<section class="goal card"><div class="ring" style="--p:${pct}"><span>${pct}%</span></div>
    <div><h3>Target harian</h3><p>${S.todayXp} dari ${S.daily} XP hari ini</p><p class="muted small">Streak ${st} hari. Belajar hari ini untuk menjaganya.</p></div></section>
    <section class="hello">${mascot('happy', 64)}<div class="bubble">${first ? 'Halo! Mulai dari pelajaran pertama ya. Cuma beberapa menit.' : 'Mantap! Lanjutkan jalur belajarmu hari ini.'}</div></section>`;
  UNITS.forEach(u => {
    const locked = u.premium && !S.premium;
    h += `<section class="unit" style="--c:${u.color}"><div class="unit-head"><div><small>${u.title}</small><h2>${u.name}</h2></div>${locked ? '<span class="tag-prem">Premium</span>' : `<span class="unit-prog">${doneCount(u)}/${u.lessons.length}</span>`}</div><div class="path">`;
    u.lessons.forEach((l, i) => {
      const s = lessonState(u, i);
      const off = [0, 40, 58, 40, 0, -40][i % 6];
      const inner = s === 'done' ? ICON.check : s === 'locked' ? ICON.lock : s === 'prem' ? '⭐' : l.icon;
      h += `<div class="node-row" style="--off:${off}px">${s === 'current' ? '<span class="start-tip">MULAI</span>' : ''}<button class="node ${s}" data-act="lesson" data-u="${u.id}" data-i="${i}" aria-label="${esc(l.title)}">${inner}</button><span class="node-label">${esc(l.title)}</span></div>`;
    });
    h += '</div></section>';
  });
  if (!S.premium) h += `<button class="upsell" data-act="paywall"><span>⭐</span><div><b>Buka semua unit dengan Premium</b><small>Mulai Rp25.000 per bulan (paket tahunan)</small></div></button>`;
  return h + '<div class="spacer"></div>';
}

function viewPractice() {
  const due = S.review.length;
  const card = (k, icon, title, sub, tag) => `<button class="pcard" data-act="practice" data-k="${k}"><span class="pi">${icon}</span><div><b>${title}</b><small>${sub}</small></div>${tag ? `<span class="tag ${tag === 'MVP' ? 'tag-mvp' : 'tag-f2'}">${tag}</span>` : ''}</button>`;
  let h = topbar('Latihan');
  h += `<section class="p-grid">
    ${card('review', '🔁', 'Ulangi kata', due ? `${due} kata perlu diulang` : 'Pengulangan terjadwal', 'MVP')}
    ${card('spell', '🔤', 'Ejaan', 'Dengar, lalu eja huruf demi huruf', 'MVP')}
    ${card('listen', '🎧', 'Dengar dan ketik', 'Ketik apa yang kamu dengar', 'MVP')}
    ${card('write', '✍️', 'Tulis tangan', 'Tulis kata di layar sentuh', 'Fase 2')}
    ${card('speak', '🎤', 'Bicara', 'Ucapkan kalimat, dapat skor pelafalan', 'Fase 2')}
  </section>`;
  if (due) h += `<section class="card"><h3>Perlu diulang</h3><div class="wchips">${S.review.slice(0, 8).map(r => `<button class="wchip ghost" data-say="${esc(r.en)}">${esc(r.en)}</button>`).join('')}</div></section>`;
  h += `<h3 class="sec">Klinik pelafalan untuk penutur Indonesia</h3><section class="acc-list">`;
  h += CLINIC.map(c => `<div class="acc" id="acc-${c.id}"><button class="acc-head" data-act="clinic" data-id="${c.id}" aria-expanded="false"><div><b>${c.title}</b><small>${c.sub}</small></div><span class="chev">+</span></button><div class="acc-body"><p>${c.tip}</p><div class="wchips">${c.words.map(w => `<button class="wchip" data-say="${w}" data-clinic="1">${ICON.speaker}${w}</button>`).join('')}</div></div></div>`).join('');
  return h + '</section><div class="spacer"></div>';
}

/* ---- Tutor AI (disimulasikan) ---- */
const T = { msgs: [], mode: 'free', step: 0, init: false, typing: false };
function viewTutor() {
  if (!T.init) {
    T.init = true;
    T.msgs.push({ who: 'bot', text: 'Hi! Saya Kak Lani, tutor AI kamu. Mau latihan apa hari ini? Kamu juga bisa menulis atau merekam suara.' });
  }
  return `<div class="chat">
    <header class="topbar chat-top"><div class="tutor-id">${mascot('happy', 40)}<div><b>Kak Lani</b><small>Tutor AI · mode demo</small></div></div><span class="tag tag-f2">Fase 2-3</span></header>
    <div class="notice">Balasan di layar ini disimulasikan. Di aplikasi nyata, tutor terhubung ke model AI lewat server.</div>
    <div class="msgs" id="msgs">${T.msgs.map(msgHtml).join('')}</div>
    <div class="dock">
      <div class="chipsrow">
        <button class="qchip" data-act="chip" data-k="order">Latihan memesan makanan</button>
        <button class="qchip" data-act="chip" data-k="fix">Koreksi kalimatku</button>
        <button class="qchip" data-act="chip" data-k="perfect">Jelaskan present perfect</button>
        <button class="qchip" data-act="chip" data-k="phrase">Cara bilang dalam Inggris</button>
      </div>
      <form class="chatbar" id="chatform" autocomplete="off">
        <button type="button" class="round" data-act="voice" aria-label="Kirim voice note">${ICON.mic}</button>
        <input id="chatinp" type="text" placeholder="Ketik dalam bahasa Inggris..." autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Pesan">
        <button type="submit" class="round primary" aria-label="Kirim">${ICON.send}</button>
      </form>
    </div>
  </div>`;
}
function msgHtml(m) {
  if (m.who === 'me') {
    if (m.voice) return `<div class="msg me"><div class="voice"><span class="vplay">▶</span><i class="wave"></i><small>${m.voice}</small></div><p>${esc(m.text)}</p></div>`;
    return `<div class="msg me"><p>${esc(m.text)}</p></div>`;
  }
  return `<div class="msg bot"><div class="av">${mascot('happy', 30)}</div><div class="bb">${m.html ? m.html : `<p>${esc(m.text)}</p>`}</div></div>`;
}
const scrollChat = () => { const v = $('#view'); if (v) v.scrollTop = v.scrollHeight; };
function pushMsg(who, m) {
  T.msgs.push(Object.assign({ who }, m));
  const box = $('#msgs');
  if (TAB === 'tutor' && box) { box.insertAdjacentHTML('beforeend', msgHtml(T.msgs[T.msgs.length - 1])); scrollChat(); }
}
function showTyping() {
  const box = $('#msgs');
  if (TAB !== 'tutor' || !box) return;
  if (!$('#typing')) box.insertAdjacentHTML('beforeend', `<div class="msg bot" id="typing"><div class="av">${mascot('think', 30)}</div><div class="bb typing"><i></i><i></i><i></i></div></div>`);
  scrollChat();
}
const hideTyping = () => { const t = $('#typing'); if (t) t.remove(); };
function botSay(list) {
  if (!list.length) { T.typing = false; return; }
  T.typing = true;
  const m = list.shift();
  showTyping();
  const len = (m.text || m.plain || '').length;
  setTimeout(() => { hideTyping(); pushMsg('bot', m); botSay(list); }, 450 + Math.min(900, len * 7));
}
const fixCard = (orig, fixed, why) => ({ plain: why, html: `<div class="fix"><div class="fix-row bad"><span>Kalimatmu</span><s>${esc(orig)}</s></div><div class="fix-row good"><span>Lebih tepat</span><b>${esc(fixed)}</b></div><p>${esc(why)}</p></div>` });
function analyze(text) {
  const out = [];
  FIXES.forEach(f => {
    if (f.re.test(text)) {
      const fixed = text.replace(f.re, f.rep).replace(/^\s*(\w)/, (m, c) => c.toUpperCase());
      out.push(fixCard(text, fixed, f.why));
    }
  });
  return out;
}
function explainPerfect() {
  botSay([{ plain: 'present perfect', html: '<p><b>Present perfect</b> = have/has + kata kerja bentuk ketiga.</p><p>Dipakai untuk pengalaman atau hasil yang masih terasa sekarang: <i>I have eaten</i> (aku sudah makan, dan sekarang kenyang).</p><p>Hati-hati: kata "sudah" dalam bahasa Indonesia tidak selalu present perfect. "Aku makan tadi pagi" lebih tepat <i>I ate this morning</i>.</p>' }]);
}
function tutorChip(k) {
  if (T.typing) return;
  if (k === 'order') {
    T.mode = 'order'; T.step = 0;
    pushMsg('me', { text: 'Latihan memesan makanan' });
    botSay([{ text: 'Seru! Aku jadi pelayan, kamu jadi pelanggan ya.' }, { text: 'Welcome to Warung Elingua! What would you like to order?' }]);
  } else if (k === 'fix') {
    T.mode = 'fix';
    pushMsg('me', { text: 'Koreksi kalimatku' });
    botSay([{ text: 'Boleh. Tulis satu kalimat bahasa Inggris, nanti aku koreksi dan jelaskan dalam bahasa Indonesia. Contoh: Yesterday I go to school.' }]);
  } else if (k === 'perfect') {
    pushMsg('me', { text: 'Jelaskan present perfect' });
    explainPerfect();
  } else if (k === 'phrase') {
    T.mode = 'free';
    pushMsg('me', { text: 'Cara bilang dalam Inggris' });
    botSay([{ text: 'Coba tanya, misalnya: "cara bilang terima kasih" atau "cara bilang permisi".' }]);
  }
}
function orderFlow(text) {
  const polite = /(i('d| would) like|can i (have|get)|could i (have|get)|i'll have)/i.test(text);
  const wants = /\bi want\b/i.test(text);
  if (T.step === 0) {
    const fb = polite ? { text: 'Bagus, kalimatmu sopan dan jelas.' } : wants ? { text: 'Boleh, tapi "I would like..." terdengar lebih sopan daripada "I want...".' } : { text: 'Pesananmu jelas. Untuk lebih sopan, coba mulai dengan "I would like...".' };
    T.step = 1;
    botSay([fb, { text: 'Sure! Would you like something to drink?' }]);
  } else if (T.step === 1) {
    T.step = 2;
    botSay([{ text: 'Noted! Would you like anything else?' }]);
  } else {
    T.mode = 'free'; T.step = 0;
    S.xp += 15; S.todayXp += 15; save();
    botSay([{ text: 'Great. That will be 45,000 rupiah. Please pay at the counter.' },
      { plain: 'selesai', html: '<div class="done-card">Latihan selesai · <b>+15 XP</b></div>' }]);
  }
}
function freeFlow(text) {
  if (/present perfect/i.test(text)) { explainPerfect(); return; }
  const m = text.match(/cara bilang\s+(.+)/i) || text.match(/how (?:do i|to) say\s+(.+)/i);
  if (m) {
    const key = norm(m[1].replace(/[?]/g, '').replace(/ dalam bahasa inggris/i, '').replace(/ bahasa inggrisnya/i, '')).replace(/^'|'$/g, '');
    const hit = Object.keys(PHRASES).find(k => key.includes(norm(k)));
    if (hit) { botSay([{ plain: PHRASES[hit], html: `<p>"${esc(hit)}" dalam bahasa Inggris:</p><p class="big">${esc(PHRASES[hit])}</p>` }, { text: 'Mau coba mengucapkannya? Tekan tombol mikrofon dan ucapkan.' }]); return; }
    botSay([{ text: 'Belum ada di contoh demo ini. Di aplikasi nyata, tutor AI bisa menjawab ungkapan apa pun.' }]); return;
  }
  const fixes = analyze(text);
  if (fixes.length) { botSay([{ text: 'Hampir benar! Ada yang bisa diperbaiki.' }, ...fixes]); return; }
  const indo = /\b(apa|saya|aku|tidak|bagaimana|bisa|mau|kamu|kenapa|dan|yang)\b/i.test(text);
  if (indo) botSay([{ text: 'Coba jawab dalam bahasa Inggris ya. Kalau bingung, tanya: "cara bilang ..." atau pilih salah satu latihan di bawah.' }]);
  else botSay([{ text: pick(['Terlihat benar. Coba tambah detail: kapan, di mana, atau kenapa?', 'Bagus! Kalimatmu mudah dipahami. Mau coba kalimat yang lebih panjang?', 'Tepat. Coba ulangi dengan kata kerja bentuk lampau supaya latihan tensesmu bertambah.']) }]);
}
function fixFlow(text) {
  const fixes = analyze(text);
  if (fixes.length) botSay([{ text: 'Ketemu kesalahan yang umum.' }, ...fixes, { text: 'Coba tulis kalimat lain!' }]);
  else botSay([{ text: 'Kalimatmu sudah benar. Coba kalimat lain, mungkin dengan kata kerja bentuk lampau.' }]);
}
function handleUser(text) {
  if (T.mode === 'order') orderFlow(text);
  else if (T.mode === 'fix') fixFlow(text);
  else freeFlow(text);
}
function sendChat(textOverride, voice) {
  const inp = $('#chatinp');
  const text = (textOverride || (inp ? inp.value : '')).trim();
  if (!text || T.typing) return;
  if (inp) inp.value = '';
  pushMsg('me', voice ? { text, voice } : { text });
  handleUser(text);
}
function voiceNote() {
  if (T.typing) return;
  const btn = $('[data-act="voice"]');
  const simulate = () => { toast('Mikrofon tidak tersedia, memakai contoh suara.'); sendChat(pick(['I would like a cup of tea, please', 'Yesterday I go to the market', 'Thank you very much']), '0:03'); };
  if (!SR) { simulate(); return; }
  if (btn) btn.classList.add('rec');
  toast('Mendengarkan... bicaralah dalam bahasa Inggris');
  let ok = false;
  listen({
    onResult: t => { ok = true; sendChat(t, '0:04'); },
    onError: err => { if (err === 'not-allowed' || err === 'service-not-allowed' || err === 'unsupported') { ok = true; simulate(); } else if (err === 'no-speech') toast('Tidak terdengar. Coba lagi.'); },
    onEnd: () => { if (btn) btn.classList.remove('rec'); if (!ok) { /* tidak ada hasil */ } }
  });
}

function viewRank() {
  const me = ['Kamu', S.xp];
  const list = RIVALS.concat([me]).sort((a, b) => b[1] - a[1]);
  const myPos = list.findIndex(r => r === me) + 1;
  let h = topbar('Peringkat');
  h += `<section class="league card"><div class="medal">🥉</div><div><h3>Liga Perunggu</h3><p>Kamu di peringkat <b>${myPos}</b> minggu ini. Lima besar naik ke Liga Perak.</p></div></section>
  <div class="tag tag-f2 inline-tag">Fase 2 · pratinjau</div>
  <ol class="rank">${list.map((r, i) => `<li class="${r === me ? 'me' : ''}"><span class="pos">${i === 0 ? '👑' : i + 1}</span><span class="av2" style="--h:${(r[0].charCodeAt(0) * 37) % 360}">${esc(r[0][0])}</span><b>${esc(r[0])}</b><span class="xp">${r[1]} XP</span></li>`).join('')}</ol>`;
  return h + '<div class="spacer"></div>';
}

function viewProfile() {
  const st = streak();
  const set = new Set(S.days);
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = addDays(new Date(), -i); days.push({ l: ['M', 'S', 'S', 'R', 'K', 'J', 'S'][d.getDay()], on: set.has(ymd(d)), today: i === 0 }); }
  const badges = [
    { n: 'Langkah pertama', d: 'Selesaikan 1 pelajaran', on: lessonsDone() >= 1, i: '🌱' },
    { n: '7 hari beruntun', d: 'Belajar 7 hari berturut-turut', on: st >= 7, i: '🔥' },
    { n: '500 XP', d: 'Kumpulkan 500 XP', on: S.xp >= 500, i: '⭐' },
    { n: 'Jagoan pelafalan', d: 'Coba 5 kata di klinik pelafalan', on: S.clinic >= 5, i: '🗣️' }
  ];
  let h = topbar('Profil');
  h += `<section class="me-card card"><div class="avatar">K</div><div><h2>Kamu</h2><p class="muted">${esc(S.goal)} · ${esc(S.level)}</p></div></section>
  <section class="stats4"><div class="stat"><small>Streak</small><b>🔥 ${st}</b></div><div class="stat"><small>Total XP</small><b>⭐ ${S.xp}</b></div><div class="stat"><small>Pelajaran</small><b>${lessonsDone()}</b></div><div class="stat"><small>Perlu diulang</small><b>${S.review.length}</b></div></section>
  <section class="card"><h3>7 hari terakhir</h3><div class="week">${days.map(d => `<div class="day${d.on ? ' on' : ''}${d.today ? ' today' : ''}"><span>${d.l}</span><i>${d.on ? '🔥' : ''}</i></div>`).join('')}</div></section>
  <h3 class="sec">Lencana</h3><section class="badges">${badges.map(b => `<div class="badge${b.on ? ' on' : ''}"><span>${b.on ? b.i : '🔒'}</span><b>${b.n}</b><small>${b.d}</small></div>`).join('')}</section>
  <section class="card plan"><div><h3>${S.premium ? 'Premium aktif' : 'Paket Gratis'}</h3><p class="muted">${S.premium ? `Paket ${S.plan === 'yearly' ? 'tahunan' : 'bulanan'}. Semua unit terbuka.` : 'Unit 1 gratis. Unit lain butuh Premium.'}</p></div>${S.premium ? '' : '<button class="btn btn-accent" data-act="paywall">Upgrade</button>'}</section>
  <button class="btn btn-ghost btn-block" data-act="reset">Atur ulang demo</button><div class="spacer"></div>`;
  return h;
}

const VIEWS = { home: viewHome, practice: viewPractice, tutor: viewTutor, rank: viewRank, profile: viewProfile };
function renderView() {
  const v = $('#view');
  v.className = 'view v-' + TAB;
  v.innerHTML = VIEWS[TAB]();
  v.scrollTop = TAB === 'tutor' ? v.scrollHeight : 0;
}

/* =====================================================================
   Mesin pelajaran
   ===================================================================== */
const LS = { cfg: null, i: 0, n: 0, ok: 0, xp: 0, combo: 0, maxCombo: 0, started: 0, ctl: null, wrong: [], skipped: 0, checked: false };

function openLesson(cfg) {
  Object.assign(LS, { cfg, i: 0, n: cfg.ex.length, ok: 0, xp: 0, combo: 0, maxCombo: 0, started: Date.now(), ctl: null, wrong: [], skipped: 0, checked: false });
  openLayer1(`<div class="lesson" style="--c:${cfg.color || '#4F46E5'}">
    <header class="l-top"><button class="icon-btn" data-act="quit" aria-label="Keluar dari pelajaran">${ICON.close}</button><div class="bar" role="progressbar" aria-label="Kemajuan pelajaran"><i id="bar"></i></div><div class="combo" id="combo" hidden>🔥 <b id="comboN">0</b></div></header>
    <div class="l-body" id="lbody"></div>
    <footer class="l-foot" id="lfoot"></footer>
  </div>`);
  renderEx();
}
const ready = on => { const b = $('#check'); if (b) b.disabled = !on; };
function renderEx() {
  const ex = LS.cfg.ex[LS.i];
  LS.checked = false;
  $('#bar').style.width = (LS.i / LS.n * 100) + '%';
  $('#comboN').textContent = LS.combo;
  $('#combo').hidden = LS.combo < 2;
  const body = $('#lbody');
  body.scrollTop = 0;
  const box = document.createElement('div');
  box.className = 'ex ex-' + ex.t;
  body.replaceChildren(box);
  $('#lfoot').innerHTML = '<button class="btn btn-primary btn-block" id="check" data-act="check" disabled>Periksa</button>';
  LS.ctl = TYPES[ex.t](ex, box);
}
function doCheck() {
  if (LS.checked || !LS.ctl) return;
  const ex = LS.cfg.ex[LS.i];
  const r = LS.ctl.check();
  LS.checked = true;
  const box = $('#lbody .ex');
  if (box) box.classList.add('locked');
  $$('#lbody input, #lbody textarea').forEach(i => { i.disabled = true; });
  const good = r.ok;
  if (good) {
    LS.ok++; LS.combo++; LS.maxCombo = Math.max(LS.maxCombo, LS.combo);
    LS.xp += 10 + (LS.combo >= 3 ? 2 : 0);
    sfx.good();
  } else {
    LS.combo = 0; LS.wrong.push(ex);
    if (ex.key && !S.review.some(r2 => r2.en === ex.key)) S.review.push({ en: ex.key });
    sfx.bad();
  }
  $('#comboN').textContent = LS.combo;
  $('#combo').hidden = LS.combo < 2;
  const why = r.note || ex.why || '';
  $('#lfoot').innerHTML = `<div class="fb ${good ? 'good' : 'bad'}" role="status">
    <div class="fb-h"><span class="fb-i">${good ? ICON.check : ICON.close}</span>${good ? pick(['Benar!', 'Mantap!', 'Tepat sekali!', 'Keren!']) : 'Belum tepat'}</div>
    ${!good && r.ans ? `<div class="fb-ans">Jawaban benar: <b>${esc(r.ans)}</b></div>` : ''}
    ${why ? `<div class="fb-why">${esc(why)}</div>` : ''}
    <button class="btn ${good ? 'btn-good' : 'btn-bad'} btn-block" id="next" data-act="next">Lanjut</button></div>`;
  const nx = $('#next'); if (nx) nx.focus();
}
function nextEx() {
  LS.i++;
  if (LS.i >= LS.n) finishLesson(); else renderEx();
}
function skipEx() { LS.skipped++; nextEx(); }

/* ---- jenis latihan ---- */
const TYPES = {
  choose(ex, box) {
    box.innerHTML = `<h2 class="q">${esc(ex.q)}</h2>
      <div class="word-card"><button class="say" data-say="${esc(ex.say || ex.word)}" aria-label="Putar audio">${ICON.speaker}</button><span class="word">${esc(ex.word)}</span></div>
      <div class="opts">${ex.opts.map((o, i) => `<button class="opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>`;
    let sel = -1;
    const choose = i => { sel = i; $$('.opt', box).forEach((x, k) => x.classList.toggle('sel', k === i)); ready(true); };
    box.addEventListener('click', e => { const b = e.target.closest('.opt'); if (b && !box.classList.contains('locked')) choose(+b.dataset.i); });
    return {
      key(k) { if (/^[1-4]$/.test(k) && +k <= ex.opts.length) choose(+k - 1); },
      check() { $$('.opt', box).forEach((x, k) => { if (k === ex.ans) x.classList.add('right'); else if (k === sel) x.classList.add('wrong'); }); return { ok: sel === ex.ans, ans: ex.opts[ex.ans] }; }
    };
  },

  order(ex, box) {
    box.innerHTML = `<h2 class="q">${esc(ex.q)}</h2>
      <div class="src-card">${mascot('happy', 46)}<p>${esc(ex.src)}</p></div>
      <div class="answer" id="aline" aria-label="Susunan jawaban"></div><div class="bank" id="bank"></div>`;
    const bank = shuffle(ex.words.map((w, i) => i));
    let picked = [];
    const draw = () => {
      $('#aline', box).innerHTML = picked.map(i => `<button class="wchip" data-i="${i}">${esc(ex.words[i])}</button>`).join('');
      $('#bank', box).innerHTML = bank.map(i => `<button class="wchip${picked.includes(i) ? ' used' : ''}" data-i="${i}" ${picked.includes(i) ? 'disabled' : ''}>${esc(ex.words[i])}</button>`).join('');
      ready(picked.length > 0);
    };
    box.addEventListener('click', e => {
      const b = e.target.closest('.wchip');
      if (!b || box.classList.contains('locked')) return;
      const i = +b.dataset.i;
      if (b.closest('#aline')) picked = picked.filter(x => x !== i); else if (!picked.includes(i)) picked.push(i);
      draw();
    });
    draw();
    return { check() { const got = picked.map(i => ex.words[i]).join(' '); return { ok: got === ex.ans.join(' '), ans: ex.ans.join(' ') }; } };
  },

  type(ex, box) {
    box.innerHTML = `<h2 class="q">${esc(ex.q)}</h2>
      <div class="src-card">${mascot('happy', 46)}<p>${esc(ex.src)}</p></div>
      <div class="field"><input id="inp" type="text" placeholder="Ketik jawabanmu dalam bahasa Inggris" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Jawaban"><button type="button" class="mic-mini" data-act="dictate" aria-label="Jawab dengan suara">${ICON.mic}</button></div>
      <p class="hint">Bisa diketik atau diucapkan. Mengetik melatih ejaan dan ingatan lebih kuat.</p>`;
    const inp = $('#inp', box);
    inp.addEventListener('input', () => ready(inp.value.trim().length > 0));
    setTimeout(() => { try { inp.focus(); } catch (e) { /* abaikan */ } }, 60);
    return {
      check() {
        const v = norm(inp.value), accepted = ex.ans.map(norm);
        if (accepted.includes(v)) return { ok: true, ans: ex.ans[0] };
        const near = accepted.find(a => a.length >= 8 && lev(a, v) <= 1);
        if (near) return { ok: true, ans: ex.ans[0], note: 'Ada salah ketik kecil, jawabanmu tetap diterima.' };
        return { ok: false, ans: ex.ans[0] };
      }
    };
  },

  listen(ex, box) {
    box.innerHTML = `<h2 class="q">${esc(ex.q)}</h2>
      <div class="listen-row"><button class="say big" data-say="${esc(ex.say)}" aria-label="Putar audio">${ICON.speaker}</button><button class="say slow" data-say="${esc(ex.say)}" data-rate="0.55" aria-label="Putar pelan">${ICON.slow}<span>Pelan</span></button></div>
      <div class="field"><input id="inp" type="text" placeholder="Ketik yang kamu dengar" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Jawaban"></div>`;
    const inp = $('#inp', box);
    inp.addEventListener('input', () => ready(inp.value.trim().length > 0));
    setTimeout(() => say(ex.say), 350);
    return {
      check() {
        const v = norm(inp.value), accepted = ex.ans.map(norm);
        const ok = accepted.includes(v) || accepted.some(a => a.length >= 8 && lev(a, v) <= 1);
        return { ok, ans: ex.say };
      }
    };
  },

  spell(ex, box) {
    const word = ex.ans;
    box.innerHTML = `<h2 class="q">${esc(ex.q)}</h2>
      <div class="listen-row"><button class="say big" data-say="${esc(ex.say)}" aria-label="Putar audio">${ICON.speaker}</button></div>
      <p class="hint">Arti: <b>${esc(ex.hint || '')}</b></p>
      <div class="letters" id="letters">${word.split('').map(() => '<span class="lbox"></span>').join('')}</div>
      <div class="field"><input id="inp" type="text" maxlength="${word.length + 3}" placeholder="Ketik ejaannya" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Ejaan"></div>`;
    const inp = $('#inp', box);
    const boxes = $$('.lbox', box);
    inp.addEventListener('input', () => {
      const v = inp.value.toLowerCase().replace(/[^a-z]/g, '');
      boxes.forEach((b, i) => { b.textContent = v[i] || ''; b.classList.toggle('on', !!v[i]); });
      ready(v.length > 0);
    });
    setTimeout(() => say(ex.say), 350);
    return {
      check() {
        const v = inp.value.toLowerCase().replace(/[^a-z]/g, '');
        boxes.forEach((b, i) => b.classList.add(v[i] === word[i] ? 'right' : 'wrong'));
        return { ok: v === word, ans: word.split('').join('-') };
      }
    };
  },

  match(ex, box) {
    const L = shuffle(ex.pairs.map((p, i) => ({ t: p[0], i }))), R = shuffle(ex.pairs.map((p, i) => ({ t: p[1], i })));
    box.innerHTML = `<h2 class="q">${esc(ex.q)}</h2>
      <div class="match"><div class="mcol">${L.map(x => `<button class="mbtn" data-s="l" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div><div class="mcol">${R.map(x => `<button class="mbtn" data-s="r" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div></div>`;
    let sel = null, wrong = 0, matched = 0;
    box.addEventListener('click', e => {
      const b = e.target.closest('.mbtn');
      if (!b || b.disabled || box.classList.contains('locked')) return;
      if (b.dataset.s === 'l') say(ex.pairs[+b.dataset.i][0]);
      if (!sel || sel.dataset.s === b.dataset.s) {
        if (sel) sel.classList.remove('sel');
        sel = b; b.classList.add('sel');
        return;
      }
      if (sel.dataset.i === b.dataset.i) {
        [sel, b].forEach(x => { x.classList.remove('sel'); x.classList.add('right'); x.disabled = true; });
        matched++;
        if (matched === ex.pairs.length) ready(true);
      } else {
        wrong++;
        [sel, b].forEach(x => { x.classList.add('shake'); setTimeout(() => x.classList.remove('shake'), 400); });
        sel.classList.remove('sel');
      }
      sel = null;
    });
    return { check() { return { ok: wrong <= 3, ans: '' }; } };
  },

  speak(ex, box) {
    box.innerHTML = `<div class="phase-tag">Fase 2 · pratinjau</div><h2 class="q">${esc(ex.q)}</h2>
      <div class="src-card big"><p class="say-text">${esc(ex.text)}</p><button class="say" data-say="${esc(ex.text)}" aria-label="Putar contoh">${ICON.speaker}</button></div>
      <div class="mic-wrap"><button class="mic" id="mic" aria-label="Tekan lalu bicara">${ICON.mic}</button><p class="hint" id="micState">Tekan mikrofon, lalu ucapkan kalimat di atas.</p></div>
      <div id="sresult"></div>
      <button class="link" data-act="skip">Lewati latihan ini</button>`;
    let score = null, busy = false;
    const show = (spoken, sc) => {
      const r = pronScore(ex.text, spoken);
      score = sc != null ? sc : r.score;
      $('#sresult', box).innerHTML = `<div class="score ${score >= 60 ? 'good' : 'bad'}"><div class="meter"><i style="width:${score}%"></i></div><b>${score}/100</b>
        <p class="heard">Terdengar: <i>${esc(spoken || '(tidak terdengar)')}</i></p>
        <div class="wchips">${r.words.map(w => `<span class="wchip ${w.ok ? 'ok' : 'miss'}">${esc(w.w)}</span>`).join('')}</div>
        <p class="tip">${esc(ex.tip || '')}</p></div>`;
      $('#micState', box).textContent = 'Tekan lagi untuk mencoba ulang.';
      ready(true);
    };
    const simulate = () => {
      const words = ex.text.split(' ');
      const spoken = words.map((w, i) => (i === 0 && /^th/i.test(w)) ? w.replace(/^th/i, 't') : w).join(' ');
      show(spoken);
    };
    const mic = $('#mic', box);
    mic.addEventListener('click', () => {
      if (busy) return;
      busy = true;
      let finished = false;
      listen({
        onStart() { mic.classList.add('on'); $('#micState', box).textContent = 'Mendengarkan...'; },
        onResult(t) { finished = true; show(t); },
        onError(err) {
          finished = true;
          if (err === 'no-speech') $('#micState', box).textContent = 'Tidak terdengar. Coba lagi.';
          else { $('#micState', box).textContent = 'Mikrofon tidak tersedia. Memakai contoh hasil.'; simulate(); }
        },
        onEnd() { mic.classList.remove('on'); busy = false; if (!finished) $('#micState', box).textContent = 'Tidak terdengar. Coba lagi.'; }
      });
    });
    box.simulate = simulate;
    return { check() { return { ok: score !== null && score >= 60, ans: ex.text }; }, simulate };
  },

  write(ex, box) {
    box.innerHTML = `<div class="phase-tag">Fase 2 · pratinjau</div><h2 class="q">${esc(ex.q)}</h2>
      <div class="src-card"><p>Tulis <b>${esc(ex.hint || '')}</b> mengikuti garis abu-abu</p><button class="say" data-say="${esc(ex.say || ex.word)}" aria-label="Putar audio">${ICON.speaker}</button></div>
      <div class="pad" id="pad"><canvas id="ghost"></canvas><canvas id="ink"></canvas></div>
      <div class="pad-actions"><button class="btn btn-ghost" data-act="clearpad">Hapus</button></div>
      <p class="hint">Tulis dengan jari atau mouse. Di aplikasi Android, tulisan dikenali otomatis.</p>
      <button class="link" data-act="skip">Lewati latihan ini</button>`;
    const pad = $('#pad', box), ghost = $('#ghost', box), ink = $('#ink', box);
    let w = 0, h = 0, dpr = 1, strokes = 0, drawing = false, last = null, gctx, ictx;
    const setup = () => {
      w = pad.clientWidth || 320; h = pad.clientHeight || 200;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      [ghost, ink].forEach(c => { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.style.width = w + 'px'; c.style.height = h + 'px'; });
      gctx = ghost.getContext('2d', { willReadFrequently: true }); ictx = ink.getContext('2d', { willReadFrequently: true });
      gctx.scale(dpr, dpr); ictx.scale(dpr, dpr);
      gctx.fillStyle = '#C9CFE6';
      gctx.textAlign = 'center'; gctx.textBaseline = 'middle';
      let size = 96;
      gctx.font = `900 ${size}px Nunito, Arial, sans-serif`;
      while (gctx.measureText(ex.word).width > w - 40 && size > 40) { size -= 4; gctx.font = `900 ${size}px Nunito, Arial, sans-serif`; }
      gctx.fillText(ex.word, w / 2, h / 2 + 4);
      ictx.lineWidth = 15; ictx.lineCap = 'round'; ictx.lineJoin = 'round'; ictx.strokeStyle = '#4F46E5';
    };
    requestAnimationFrame(setup);
    const pos = e => { const r = ink.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    ink.addEventListener('pointerdown', e => { if (box.classList.contains('locked')) return; drawing = true; last = pos(e); try { ink.setPointerCapture(e.pointerId); } catch (er) { /* abaikan */ } ictx.beginPath(); ictx.arc(last.x, last.y, 0.1, 0, 7); ictx.stroke(); e.preventDefault(); });
    ink.addEventListener('pointermove', e => { if (!drawing) return; const p = pos(e); ictx.beginPath(); ictx.moveTo(last.x, last.y); ictx.lineTo(p.x, p.y); ictx.stroke(); last = p; });
    const end = () => { if (drawing) { drawing = false; strokes++; ready(true); } };
    ink.addEventListener('pointerup', end); ink.addEventListener('pointercancel', end);
    const clear = () => { ictx.save(); ictx.setTransform(1, 0, 0, 1, 0, 0); ictx.clearRect(0, 0, ink.width, ink.height); ictx.restore(); strokes = 0; ready(false); };
    const coverage = () => {
      const g = gctx.getImageData(0, 0, ghost.width, ghost.height).data, d = ictx.getImageData(0, 0, ink.width, ink.height).data;
      let total = 0, hit = 0, inkPx = 0;
      for (let y = 0; y < ghost.height; y += 3) for (let x = 0; x < ghost.width; x += 3) {
        const i = (y * ghost.width + x) * 4 + 3;
        if (g[i] > 100) { total++; if (d[i] > 100) hit++; }
        if (d[i] > 100) inkPx++;
      }
      return { cov: total ? hit / total : 0, ratio: total ? inkPx / total : 0 };
    };
    box.clear = clear;
    box.autoTrace = () => { ictx.save(); ictx.setTransform(1, 0, 0, 1, 0, 0); ictx.drawImage(ghost, 0, 0); ictx.globalCompositeOperation = 'source-in'; ictx.fillStyle = '#4F46E5'; ictx.fillRect(0, 0, ink.width, ink.height); ictx.restore(); strokes = 1; ready(true); };
    return {
      clear,
      check() { const c = coverage(); return { ok: c.cov >= 0.4 && c.ratio < 4, ans: ex.word, note: c.cov >= 0.4 ? (c.ratio >= 4 ? '' : 'Tulisanmu mengikuti garis dengan baik.') : 'Ikuti garis abu-abu dari awal sampai akhir kata.' }; }
    };
  }
};

function pronScore(target, spoken) {
  const t = norm(target).split(' ').filter(Boolean), s = norm(spoken).split(' ').filter(Boolean);
  if (!s.length) return { score: 0, words: t.map(w => ({ w, ok: false })) };
  const words = t.map(w => ({ w, ok: s.some(x => x === w || lev(x, w) <= (w.length > 5 ? 1 : 0)) }));
  const wordRatio = words.filter(x => x.ok).length / t.length;
  const a = norm(target), b = norm(spoken);
  const sim = 1 - lev(a, b) / Math.max(a.length, b.length);
  return { score: Math.max(0, Math.min(100, Math.round(100 * (0.6 * wordRatio + 0.4 * Math.max(0, sim))))), words };
}

/* ---- hasil pelajaran ---- */
function finishLesson() {
  const cfg = LS.cfg;
  const answered = Math.max(1, LS.n - LS.skipped);
  const acc = Math.round(LS.ok / answered * 100);
  const bonus = acc >= 80 ? 20 : 10;
  const total = LS.xp + bonus;
  const secs = Math.round((Date.now() - LS.started) / 1000);
  S.xp += total; S.todayXp += total;
  if (!S.days.includes(todayStr())) S.days.push(todayStr());
  S.days = S.days.slice(-30);
  if (cfg.lessonId) S.done[cfg.lessonId] = true;
  if (cfg.clearReview) S.review = [];
  save();
  const u1done = doneCount(UNITS[0]) === UNITS[0].lessons.length;
  const upsell = !S.premium && cfg.lessonId && u1done && cfg.unit === 'u1';
  sfx.win();
  openLayer1(`<div class="result">
    <div class="res-top">${mascot('cheer', 120)}<h1>${cfg.lessonId ? 'Pelajaran selesai!' : 'Latihan selesai!'}</h1><p>${esc(cfg.title)}</p></div>
    <div class="res-stats"><div class="stat orange"><small>XP didapat</small><b>+${total}</b></div><div class="stat blue"><small>Akurasi</small><b>${acc}%</b></div><div class="stat green"><small>Waktu</small><b>${Math.floor(secs / 60)}:${pad(secs % 60)}</b></div></div>
    <div class="streak-card">🔥 <div><b>Streak ${streak()} hari</b><small>${LS.maxCombo >= 3 ? `Beruntun terbaik di sesi ini: ${LS.maxCombo} jawaban benar.` : 'Belajar lagi besok untuk menambah streak.'}</small></div></div>
    ${LS.wrong.length ? `<div class="card"><h3>Perlu diulang</h3><div class="wchips">${LS.wrong.map(w => `<span class="wchip ghost">${esc(w.key || w.word || w.text || w.say || 'Pasangkan kata')}</span>`).join('')}</div><p class="muted small">Disimpan ke jadwal pengulangan.</p></div>` : ''}
    ${upsell ? `<button class="upsell" data-act="paywall"><span>⭐</span><div><b>Unit 1 selesai! Buka Unit 2 dan 3</b><small>Dengan Premium mulai Rp25.000 per bulan</small></div></button>` : ''}
    <footer class="res-foot"><button class="btn btn-primary btn-block" data-act="home">Lanjut</button></footer>
  </div>`);
  confetti(80);
}

/* ---- sesi latihan cepat ---- */
function makeChoose(v) {
  const others = shuffle(VOCAB.filter(x => x.id !== v.id)).slice(0, 3).map(x => x.id);
  const opts = shuffle([v.id, ...others]);
  return { t: 'choose', q: 'Pilih arti yang tepat', word: v.en, opts, ans: opts.indexOf(v.id), why: '', key: v.en };
}
const makeType = v => ({ t: 'type', q: 'Ketik dalam bahasa Inggris', src: v.id, ans: [v.en], why: '', key: v.en });
function startPractice(k) {
  let ex = [], title = 'Latihan', clearReview = false;
  if (k === 'review') {
    const prior = S.review.map(r => VOCAB.find(v => norm(v.en) === norm(r.en))).filter(Boolean);
    const items = prior.concat(shuffle(VOCAB.filter(v => !prior.includes(v)))).slice(0, 6);
    ex = items.map((v, i) => i % 2 ? makeType(v) : makeChoose(v));
    title = 'Ulangi kata'; clearReview = true;
  } else if (k === 'spell') { ex = shuffle(ALL_EX.filter(e => e.t === 'spell')).slice(0, 4); title = 'Ejaan'; }
  else if (k === 'listen') { ex = shuffle(ALL_EX.filter(e => e.t === 'listen')).slice(0, 4); title = 'Dengar dan ketik'; }
  else if (k === 'write') { ex = WRITE_WORDS.map(w => ({ t: 'write', q: 'Tulis kata ini dengan tulisan tangan', word: w.word, hint: w.hint, say: w.word, key: w.word })); title = 'Tulis tangan'; }
  else if (k === 'speak') { ex = SPEAK_LINES.map(s => ({ t: 'speak', q: 'Ucapkan kalimat ini', text: s.text, tip: s.tip, key: s.text })); title = 'Bicara'; }
  openLesson({ title, ex, color: '#4F46E5', clearReview });
}

/* =====================================================================
   Pembayaran / langganan (simulasi)
   ===================================================================== */
const PLANS = { yearly: { name: 'Tahunan', price: 299000, per: 'tahun', note: 'Setara sekitar Rp25.000 per bulan', badge: 'Hemat 36%' }, monthly: { name: 'Bulanan', price: 39000, per: 'bulan', note: 'Batal kapan saja', badge: '' } };
const METHODS = ['GoPay', 'DANA', 'OVO', 'ShopeePay', 'Transfer bank (Virtual Account)', 'Pulsa operator', 'Kartu debit atau kredit'];
function openPaywall(reason) {
  const head = reason === 'unit' ? 'Unit ini khusus Premium' : 'Belajar tanpa batas dengan Premium';
  openModal(`<div class="sheet paywall" role="dialog" aria-modal="true" aria-label="Premium">
    <button class="icon-btn close" data-act="closeModal" aria-label="Tutup">${ICON.close}</button>
    <div class="pw-hero">${mascot('cheer', 84)}<h2>${head}</h2></div>
    <ul class="benefits"><li>Semua unit dan pelajaran terbuka</li><li>Latihan bicara dan tulis tangan dengan penilaian (Fase 2)</li><li>Tutor AI untuk tanya jawab dan percakapan (Fase 2-3)</li><li>Pengulangan cerdas tanpa batas</li></ul>
    <div class="plans">${Object.entries(PLANS).map(([k, p]) => `<label class="plan${S.plan === k ? ' sel' : ''}"><input type="radio" name="plan" value="${k}" ${S.plan === k ? 'checked' : ''}><div><b>${p.name}</b><small>${p.note}</small></div><div class="pr"><b>${rupiah(p.price)}</b><small>per ${p.per}</small></div>${p.badge ? `<span class="ribbon">${p.badge}</span>` : ''}</label>`).join('')}</div>
    <button class="btn btn-accent btn-block" data-act="pw-next">Lanjut ke pembayaran</button>
    <p class="muted small center">Harga hanya contoh untuk prototype.</p></div>`);
}
function paywallMethods() {
  const p = PLANS[S.plan];
  openModal(`<div class="sheet paywall" role="dialog" aria-modal="true" aria-label="Metode pembayaran">
    <button class="icon-btn close" data-act="closeModal" aria-label="Tutup">${ICON.close}</button>
    <h2>Pilih metode pembayaran</h2>
    <div class="sum"><span>Premium ${p.name}</span><b>${rupiah(p.price)}</b></div>
    <div class="methods">${METHODS.map(m => `<label class="method${S.method === m ? ' sel' : ''}"><input type="radio" name="method" value="${esc(m)}" ${S.method === m ? 'checked' : ''}><span>${esc(m)}</span></label>`).join('')}</div>
    <button class="btn btn-accent btn-block" data-act="pw-pay">Bayar ${rupiah(p.price)}</button>
    <p class="muted small center">Contoh tampilan. Di aplikasi nyata, pembayaran diproses lewat Google Play Billing.</p></div>`);
}
function paywallProcessing() {
  openModal(`<div class="sheet paywall center"><div class="spinner" aria-hidden="true"></div><h2>Memproses pembayaran...</h2><p class="muted">Mohon tunggu sebentar.</p></div>`);
  setTimeout(() => {
    S.premium = true; save();
    openModal(`<div class="sheet paywall center" role="dialog" aria-modal="true">${mascot('cheer', 110)}<h2>Premium aktif!</h2><p class="muted">Semua unit sudah terbuka. Selamat belajar!</p><button class="btn btn-primary btn-block" data-act="pw-done">Lihat jalur belajar</button></div>`);
    sfx.win(); confetti(90);
  }, reduceMotion ? 300 : 1600);
}

/* =====================================================================
   Onboarding
   ===================================================================== */
const OB = [
  { k: 'welcome' },
  { k: 'goal', q: 'Kenapa kamu belajar bahasa Inggris?', opts: ['Karier dan kerja', 'Kuliah atau beasiswa', 'Traveling', 'Ngobrol dengan teman luar negeri'], icons: ['💼', '🎓', '✈️', '🌍'] },
  { k: 'level', q: 'Seberapa lancar bahasa Inggrismu?', opts: ['Pemula', 'Dasar', 'Menengah'], icons: ['🌱', '🌿', '🌳'], sub: ['Baru mulai dari nol', 'Bisa kalimat sederhana', 'Bisa ngobrol, ingin lebih lancar'] },
  { k: 'daily', q: 'Berapa lama belajar tiap hari?', opts: ['5 menit', '10 menit', '15 menit'], icons: ['☕', '📘', '🚀'], sub: ['Santai · 20 XP', 'Rutin · 40 XP', 'Serius · 60 XP'], vals: [20, 40, 60] },
  { k: 'ready' }
];
let obStep = 0;
function startOnboarding() { obStep = 0; renderOb(); }
function renderOb() {
  const s = OB[obStep];
  const dots = `<div class="dots">${OB.map((_, i) => `<i class="${i <= obStep ? 'on' : ''}"></i>`).join('')}</div>`;
  let body = '';
  if (s.k === 'welcome') {
    body = `<div class="ob-hero">${mascot('cheer', 150)}<h1>Belajar Inggris, versi orang Indonesia</h1><p>Latihan baca, tulis, eja, dengar, dan bicara dengan penjelasan berbahasa Indonesia.</p></div>
      <button class="btn btn-primary btn-block" data-act="ob-next">Mulai</button><button class="link" data-act="ob-skip">Lewati, langsung ke demo</button>`;
  } else if (s.k === 'ready') {
    body = `<div class="ob-hero">${mascot('cheer', 130)}<h1>Siap! Jalurmu sudah dibuat</h1><p>Tujuan: <b>${esc(S.goal)}</b><br>Level: <b>${esc(S.level)}</b><br>Target harian: <b>${S.daily} XP</b></p></div>
      <button class="btn btn-primary btn-block" data-act="ob-finish">Mulai pelajaran pertama</button>`;
  } else {
    body = `<div class="ob-q">${mascot('happy', 70)}<h1>${s.q}</h1></div><div class="ob-opts">${s.opts.map((o, i) => `<button class="ob-opt" data-act="ob-pick" data-i="${i}"><span class="oi">${s.icons[i]}</span><div><b>${o}</b>${s.sub ? `<small>${s.sub[i]}</small>` : ''}</div></button>`).join('')}</div>`;
  }
  openLayer1(`<div class="onboard" role="dialog" aria-modal="true" aria-label="Pengenalan">${s.k === 'welcome' ? '' : dots}${body}</div>`);
}
function finishOnboarding(goLesson) {
  S.onboarded = true; save();
  closeLayer1(); goTab('home');
  if (goLesson) { const u = UNITS[0], l = u.lessons[0]; openLesson({ title: l.title, ex: l.ex, lessonId: l.id, unit: u.id, color: u.color }); }
}

/* =====================================================================
   Aksi (delegasi klik)
   ===================================================================== */
function confirmQuit() {
  openModal(`<div class="sheet dialog" role="alertdialog" aria-modal="true"><h2>Keluar dari pelajaran?</h2><p class="muted">Progres pelajaran ini tidak disimpan.</p><button class="btn btn-primary btn-block" data-act="quitNo">Lanjut belajar</button><button class="btn btn-ghost btn-block" data-act="quitYes">Keluar</button></div>`);
}
const A = {
  tab(b) { goTab(b.dataset.tab); },
  lesson(b) {
    const u = UNITS.find(x => x.id === b.dataset.u), i = +b.dataset.i, l = u.lessons[i], st = lessonState(u, i);
    if (st === 'prem') { openPaywall('unit'); return; }
    if (st === 'locked') { toast('Selesaikan pelajaran sebelumnya dulu ya.'); return; }
    if (!l.ex.length) { toast('Materi ini belum dibuat di prototype.'); return; }
    openLesson({ title: l.title, ex: l.ex, lessonId: l.id, unit: u.id, color: u.color });
  },
  practice(b) { startPractice(b.dataset.k); },
  quit() { confirmQuit(); },
  quitYes() { closeModal(); closeLayer1(); },
  quitNo() { closeModal(); },
  check() { doCheck(); },
  next() { nextEx(); },
  skip() { skipEx(); },
  dictate() {
    const inp = $('#inp');
    if (!inp) return;
    const btn = $('.mic-mini');
    if (btn) btn.classList.add('on');
    toast('Mendengarkan... ucapkan jawabanmu dalam bahasa Inggris');
    let got = false;
    listen({
      onResult(t) { got = true; inp.value = t.replace(/[.?!]+$/, ''); inp.dispatchEvent(new Event('input')); },
      onError(err) { if (err === 'unsupported' || err === 'not-allowed' || err === 'service-not-allowed') toast('Mikrofon belum tersedia di peramban ini. Coba Chrome.'); else if (err === 'no-speech') toast('Tidak terdengar. Coba lagi.'); },
      onEnd() { if (btn) btn.classList.remove('on'); if (got) inp.focus(); }
    });
  },
  clearpad() { const b = $('#lbody .ex'); if (b && b.clear) b.clear(); },
  home() { closeLayer1(); closeModal(); goTab('home'); },
  paywall() { openPaywall('upgrade'); },
  closeModal() { closeModal(); },
  'pw-next'() { const r = $('input[name="plan"]:checked'); if (r) S.plan = r.value; paywallMethods(); },
  'pw-pay'() { const r = $('input[name="method"]:checked'); if (r) S.method = r.value; paywallProcessing(); },
  'pw-done'() { closeModal(); closeLayer1(); goTab('home'); },
  'ob-next'() { obStep++; renderOb(); },
  'ob-skip'() { finishOnboarding(false); },
  'ob-finish'() { finishOnboarding(true); },
  'ob-pick'(b) {
    const s = OB[obStep], i = +b.dataset.i;
    if (s.k === 'goal') S.goal = s.opts[i];
    if (s.k === 'level') S.level = s.opts[i];
    if (s.k === 'daily') S.daily = s.vals[i];
    save(); obStep++; renderOb();
  },
  clinic(b) {
    const acc = $('#acc-' + b.dataset.id);
    if (!acc) return;
    const open = acc.classList.toggle('open');
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    b.querySelector('.chev').textContent = open ? '-' : '+';
  },
  chip(b) { tutorChip(b.dataset.k); },
  voice() { voiceNote(); },
  reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* abaikan */ }
    S = defaults(); T.msgs = []; T.init = false; T.mode = 'free'; T.step = 0;
    goTab('home'); startOnboarding();
  }
};

document.addEventListener('click', e => {
  const sayBtn = e.target.closest('[data-say]');
  if (sayBtn) {
    say(sayBtn.dataset.say, sayBtn.dataset.rate ? parseFloat(sayBtn.dataset.rate) : 0.92);
    if (sayBtn.dataset.clinic) { S.clinic++; save(); }
    return;
  }
  const b = e.target.closest('[data-act]');
  if (b && A[b.dataset.act]) A[b.dataset.act](b, e);
  const jb = e.target.closest('[data-jump]');
  if (jb) jump(jb.dataset.jump);
});
document.addEventListener('submit', e => {
  if (e.target.id === 'chatform') { e.preventDefault(); sendChat(); }
});
document.addEventListener('change', e => {
  if (e.target.name === 'plan') { S.plan = e.target.value; $$('.plan').forEach(p => p.classList.toggle('sel', p.contains(e.target))); }
  if (e.target.name === 'method') { $$('.method').forEach(p => p.classList.toggle('sel', p.contains(e.target))); }
});
document.addEventListener('keydown', e => {
  if (!L1().classList.contains('on') || !$('#lesson, .lesson')) return;
  if (L2().classList.contains('on')) return;
  if (e.key === 'Escape') { confirmQuit(); return; }
  if (e.key === 'Enter') {
    const nx = $('#next'), ck = $('#check');
    if (nx) { e.preventDefault(); nx.click(); }
    else if (ck && !ck.disabled) { e.preventDefault(); ck.click(); }
  } else if (LS.ctl && LS.ctl.key && !LS.checked && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) LS.ctl.key(e.key);
});

/* =====================================================================
   Lompat layar (untuk presentasi) dan mulai
   ===================================================================== */
function demoLesson(type) {
  let ex = null, title = 'Contoh latihan';
  if (type === 'write') ex = { t: 'write', q: 'Tulis kata ini dengan tulisan tangan', word: 'thanks', hint: 'terima kasih', say: 'thanks', key: 'thanks' };
  else if (type === 'speak') ex = Object.assign({ t: 'speak', q: 'Ucapkan kalimat ini', key: SPEAK_LINES[0].text }, SPEAK_LINES[0]);
  else ex = ALL_EX.find(e => e.t === type);
  if (!ex) return;
  openLesson({ title, ex: [ex], color: '#4F46E5' });
}
function jump(name) {
  closeLayer1(); closeModal();
  if (name === 'onboarding') { startOnboarding(); return; }
  if (name === 'paywall') { openPaywall('upgrade'); return; }
  if (VIEWS[name]) { goTab(name); return; }
  if (name === 'lesson') { const u = UNITS[0], l = u.lessons[0]; openLesson({ title: l.title, ex: l.ex, lessonId: l.id, unit: u.id, color: u.color }); return; }
  if (name.startsWith('ex-')) demoLesson(name.slice(3));
}

function boot() {
  renderNav();
  renderView();
  if (!S.onboarded) startOnboarding();
}
/* =====================================================================
   Mode aplikasi: layar penuh, pasang ke HP, dan pembatasan salin/zoom
   ===================================================================== */
(function appShell() {
  const isInput = t => !!(t && t.closest && t.closest('input, textarea'));
  const stop = e => { e.preventDefault(); e.stopPropagation(); };
  const standalone = () => (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches)) || navigator.standalone === true;

  /* --- tidak bisa salin, tempel, seret, klik kanan, pilih teks --- */
  ['contextmenu', 'copy', 'cut', 'paste', 'dragstart', 'drop'].forEach(n => document.addEventListener(n, stop, true));
  document.addEventListener('selectstart', e => { if (!isInput(e.target)) e.preventDefault(); }, true);

  /* --- tombol pintasan: salin, tempel, simpan, lihat sumber, alat pengembang, zoom --- */
  document.addEventListener('keydown', e => {
    const k = (e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
    const blocked =
      k === 'f12' ||
      (mod && ['c', 'x', 'v', 'a', 's', 'u', 'p', 'f', '+', '-', '=', '0'].includes(k)) ||
      (mod && e.shiftKey && ['i', 'j', 'c', 'k', 'm'].includes(k)) ||
      (e.metaKey && e.altKey && ['i', 'j', 'c', 'u'].includes(k));
    if (blocked) stop(e);
  }, true);

  /* --- tidak bisa zoom: roda mouse, cubit, ketuk dua kali --- */
  window.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(n => document.addEventListener(n, e => e.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', e => { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false });
  let lastTap = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTap < 320 && !isInput(e.target)) e.preventDefault();
    lastTap = now;
  }, { passive: false });

  /* --- pasang sebagai aplikasi (PWA) --- */
  let deferred = null, installDone = standalone(), installAsked = false;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', () => { installDone = true; deferred = null; });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* abaikan */ }));
  }

  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function iosHint() {
    if (document.getElementById('iosHint')) return;
    const d = document.createElement('div');
    d.id = 'iosHint';
    d.innerHTML = '<div class="ios-card" role="dialog" aria-label="Pasang aplikasi"><b>Pasang aplikasi Elingua</b><p>Ketuk tombol <b>Bagikan</b> di Safari, lalu pilih <b>Tambahkan ke Layar Utama</b>.</p><button class="btn btn-primary btn-block" type="button">Mengerti</button></div>';
    d.querySelector('button').addEventListener('click', () => d.remove());
    document.body.appendChild(d);
  }

  /* --- ketukan pertama: layar penuh dan tawaran pasang --- */
  let fsOk = standalone();
  function onFirstTouch() {
    if (!installDone && !installAsked && deferred) {
      installAsked = true;
      const p = deferred; deferred = null;
      try { p.prompt(); p.userChoice.then(r => { if (r && r.outcome === 'accepted') installDone = true; }).catch(() => {}); } catch (e) { installAsked = false; deferred = p; }
    }
    if (!fsOk) {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) {
        try {
          const r = req.call(el, { navigationUI: 'hide' });
          const lock = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('portrait').catch(() => {}); } catch (e) { /* abaikan */ } };
          if (r && r.then) r.then(() => { fsOk = true; lock(); }).catch(() => {}); else fsOk = true;
        } catch (e) { /* coba lagi pada ketukan berikutnya */ }
      }
    }
    if (ios && !installDone && !sessionStorage.getItem('elingua-ios-hint')) {
      try { sessionStorage.setItem('elingua-ios-hint', '1'); } catch (e) { /* abaikan */ }
      iosHint();
    }
    if (fsOk && (installDone || installAsked || !('onbeforeinstallprompt' in window))) {
      document.removeEventListener('pointerup', onFirstTouch, true);
    }
  }
  document.addEventListener('pointerup', onFirstTouch, true);
})();

boot();

window.Elingua = { state: () => S, jump, test: { TYPES, LS, doCheck, nextEx, S: () => S, UNITS, openLesson } };
})();
