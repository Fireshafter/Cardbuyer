const delay = require("./delay");

const scrap = async (func, maxTries = 5) => {
  // Aqui definimos el timeout base y incializamos el numero de intentos
  const timeout = 10000;
  let tries = 0;

  // Se intenta cada callback un máximo de 5 veces incrementando el tiempo de espera entre ellos
  do {
    try {
      console.log(`Intento de busqueda ${tries + 1}`);
      const res = await func();
      return res;
    } catch (error) {
      console.log(`error de busqueda`);
      await delay(timeout * tries);
      tries++;
    }
  } while (tries < maxTries);
};

module.exports = scrap;
