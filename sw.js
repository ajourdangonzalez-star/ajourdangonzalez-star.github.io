const CACHE = 'zass-fitness-v2';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Fonction pour sauvegarder la photo dans le localStorage
document.getElementById('photo-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function(event) {
    const date = document.getElementById('modal-title').dataset.date;
    localStorage.setItem(`zass-photo-${date}`, event.target.result);
    alert('Photo enregistrée !');
  };
  reader.readAsDataURL(file);
});

// Fonction pour afficher le récap d'un jour
function openJournal(date) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const title = document.getElementById('modal-title');
  
  title.textContent = date;
  title.dataset.date = date;
  
  const program = JSON.parse(localStorage.getItem(`zass-program-${date}`)) || {};
  const water = localStorage.getItem(`zass-water-${date}`) || 0;
  const photo = localStorage.getItem(`zass-photo-${date}`);
  
  content.innerHTML = `
    <p>Eau : ${water} verres</p>
    <p>Entraînement : ${Object.keys(program).length > 0 ? 'Fait' : 'Non fait'}</p>
    ${photo ? `<img src="${photo}" class="mt-2 rounded-xl w-full h-32 object-cover">` : ''}
  `;
  modal.classList.remove('hidden');
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
            return response;
          })
          .catch(() => cached)
    )
  );
});
