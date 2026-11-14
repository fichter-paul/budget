// Service worker : un petit programme que le navigateur garde en arrière-plan.
// Il se place entre l'app et le réseau, et garde une copie des fichiers
// pour que l'app s'ouvre même sans connexion.

// Change ce numéro si tu ajoutes ou renommes des fichiers dans la liste ci-dessous.
const NOM_CACHE = "budget-v2";

const FICHIERS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./polices/nunito.woff2",
  "./polices/fredoka.woff2",
  "./icones/icone-180.png",
  "./icones/icone-192.png",
  "./icones/icone-512.png",
];

// 1. Installation : on met tous les fichiers de l'app en réserve
self.addEventListener("install", (evenement) => {
  evenement.waitUntil(caches.open(NOM_CACHE).then((cache) => cache.addAll(FICHIERS)));
  self.skipWaiting(); // la nouvelle version prend la main tout de suite
});

// 2. Activation : on supprime les réserves des anciennes versions
self.addEventListener("activate", (evenement) => {
  evenement.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(noms.filter((nom) => nom !== NOM_CACHE).map((nom) => caches.delete(nom)))
    )
  );
  self.clients.claim();
});

// 3. Chaque fois que l'app demande un fichier :
//    "réseau d'abord" → on essaie internet (pour avoir toujours la dernière version),
//    et seulement si ça échoue (pas de réseau), on sert la copie en réserve.
self.addEventListener("fetch", (evenement) => {
  if (evenement.request.method !== "GET") return;

  evenement.respondWith(
    fetch(evenement.request)
      .then((reponse) => {
        if (reponse.ok) {
          const copie = reponse.clone(); // une réponse ne se lit qu'une fois : on la copie pour la réserve
          caches.open(NOM_CACHE).then((cache) => cache.put(evenement.request, copie));
        }
        return reponse;
      })
      .catch(() => caches.match(evenement.request, { ignoreSearch: true }))
  );
});
