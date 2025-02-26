const browserDo = async (func, desc, maxTries = 5) => {
  // Aqui definimos el timeout base y incializamos el numero de intentos
  const timeout = 1000;
  let tries = 0;

  // Se intenta cada callback un máximo de 5 veces incrementando el tiempo de espera entre ellos
  do {
    try {
      return await func(tries * timeout, tries);
    } catch (error) {
      console.log(`Error en el intento ${tries + 1} de ${desc}.`);
      tries++;
    }
  } while (tries < maxTries);
};

module.exports = browserDo;
