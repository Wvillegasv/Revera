const argon2 = require("argon2");
const readline = require("readline");

function preguntarOculto(pregunta) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    const stdin = process.stdin;
    const onData = (char) => {
      const texto = char.toString();

      if (texto === "\n" || texto === "\r" || texto === "\u0004") {
        stdin.removeListener("data", onData);
        return;
      }

      readline.moveCursor(process.stdout, -1, 0);
      process.stdout.write("*");
    };

    stdin.on("data", onData);

    rl.question(pregunta, (respuesta) => {
      stdin.removeListener("data", onData);
      rl.close();
      process.stdout.write("\n");
      resolve(respuesta);
    });
  });
}

async function main() {
  try {
    const clave = await preguntarOculto("Contraseña a convertir en hash: ");

    if (!clave || clave.length < 12) {
      throw new Error("La contraseña debe tener al menos 12 caracteres.");
    }

    const hash = await argon2.hash(clave, {
      type: argon2.argon2id,
    });

    console.log("\nHash Argon2id generado:\n");
    console.log(hash);
    console.log("\nGuarde únicamente este hash en us_clave_hash.");
  } catch (error) {
    console.error("No fue posible generar el hash:", error.message);
    process.exitCode = 1;
  }
}

main();
