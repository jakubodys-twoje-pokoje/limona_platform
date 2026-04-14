import type { FormularzData, RyzykoResult, PoziomRyzyka, KolorRyzyka } from '@limona/types';

export function obliczPoziomRyzyka(data: FormularzData): RyzykoResult {
  let score = 0;

  // Etap sprawy (max 40 pkt)
  if (data.etapSprawy === 'jest_komornik') score += 40;
  else if (data.etapSprawy === 'bez_komornika') score += 10;
  else score += 20; // nie_wiem

  // Kwota zadłużenia (max 30 pkt)
  if (data.kwotaZadluzenia === 'powyzej_500k') score += 30;
  else if (data.kwotaZadluzenia === '200_500k') score += 20;
  else if (data.kwotaZadluzenia === '50_200k') score += 10;
  else if (data.kwotaZadluzenia === 'do_50k') score += 5;
  else score += 12; // nie_wiem

  // Liczba wierzycieli (max 15 pkt)
  if (data.liczbaWierzycieli === 'wiecej') score += 15;
  else if (data.liczbaWierzycieli === '2-3') score += 8;
  else score += 2; // 1

  // Typ zobowiązań (max 10 pkt)
  if (data.typZobowiazan?.includes('alimenty')) score += 10;
  if (data.typZobowiazan?.includes('kredyt')) score += 3;

  let poziom: PoziomRyzyka;
  let kolor: KolorRyzyka;
  let procent: number;

  if (score <= 20) {
    poziom = 'niski';
    kolor = 'green';
    procent = 25;
  } else if (score <= 40) {
    poziom = 'sredni';
    kolor = 'orange';
    procent = 55;
  } else if (score <= 65) {
    poziom = 'wysoki';
    kolor = 'red';
    procent = 75;
  } else {
    poziom = 'krytyczny';
    kolor = 'darkred';
    procent = 90;
  }

  return { poziom, kolor, procent, score };
}

export const ryzykoOpisMap: Record<string, string> = {
  niski:
    'Twoja sytuacja nie jest jeszcze krytyczna, ale wymaga szybkiego działania. Wczesna interwencja może uchronić Cię przed poważniejszymi konsekwencjami.',
  sredni:
    'Twoja sytuacja jest niepokojąca i wymaga niezwłocznych kroków. Bez działania ryzyko eskalacji jest wysokie.',
  wysoki:
    'Twoja sytuacja jest poważna i wymaga natychmiastowego działania. Każdy dzień zwłoki zwiększa ryzyko utraty nieruchomości.',
  krytyczny:
    'Twoja sytuacja jest krytyczna. Potrzebujesz pilnej pomocy prawnej i finansowej — im szybciej zaczniesz działać, tym więcej możesz uratować.',
};
