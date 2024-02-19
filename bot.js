const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Token de acceso del bot de Telegram
const tokenBot = '6803395019:AAHb3CVzEOb9m6DZB11zZLGCaarVaCLncMk'; // Reemplaza con tu token

// Token de la API de Riot Games (League of Legends)
const claveApiRiot = 'RGAPI-4f59bce7-400f-42d4-931c-d8a6641c9b2d'; // Reemplaza con tu clave de API

// URL base de la API de League of Legends
const urlBaseApiLol = 'https://euw1.api.riotgames.com/lol/';

// Crear un nuevo bot con el token de acceso
const bot = new TelegramBot(tokenBot, { polling: true });

// Manejar el comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const mensaje = `
  ¡Hola! Soy un bot de League of Legends. 

  Usa /lol <nombre_del_invocador> para obtener información de su liga. 
 
  Usa /tabla para ver el top 5 del mundo. 
  
  Usa /help para obtener ayuda sobre cómo utilizar el bot.
  `;
  bot.sendMessage(chatId, mensaje);
});

// Manejar el comando /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
    Bienvenido al bot de League of Legends.

    Para obtener información de la liga de un invocador, usa el comando:
    /lol <nombre_del_invocador>

    Para ver el top 5 del mundo en League of Legends, usa el comando:
    /tabla

    Para obtener ayuda en cualquier momento, usa el comando:
    /help
  `;
  bot.sendMessage(chatId, helpMessage);
});

// Manejar el comando /lol
bot.onText(/\/lol (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const nombreInvocador = match[1]; // Obtener el nombre de invocador del mensaje

  try {
    // Obtener información del invocador
    const respuestaInvocador = await axios.get(`${urlBaseApiLol}summoner/v4/summoners/by-name/${nombreInvocador}?api_key=${claveApiRiot}`);
    const datosInvocador = respuestaInvocador.data;

    // Obtener el ID de la liga del invocador
    const respuestaLigas = await axios.get(`${urlBaseApiLol}league/v4/entries/by-summoner/${datosInvocador.id}?api_key=${claveApiRiot}`);
    const datosLiga = respuestaLigas.data;

    // Verificar si el invocador tiene liga asignada
    if (datosLiga.length > 0) {
      const idLiga = datosLiga[0].leagueId; // Obtener el ID de la liga del invocador

      // Obtener información de la liga
      const respuestaLiga = await axios.get(`${urlBaseApiLol}league/v4/leagues/${idLiga}?api_key=${claveApiRiot}`);
      const infoLiga = respuestaLiga.data;

      // Enviar información de la liga al chat
      bot.sendMessage(chatId, `Información de la liga de ${nombreInvocador}:\nNombre: ${infoLiga.name}\nTipo: ${infoLiga.queue}`);
    } else {
      bot.sendMessage(chatId, `${nombreInvocador} no tiene una liga asignada.`);
    }
  } catch (error) {
    console.error('Error al obtener información de League of Legends:', error);
    bot.sendMessage(chatId, 'Ocurrió un error al obtener información de League of Legends.');
  }
});

// Manejar el comando /tabla
bot.onText(/\/tabla/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    // Obtener el top 5 del mundo
    const respuestaTopMundial = await axios.get(`${urlBaseApiLol}league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5?api_key=${claveApiRiot}`);
    const topMundial = respuestaTopMundial.data;

    // Obtener los primeros 5 jugadores del top mundial
    const jugadoresTopMundial = topMundial.entries.slice(0, 5);

    // Crear la tabla de los jugadores top mundial
    let tabla = 'Top 5 del Mundo en League of Legends:\n';
    jugadoresTopMundial.forEach((jugador, index) => {
      tabla += `${index + 1}. ${jugador.summonerName} - ${jugador.leaguePoints} LP\n`;
    });

    // Enviar la tabla al chat
    bot.sendMessage(chatId, tabla);
  } catch (error) {
    console.error('Error al obtener el top mundial:', error);
    bot.sendMessage(chatId, 'Ocurrió un error al obtener el top mundial.');
  }
});
