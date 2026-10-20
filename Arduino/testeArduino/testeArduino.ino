/*
  TESTE DO PROJETO HALLOWEEN - BONECO DE VODOU
  Use com o Arduino conectado somente pelo USB.

  Este programa SIMULA sensor, servo e buzzer para testar a comunicacao
  serial com o Node.js e a tela. O LED_BUILTIN pisca ao receber comandos.

  Protocolo serial a 9600 baud:
    Arduino -> Node: DIST:<cm>, ESTADO:VIVO/MORTO, EVENTO:<texto>
    Node -> Arduino: REVIVER, PARAR, SFX:1 ... SFX:5
*/

const int LED_TESTE = LED_BUILTIN;
const unsigned long INTERVALO_DISTANCIA = 700;
const unsigned long DURACAO_LED = 180;

unsigned long ultimaDistancia = 0;
unsigned long apagarLedEm = 0;
int distanciaSimulada = 100;
int direcao = -1;
bool humanoVivo = true;
bool ledAceso = false;

void evento(const char *texto) {
  Serial.print("EVENTO:");
  Serial.println(texto);
}

void informarEstado() {
  Serial.print("ESTADO:");
  Serial.println(humanoVivo ? "VIVO" : "MORTO");
}

void piscarLed() {
  digitalWrite(LED_TESTE, HIGH);
  ledAceso = true;
  apagarLedEm = millis() + DURACAO_LED;
}

void processarComando(String comando) {
  comando.trim();
  comando.toUpperCase();

  if (comando == "REVIVER") {
    if (!humanoVivo) {
      humanoVivo = true;
      informarEstado();
      evento("Teste: comando REVIVER recebido; servo simulado.");
    } else {
      evento("Teste: o humano ja esta vivo.");
    }
    piscarLed();
  }
  else if (comando == "PARAR") {
    evento("Teste: comando PARAR recebido; movimento simulado interrompido.");
    piscarLed();
  }
  else if (comando.startsWith("SFX:")) {
    int numero = comando.substring(4).toInt();
    if (numero >= 1 && numero <= 5) {
      Serial.print("EVENTO:Teste: SFX ");
      Serial.print(numero);
      Serial.println(" recebido; buzzer simulado.");
    } else {
      evento("SFX invalido. Use SFX:1 ate SFX:5.");
    }
    piscarLed();
  }
  else if (comando.startsWith("DISTTEST:")) {
    // Opcional: envie DISTTEST:15 pelo Monitor Serial para testar proximidade.
    int valor = comando.substring(9).toInt();
    if (valor >= 2 && valor <= 200) {
      distanciaSimulada = valor;
      Serial.print("DIST:");
      Serial.println(distanciaSimulada);
      evento("Leitura de distancia de teste definida manualmente.");
    } else {
      evento("Distancia invalida. Use um valor entre 2 e 200 cm.");
    }
  }
  else if (comando.length() > 0) {
    evento("Comando desconhecido.");
  }
}

void setup() {
  pinMode(LED_TESTE, OUTPUT);
  digitalWrite(LED_TESTE, LOW);
  Serial.begin(9600);
  randomSeed(analogRead(A0));

  delay(500);
  evento("Arduino de teste iniciado; componentes fisicos simulados.");
  informarEstado();
  Serial.print("DIST:");
  Serial.println(distanciaSimulada);
}

void loop() {
  // Recebe comandos enviados pelo backend Node.js, um por linha.
  if (Serial.available() > 0) {
    String comando = Serial.readStringUntil('\n');
    processarComando(comando);
  }

  // Gera leituras falsas de distancia entre 5 e 100 cm.
  if (millis() - ultimaDistancia >= INTERVALO_DISTANCIA) {
    ultimaDistancia = millis();

    distanciaSimulada += direcao * random(5, 16);
    if (distanciaSimulada <= 5) {
      distanciaSimulada = 5;
      direcao = 1;
    } else if (distanciaSimulada >= 100) {
      distanciaSimulada = 100;
      direcao = -1;
    }

    Serial.print("DIST:");
    Serial.println(distanciaSimulada);

    // Simula a aproximacao de alguem e a morte do humano.
    if (distanciaSimulada < 30 && humanoVivo) {
      humanoVivo = false;
      informarEstado();
      evento("Teste: alguem se aproximou; humano simulado como morto.");
    }
  }

  if (ledAceso && (long)(millis() - apagarLedEm) >= 0) {
    digitalWrite(LED_TESTE, LOW);
    ledAceso = false;
  }
}