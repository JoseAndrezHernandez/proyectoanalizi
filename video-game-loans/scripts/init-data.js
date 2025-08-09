const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');

// Datos iniciales
const initialGames = [
  {
    id: "1",
    title: "The Legend of Zelda: Breath of the Wild",
    category: "Aventura",
    year: 2017,
    console: "Nintendo Switch",
    available: true,
  },
  { id: "2", title: "God of War", category: "Acción", year: 2018, console: "PlayStation 4", available: true },
  {
    id: "3",
    title: "Halo Infinite",
    category: "Shooter",
    year: 2021,
    console: "Xbox Series X",
    available: false,
    borrowedBy: "Juan Pérez",
    borrowedDate: "2024-01-15",
  },
  {
    id: "4",
    title: "Super Mario Odyssey",
    category: "Plataformas",
    year: 2017,
    console: "Nintendo Switch",
    available: true,
  },
  { id: "5", title: "Cyberpunk 2077", category: "RPG", year: 2020, console: "PC", available: true },
  {
    id: "6",
    title: "FIFA 24",
    category: "Deportes",
    year: 2023,
    console: "PlayStation 5",
    available: false,
    borrowedBy: "María García",
    borrowedDate: "2024-01-20",
  },
  { id: "7", title: "Minecraft", category: "Sandbox", year: 2011, console: "PC", available: true },
  {
    id: "8",
    title: "Call of Duty: Modern Warfare III",
    category: "Shooter",
    year: 2023,
    console: "Xbox Series X",
    available: true,
  },
];

const initialLoans = [
  {
    id: "1",
    gameId: "3",
    gameTitle: "Halo Infinite",
    borrowerName: "Juan Pérez",
    borrowDate: "2024-01-15",
  },
  {
    id: "2",
    gameId: "6",
    gameTitle: "FIFA 24",
    borrowerName: "María García",
    borrowDate: "2024-01-20",
  },
];

const initialLoanRequests = [
  {
    id: "1",
    gameId: "1",
    gameTitle: "The Legend of Zelda: Breath of the Wild",
    userId: "2",
    userName: "Juan Pérez",
    requestDate: "2024-01-10",
    status: "approved",
  },
  {
    id: "2",
    gameId: "5",
    gameTitle: "Cyberpunk 2077",
    userId: "3",
    userName: "María García",
    requestDate: "2024-01-18",
    status: "pending",
  },
];

function initializeData() {
  try {
    // Crear directorio data si no existe
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Directorio data creado');
    }

    // Crear archivos de datos si no existen
    const gamesFile = path.join(dataDir, 'games.json');
    if (!fs.existsSync(gamesFile)) {
      fs.writeFileSync(gamesFile, JSON.stringify(initialGames, null, 2));
      console.log('🎮 Archivo games.json creado');
    }

    const loansFile = path.join(dataDir, 'loans.json');
    if (!fs.existsSync(loansFile)) {
      fs.writeFileSync(loansFile, JSON.stringify(initialLoans, null, 2));
      console.log('📋 Archivo loans.json creado');
    }

    const requestsFile = path.join(dataDir, 'loan-requests.json');
    if (!fs.existsSync(requestsFile)) {
      fs.writeFileSync(requestsFile, JSON.stringify(initialLoanRequests, null, 2));
      console.log('📝 Archivo loan-requests.json creado');
    }

    console.log('✅ Inicialización de datos completada');
  } catch (error) {
    console.error('❌ Error inicializando datos:', error);
  }
}

// Ejecutar inicialización
initializeData();
