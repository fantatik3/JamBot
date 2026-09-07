/**
 * Punto de entrada. Conecta la configuración, el cliente y todos los manejadores, y luego inicia sesión.
 */
const config = require("./config");
const logger = require("./utils/logger");
const { createClient } = require("./client");
const { loadCommands } = require("./handlers/commandHandler");
const { loadEvents } = require("./handlers/eventHandler");
const { loadComponentHandlers } = require("./handlers/componentHandler");

const client = createClient();

client.commands = loadCommands();
client.componentHandlers = loadComponentHandlers();
loadEvents(client); 

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    logger.info(`Received ${signal}, shutting down.`);
    client.destroy();
    process.exit(0);
  });
}

client.login(config.token).catch((error) => {
  logger.error("Failed to log in:", error);
  // Cerrar el cliente antes de salir evita el aviso de libuv al terminar el proceso en Windows.
  client.destroy();
  process.exitCode = 1;
});
