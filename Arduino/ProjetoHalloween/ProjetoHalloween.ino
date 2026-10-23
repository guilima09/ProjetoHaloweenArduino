#include <pitches.h>
#include <Servo.h>

// Sensor de distância:
const int pinoTrig = 12; // Pino Trigger
const int pinoEcho = 10; // Pino Echo

// LEDs:
const int ledOlho = 6;
const int ledMorto = 7;

// Buzzer:
const int buzzer = 3; // Adicionada a atribuição do pino e ';'

// Servo motor:
const int pinoServo = 9; // Alterado para o pino 9 para evitar conflito com ledOlho (pino 6)
Servo meuServo;

// Músicas:
int musical[] = {NOTE_CS5, NOTE_B4, NOTE_GS4, NOTE_B4, NOTE_GS4, NOTE_A4, NOTE_GS4, NOTE_B4};
int duracoesMusical[] = {2, 2, 2, 2, 2, 4, 2, 1};

int gameOfThrones[] = {NOTE_G4, NOTE_C4, NOTE_DS4, NOTE_F4, NOTE_G4, NOTE_C4, NOTE_DS4, NOTE_F4,
                      NOTE_G4, NOTE_C4, NOTE_DS4, NOTE_F4, NOTE_G4, NOTE_C4, NOTE_DS4, NOTE_F4};
int duracoesGOT[] = {2, 2, 4, 4, 2, 2, 4, 4, 2, 2, 4, 4, 2, 2, 4, 4};

void setup() {
  Serial.begin(9600);
  pinMode(pinoTrig, OUTPUT);
  pinMode(pinoEcho, INPUT);

  pinMode(ledOlho, OUTPUT);
  pinMode(ledMorto, OUTPUT);

  meuServo.attach(pinoServo);
  meuServo.write(0); // Posição inicial do servo (0 graus)
}

void loop() {
  double dist = calcularDistancia();

  if (dist < 100000) {
    digitalWrite(ledOlho, HIGH);
    digitalWrite(ledMorto, HIGH);

    // Movimentação do servo
    meuServo.write(90); // Gira para 90 graus
    delay(500);

    // tocarMusica(); // música de antes, descomente para voltar a usar
    tocarGrito();

    // Retorna o servo e apaga os LEDs após tocar
    meuServo.write(0);
    digitalWrite(ledOlho, LOW);
    digitalWrite(ledMorto, LOW);
  } else {
    digitalWrite(ledOlho, LOW);
    digitalWrite(ledMorto, LOW);
  }

  delay(500);
}

void tocarMusica() {
  for (int i = 0; i < 8; i++) {
    int duracaoNota = 500 / duracoesMusical[i];
    tone(buzzer, musical[i], duracaoNota); // Usa a variável 'buzzer'
    
    int pausaEntreNotas = duracaoNota * 1.3;
    delay(pausaEntreNotas);
    
    noTone(buzzer);
  }
}

void tocarGrito() {
  // 1) Sobe rápido e tremendo, como um grito começando
  for (int f = 600; f < 3200; f += 40) {
    int tremor = ((f / 40) % 2 == 0) ? 60 : -60;
    tone(buzzer, f + tremor);
    delay(6);
  }

  // 2) Segura no agudo, pulando entre notas altas (o grito se sustentando)
  for (int i = 0; i < 40; i++) {
    tone(buzzer, 2800 + random(0, 900));
    delay(random(15, 30));
  }

  // 3) Cai com a "voz" falhando
  for (int f = 3000; f > 400; f -= 60) {
    tone(buzzer, f + random(-150, 150));
    delay(8);
  }

  noTone(buzzer);
}

double calcularDistancia() {
  digitalWrite(pinoTrig, LOW);
  delayMicroseconds(2);
  digitalWrite(pinoTrig, HIGH);
  delayMicroseconds(10);
  digitalWrite(pinoTrig, LOW);

  double duracao = pulseIn(pinoEcho, HIGH);
  double distanciaCM = duracao * 0.034 / 2;

  Serial.print("Distancia: ");
  Serial.print(distanciaCM);
  Serial.println(" cm");

  return distanciaCM;
}