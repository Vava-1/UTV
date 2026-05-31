import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

const resources = {
  en: {
    translation: {
      nav: { home: 'Home', about: 'About', music: 'Music', books: 'Books', videos: 'Videos', scores: 'Scores', concerts: 'Concerts', gallery: 'Gallery', library: 'Library', contents: 'Contents', admin: 'Admin Portal', login: 'Login', logout: 'Logout', profile: 'Profile', cart: 'Cart', orders: 'My Orders', tickets: 'My Tickets' },
      home: { hero: 'One Single Voice', subtitle: 'Where Classical Music Meets Gospel & Philosophy', discover: 'Discover', explore: 'Explore' },
      music: { title: 'Music Collection', nowPlaying: 'Now Playing', play: 'Play', pause: 'Pause', next: 'Next', previous: 'Previous', queue: 'Queue' },
      books: { title: 'Books & Literature', buy: 'Buy Now', addToCart: 'Add to Cart', download: 'Download', author: 'Author', publisher: 'Publisher', pages: 'Pages' },
      scores: { title: 'Sheet Music', voicing: 'Voicing', difficulty: 'Difficulty', preview: 'Preview' },
      concerts: { title: 'Upcoming Concerts', venue: 'Venue', date: 'Date', tickets: 'Tickets', buyTickets: 'Buy Tickets', soldOut: 'Sold Out' },
      chat: { title: 'UTV Assistant', placeholder: 'Ask about music, books, concerts...', send: 'Send', greeting: 'Hello! I am your UTV Assistant. How can I help you today?' },
      auth: { login: 'Sign In', register: 'Create Account', email: 'Email', password: 'Password', firstName: 'First Name', lastName: 'Last Name', forgotPassword: 'Forgot Password?', noAccount: 'No account?', hasAccount: 'Already have an account?' },
      admin: { dashboard: 'Dashboard', users: 'Users', contents: 'Contents', orders: 'Orders', analytics: 'Analytics', createContent: 'Create Content', totalUsers: 'Total Users', totalOrders: 'Total Orders', totalRevenue: 'Total Revenue', totalTickets: 'Tickets Sold' },
      common: { search: 'Search', loading: 'Loading...', error: 'Error', success: 'Success', cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit', create: 'Create', back: 'Back', close: 'Close', confirm: 'Confirm' }
    }
  },
  fr: {
    translation: {
      nav: { home: 'Accueil', about: 'A Propos', music: 'Musique', books: 'Livres', videos: 'Videos', scores: 'Partitions', concerts: 'Concerts', gallery: 'Galerie', library: 'Bibliotheque', contents: 'Contenus', admin: 'Portail Admin', login: 'Connexion', logout: 'Deconnexion', profile: 'Profil', cart: 'Panier', orders: 'Mes Commandes', tickets: 'Mes Billets' },
      home: { hero: 'Une Seule Voix', subtitle: "Ou la Musique Classique Rencontre le Gospel et la Philosophie", discover: 'Decouvrir', explore: 'Explorer' },
      music: { title: 'Collection Musicale', nowPlaying: 'En Lecture', play: 'Lecture', pause: 'Pause', next: 'Suivant', previous: 'Precedent', queue: "File d'attente" },
      books: { title: 'Livres et Litterature', buy: 'Acheter', addToCart: 'Ajouter au Panier', download: 'Telecharger', author: 'Auteur', publisher: 'Editeur', pages: 'Pages' },
      scores: { title: 'Partitions', voicing: 'Voix', difficulty: 'Difficulte', preview: 'Apercu' },
      concerts: { title: 'Concerts a Venir', venue: 'Lieu', date: 'Date', tickets: 'Billets', buyTickets: 'Acheter des Billets', soldOut: 'Complet' },
      chat: { title: 'Assistant UTV', placeholder: 'Posez une question sur la musique, les livres, les concerts...', send: 'Envoyer', greeting: 'Bonjour! Je suis votre Assistant UTV. Comment puis-je vous aider aujourd\'hui?' },
      auth: { login: 'Connexion', register: 'Creer un Compte', email: 'Email', password: 'Mot de passe', firstName: 'Prenom', lastName: 'Nom', forgotPassword: 'Mot de passe oublie?', noAccount: 'Pas de compte?', hasAccount: 'Deja un compte?' },
      admin: { dashboard: 'Tableau de Bord', users: 'Utilisateurs', contents: 'Contenus', orders: 'Commandes', analytics: 'Analytique', createContent: 'Creer du Contenu', totalUsers: 'Utilisateurs Totaux', totalOrders: 'Commandes Totales', totalRevenue: 'Revenu Total', totalTickets: 'Billets Vendus' },
      common: { search: 'Rechercher', loading: 'Chargement...', error: 'Erreur', success: 'Succes', cancel: 'Annuler', save: 'Sauvegarder', delete: 'Supprimer', edit: 'Modifier', create: 'Creer', back: 'Retour', close: 'Fermer', confirm: 'Confirmer' }
    }
  },
  es: {
    translation: {
      nav: { home: 'Inicio', about: 'Nosotros', music: 'Musica', books: 'Libros', videos: 'Videos', scores: 'Partituras', concerts: 'Conciertos', gallery: 'Galeria', library: 'Biblioteca', contents: 'Contenidos', admin: 'Portal Admin', login: 'Iniciar Sesion', logout: 'Cerrar Sesion', profile: 'Perfil', cart: 'Carrito', orders: 'Mis Pedidos', tickets: 'Mis Entradas' },
      home: { hero: 'Una Sola Voz', subtitle: 'Donde la Musica Clasica Encuentra el Gospel y la Filosofia', discover: 'Descubrir', explore: 'Explorar' },
      music: { title: 'Coleccion Musical', nowPlaying: 'Reproduciendo', play: 'Reproducir', pause: 'Pausa', next: 'Siguiente', previous: 'Anterior', queue: 'Cola' },
      books: { title: 'Libros y Literatura', buy: 'Comprar', addToCart: 'Anadir al Carrito', download: 'Descargar', author: 'Autor', publisher: 'Editorial', pages: 'Paginas' },
      scores: { title: 'Partituras', voicing: 'Voz', difficulty: 'Dificultad', preview: 'Vista Previa' },
      concerts: { title: 'Proximos Conciertos', venue: 'Lugar', date: 'Fecha', tickets: 'Entradas', buyTickets: 'Comprar Entradas', soldOut: 'Agotado' },
      chat: { title: 'Asistente UTV', placeholder: 'Pregunta sobre musica, libros, conciertos...', send: 'Enviar', greeting: 'Hola! Soy tu Asistente UTV. Como puedo ayudarte hoy?' },
      auth: { login: 'Iniciar Sesion', register: 'Crear Cuenta', email: 'Email', password: 'Contrasena', firstName: 'Nombre', lastName: 'Apellido', forgotPassword: 'Olvidaste tu contrasena?', noAccount: 'No tienes cuenta?', hasAccount: 'Ya tienes cuenta?' },
      admin: { dashboard: 'Panel de Control', users: 'Usuarios', contents: 'Contenidos', orders: 'Pedidos', analytics: 'Analiticas', createContent: 'Crear Contenido', totalUsers: 'Usuarios Totales', totalOrders: 'Pedidos Totales', totalRevenue: 'Ingresos Totales', totalTickets: 'Entradas Vendidas' },
      common: { search: 'Buscar', loading: 'Cargando...', error: 'Error', success: 'Exito', cancel: 'Cancelar', save: 'Guardar', delete: 'Eliminar', edit: 'Editar', create: 'Crear', back: 'Atras', close: 'Cerrar', confirm: 'Confirmar' }
    }
  },
  de: {
    translation: {
      nav: { home: 'Startseite', about: 'Uber Uns', music: 'Musik', books: 'Bucher', videos: 'Videos', scores: 'Noten', concerts: 'Konzerte', gallery: 'Galerie', library: 'Bibliothek', contents: 'Inhalte', admin: 'Admin Portal', login: 'Anmelden', logout: 'Abmelden', profile: 'Profil', cart: 'Warenkorb', orders: 'Meine Bestellungen', tickets: 'Meine Tickets' },
      home: { hero: 'Eine Einzige Stimme', subtitle: 'Wo Klassik auf Gospel und Philosophie trifft', discover: 'Entdecken', explore: 'Erkunden' },
      music: { title: 'Musiksammlung', nowPlaying: 'Wiedergabe', play: 'Abspielen', pause: 'Pause', next: 'Weiter', previous: 'Zuruck', queue: 'Warteschlange' },
      books: { title: 'Bucher und Literatur', buy: 'Kaufen', addToCart: 'In den Warenkorb', download: 'Herunterladen', author: 'Autor', publisher: 'Verlag', pages: 'Seiten' },
      scores: { title: 'Noten', voicing: 'Stimmung', difficulty: 'Schwierigkeit', preview: 'Vorschau' },
      concerts: { title: 'Kommende Konzerte', venue: 'Ort', date: 'Datum', tickets: 'Tickets', buyTickets: 'Tickets Kaufen', soldOut: 'Ausverkauft' },
      chat: { title: 'UTV Assistent', placeholder: 'Fragen Sie nach Musik, Buchern, Konzerten...', send: 'Senden', greeting: 'Hallo! Ich bin Ihr UTV Assistent. Wie kann ich Ihnen heute helfen?' },
      auth: { login: 'Anmelden', register: 'Konto Erstellen', email: 'Email', password: 'Passwort', firstName: 'Vorname', lastName: 'Nachname', forgotPassword: 'Passwort vergessen?', noAccount: 'Kein Konto?', hasAccount: 'Bereits ein Konto?' },
      admin: { dashboard: 'Dashboard', users: 'Benutzer', contents: 'Inhalte', orders: 'Bestellungen', analytics: 'Analytik', createContent: 'Inhalt Erstellen', totalUsers: 'Benutzer Gesamt', totalOrders: 'Bestellungen Gesamt', totalRevenue: 'Gesamtumsatz', totalTickets: 'Tickets Verkauft' },
      common: { search: 'Suchen', loading: 'Laden...', error: 'Fehler', success: 'Erfolg', cancel: 'Abbrechen', save: 'Speichern', delete: 'Loschen', edit: 'Bearbeiten', create: 'Erstellen', back: 'Zuruck', close: 'Schliessen', confirm: 'Bestatigen' }
    }
  },
  it: {
    translation: {
      nav: { home: 'Home', about: 'Chi Siamo', music: 'Musica', books: 'Libri', videos: 'Video', scores: 'Spartiti', concerts: 'Concerti', gallery: 'Galleria', library: 'Biblioteca', contents: 'Contenuti', admin: 'Portale Admin', login: 'Accedi', logout: 'Esci', profile: 'Profilo', cart: 'Carrello', orders: 'I Miei Ordini', tickets: 'I Miei Biglietti' },
      home: { hero: 'Una Sola Voce', subtitle: 'Dove la Musica Classica Incontra il Gospel e la Filosofia', discover: 'Scopri', explore: 'Esplora' },
      music: { title: 'Collezione Musicale', nowPlaying: 'In Riproduzione', play: 'Riproduci', pause: 'Pausa', next: 'Successivo', previous: 'Precedente', queue: 'Coda' },
      books: { title: 'Libri e Letteratura', buy: 'Acquista', addToCart: 'Aggiungi al Carrello', download: 'Scarica', author: 'Autore', publisher: 'Editore', pages: 'Pagine' },
      scores: { title: 'Spartiti', voicing: 'Voci', difficulty: 'Difficolta', preview: 'Anteprima' },
      concerts: { title: 'Prossimi Concerti', venue: 'Luogo', date: 'Data', tickets: 'Biglietti', buyTickets: 'Acquista Biglietti', soldOut: 'Esaurito' },
      chat: { title: 'Assistente UTV', placeholder: 'Chiedi di musica, libri, concerti...', send: 'Invia', greeting: 'Ciao! Sono il tuo Assistente UTV. Come posso aiutarti oggi?' },
      auth: { login: 'Accedi', register: 'Crea Account', email: 'Email', password: 'Password', firstName: 'Nome', lastName: 'Cognome', forgotPassword: 'Password dimenticata?', noAccount: 'Nessun account?', hasAccount: 'Hai gia un account?' },
      admin: { dashboard: 'Dashboard', users: 'Utenti', contents: 'Contenuti', orders: 'Ordini', analytics: 'Analitiche', createContent: 'Crea Contenuto', totalUsers: 'Utenti Totali', totalOrders: 'Ordini Totali', totalRevenue: 'Ricavi Totali', totalTickets: 'Biglietti Venduti' },
      common: { search: 'Cerca', loading: 'Caricamento...', error: 'Errore', success: 'Successo', cancel: 'Annulla', save: 'Salva', delete: 'Elimina', edit: 'Modifica', create: 'Crea', back: 'Indietro', close: 'Chiudi', confirm: 'Conferma' }
    }
  },
  pt: {
    translation: {
      nav: { home: 'Inicio', about: 'Sobre', music: 'Musica', books: 'Livros', videos: 'Videos', scores: 'Partituras', concerts: 'Concertos', gallery: 'Galeria', library: 'Biblioteca', contents: 'Conteudos', admin: 'Portal Admin', login: 'Entrar', logout: 'Sair', profile: 'Perfil', cart: 'Carrinho', orders: 'Meus Pedidos', tickets: 'Meus Ingressos' },
      home: { hero: 'Uma So Voz', subtitle: 'Onde a Musica Classica Encontra o Gospel e a Filosofia', discover: 'Descobrir', explore: 'Explorar' },
      music: { title: 'Colecao Musical', nowPlaying: 'Tocando Agora', play: 'Tocar', pause: 'Pausa', next: 'Proxima', previous: 'Anterior', queue: 'Fila' },
      books: { title: 'Livros e Literatura', buy: 'Comprar', addToCart: 'Adicionar ao Carrinho', download: 'Baixar', author: 'Autor', publisher: 'Editora', pages: 'Paginas' },
      scores: { title: 'Partituras', voicing: 'Vozes', difficulty: 'Dificuldade', preview: 'Visualizar' },
      concerts: { title: 'Proximos Concertos', venue: 'Local', date: 'Data', tickets: 'Ingressos', buyTickets: 'Comprar Ingressos', soldOut: 'Esgotado' },
      chat: { title: 'Assistente UTV', placeholder: 'Pergunte sobre musica, livros, concertos...', send: 'Enviar', greeting: 'Ola! Sou seu Assistente UTV. Como posso ajuda-lo hoje?' },
      auth: { login: 'Entrar', register: 'Criar Conta', email: 'Email', password: 'Senha', firstName: 'Nome', lastName: 'Sobrenome', forgotPassword: 'Esqueceu a senha?', noAccount: 'Sem conta?', hasAccount: 'Ja tem conta?' },
      admin: { dashboard: 'Painel', users: 'Usuarios', contents: 'Conteudos', orders: 'Pedidos', analytics: 'Analises', createContent: 'Criar Conteudo', totalUsers: 'Usuarios Totais', totalOrders: 'Pedidos Totais', totalRevenue: 'Receita Total', totalTickets: 'Ingressos Vendidos' },
      common: { search: 'Pesquisar', loading: 'Carregando...', error: 'Erro', success: 'Sucesso', cancel: 'Cancelar', save: 'Salvar', delete: 'Excluir', edit: 'Editar', create: 'Criar', back: 'Voltar', close: 'Fechar', confirm: 'Confirmar' }
    }
  },
  rw: {
    translation: {
      nav: { home: 'Ahabanza', about: 'Ibyerekeye', music: 'Umuziki', books: 'Ibitabo', videos: "Amafirime", scores: "Inyandiko z'Umuziki", concerts: 'Ibirori', gallery: 'Ishusho', library: 'Isomero', contents: 'Ibikubiyemo', admin: 'Admin Portal', login: 'Injira', logout: 'Sohoka', profile: 'Umwirondoro', cart: 'Igare', orders: 'Ibyo Nagize', tickets: 'Ama Tiketi' },
      home: { hero: 'Ijwi Rimwe', subtitle: "Aho Umuziki w'Indirimbo zigezweho uhura na Gospel na Filozofiya", discover: 'Menya', explore: 'Shakisha' },
      music: { title: 'Umuziki', nowPlaying: 'Ugiye gukina', play: 'Gukina', pause: 'Guhagarara', next: 'Igikurikira', previous: 'Icyabanje', queue: 'Urutonde' },
      books: { title: 'Ibitabo', buy: 'Gura', addToCart: 'Ongera mu Gare', download: 'Kurura', author: 'Umwanditsi', publisher: 'Umucapira', pages: 'Impapuro' },
      scores: { title: "Inyandiko z'Umuziki", voicing: 'Ijwi', difficulty: 'Ukomeza', preview: 'Reba' },
      concerts: { title: 'Ibirori bigiye kuba', venue: 'Aho', date: 'Itariki', tickets: 'Ama Tiketi', buyTickets: 'Gura Tiketi', soldOut: 'Byarangiye' },
      chat: { title: 'Umutugizi wa UTV', placeholder: 'Baza ibyerekeye umuziki, ibitabo, ibirori...', send: 'Ohereza', greeting: 'Muraho! Ndi Umutugizi wawe wa UTV. Nshobora kukugirira akamaro nte?' },
      auth: { login: 'Injira', register: 'Fungura Konti', email: "Imeri", password: "Ijambo ry'ibanga", firstName: 'Izina', lastName: 'Irangamuntu', forgotPassword: "Wibagiwe ijambo ry'ibanga?", noAccount: 'Nta konti ufite?', hasAccount: 'Usaifu konti?' },
      admin: { dashboard: 'Dashboard', users: 'Abakoresha', contents: 'Ibikubiyemo', orders: 'Ibyo Bagize', analytics: 'Ukurikirane', createContent: 'Shyiramo Ibikubiyemo', totalUsers: 'Abakoresha Bose', totalOrders: 'Ibyo Bagize Bose', totalRevenue: 'Amafaranga Yose', totalTickets: 'Tiketi Zagurishijwe' },
      common: { search: 'Shakisha', loading: 'Birakorwa...', error: 'Ikosa', success: 'Byagenze neza', cancel: 'Hagarika', save: 'Bika', delete: 'Siba', edit: 'Hindura', create: 'Shyiramo', back: 'Subira inyuma', close: 'Funga', confirm: 'Emeza' }
    }
  },
  sw: {
    translation: {
      nav: { home: 'Nyumbani', about: 'Kuhusu', music: 'Muziki', books: 'Vitabu', videos: 'Video', scores: 'Noti za Muziki', concerts: 'Tamasha', gallery: 'Matunzio', library: 'Maktaba', contents: 'Maudhui', admin: 'Portal ya Admin', login: 'Ingia', logout: 'Toka', profile: 'Wasifu', cart: 'Kikapu', orders: 'Maagizo Yangu', tickets: 'Tiketi Zangu' },
      home: { hero: 'Sauti Moja', subtitle: 'Ambapo Muziki wa Kiungu Unakutana na Injili na Falsafa', discover: 'Gundua', explore: 'Chunguza' },
      music: { title: 'Mkusanyiko wa Muziki', nowPlaying: 'Inachezwa Sasa', play: 'Cheza', pause: 'Simama', next: 'Ifuatayo', previous: 'Iliyopita', queue: 'Foleni' },
      books: { title: 'Vitabu na Fasihi', buy: 'Nunua', addToCart: 'Ongeza kwa Kikapu', download: 'Pakua', author: 'Mwandishi', publisher: 'Mchapishaji', pages: 'Kurasa' },
      scores: { title: 'Noti za Muziki', voicing: 'Sauti', difficulty: 'Ugumu', preview: 'Hakiki' },
      concerts: { title: 'Tamasha Zinazokuja', venue: 'Mahali', date: 'Tarehe', tickets: 'Tiketi', buyTickets: 'Nunua Tiketi', soldOut: 'Zimeisha' },
      chat: { title: 'Msaidizi wa UTV', placeholder: 'Uliza kuhusu muziki, vitabu, tamasha...', send: 'Tuma', greeting: 'Habari! Mimi ni Msaidizi wako wa UTV. Naweza kukusaidia vipi leo?' },
      auth: { login: 'Ingia', register: 'Fungua Akaunti', email: 'Barua pepe', password: 'Nywila', firstName: 'Jina la Kwanza', lastName: 'Jina la Familia', forgotPassword: 'Umesahau nywila?', noAccount: 'Huna akaunti?', hasAccount: 'Tayari una akaunti?' },
      admin: { dashboard: 'Dashibodi', users: 'Watumiaji', contents: 'Maudhui', orders: 'Maagizo', analytics: 'Takwimu', createContent: 'Tengeneza Maudhui', totalUsers: 'Jumla ya Watumiaji', totalOrders: 'Jumla ya Maagizo', totalRevenue: 'Mapato Yote', totalTickets: 'Tiketi Zilizouzwa' },
      common: { search: 'Tafuta', loading: 'Inapakia...', error: 'Kosa', success: 'Mafanikio', cancel: 'Ghairi', save: 'Hifadhi', delete: 'Futa', edit: 'Hariri', create: 'Tengeneza', back: 'Rudi', close: 'Funga', confirm: 'Thibitisha' }
    }
  }
};

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  });

export default i18n;
