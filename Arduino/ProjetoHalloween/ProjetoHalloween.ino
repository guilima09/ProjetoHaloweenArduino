#include <pitches.h>
#include <Servo.h>

// Sensor de distância:
const int pinoTrig = 12; // Pino Trigger
const int pinoEcho = 10; // Pino Echo

// LEDs:
const int ledOlho = 6;
const int ledMorto = 7;

// Buzzer:
const int buzzer = 3;

// Servo motor:
const int pinoServo = 9;
Servo meuServo;

// Variáveis de controle de estado:
bool estaMorto = false;
bool continuar = true;

// Distância limite para acionar a morte (em cm)
const double DISTANCIA_MORTE = 5.0; 

void setup() {
  Serial.begin(9600);
  pinMode(pinoTrig, OUTPUT);
  pinMode(pinoEcho, INPUT);

  pinMode(ledOlho, OUTPUT);
  pinMode(ledMorto, OUTPUT);

  meuServo.attach(pinoServo);
  meuServo.write(180); // Posição inicial (0 graus)

  // Informa o estado inicial para o backend
  Serial.println("ESTADO:VIVO");
}

void loop() {
  // 1. Processa comandos vindos do Node.js
  if (Serial.available() > 0) {
    String comando = Serial.readStringUntil('\n');
    processarComando(comando);
  }

  // 2. Medição de distância e envio ao backend
  double dist = calcularDistancia();
  
  // Envia no formato exato esperado pela API: "DIST:<cm>"
  Serial.print("DIST:");
  Serial.println(dist);

  // 3. Lógica de detecção de proximidade / Morte
  if (continuar && !estaMorto && dist > 0 && dist < DISTANCIA_MORTE) {
    estaMorto = true;
    
    // Notifica o backend sobre a mudança de estado
    Serial.println("ESTADO:MORTO");

    // Animação/Ação de morte
    digitalWrite(ledOlho, HIGH);
    digitalWrite(ledMorto, HIGH);
    meuServo.write(0); // Gira o servo para derrubar/mover o boneco
    
    tocarGrito();

    digitalWrite(ledOlho, LOW);
  }

  delay(200); // Intervalo de leitura
}

void processarComando(String comando) {
  comando.trim();
  comando.toUpperCase();

  if (comando == "REVIVER") {
    estaMorto = false;
    tocarReviver();
    digitalWrite(ledMorto, LOW);
    digitalWrite(ledOlho, LOW);
    meuServo.write(180); // Retorna o servo à posição inicial
    
    // Confirma a alteração de estado para o backend
    Serial.println("ESTADO:VIVO");
  }
  else if (comando == "PARAR") {
    continuar = !continuar;
    Serial.print("EVENTO:Sistema ");
    Serial.println(continuar ? "retomado" : "pausado");
  }
}

double calcularDistancia() {
  digitalWrite(pinoTrig, LOW);
  delayMicroseconds(2);
  digitalWrite(pinoTrig, HIGH);
  delayMicroseconds(10);
  digitalWrite(pinoTrig, LOW);

  double duracao = pulseIn(pinoEcho, HIGH, 30000); // Timeout de 30ms (~5 metros)
  if (duracao == 0) return 400.0; // Caso não receba eco

  double distanciaCM = duracao * 0.034 / 2;
  return distanciaCM;
}

void tocarGrito() {
  // 1) Sobe rápido e tremendo
  for (int f = 600; f < 3200; f += 40) {
    int tremor = ((f / 40) % 2 == 0) ? 60 : -60;
    tone(buzzer, f + tremor);
    delay(6);
  }

  // 2) Segura no agudo
  for (int i = 0; i < 30; i++) {
    tone(buzzer, 2800 + random(0, 900));
    delay(random(15, 30));
  }

  // 3) Cai falhando a voz
  for (int f = 3000; f > 400; f -= 60) {
    tone(buzzer, f + random(-150, 150));
    delay(8);
  }

  noTone(buzzer);
}

void tocarReviver() {
  // 1) Harpa subindo: arpejo de Dó maior, cada vez mais agudo
  int harpa[] = {NOTE_C5, NOTE_E5, NOTE_G5, NOTE_C6, NOTE_E6, NOTE_G6};
  for (int i = 0; i < 6; i++) {
    tone(buzzer, harpa[i], 120);
    delay(100);
  }

  // 2) Acorde celestial: alterna as 3 notas bem rápido para parecer um acorde só
  for (int i = 0; i < 24; i++) {
    tone(buzzer, NOTE_C6);
    delay(14);
    tone(buzzer, NOTE_E6);
    delay(14);
    tone(buzzer, NOTE_G6);
    delay(14);
  }

  // 3) Nota final aguda e brilhante, com vibrato suave
  for (int i = 0; i < 30; i++) {
    tone(buzzer, NOTE_C7 + ((i % 2) ? 25 : -25));
    delay(25);
  }
  noTone(buzzer);
}

