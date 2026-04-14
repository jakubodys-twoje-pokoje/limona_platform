// ─── Formularz dłużnika ──────────────────────────────────────────────────────

export type TypNieruchomosci = 'mieszkanie' | 'dom' | 'dzialka' | 'lokal';
export type EtapSprawy = 'bez_komornika' | 'jest_komornik' | 'nie_wiem';
export type KwotaZadluzenia = 'do_50k' | '50_200k' | '200_500k' | 'powyzej_500k' | 'nie_wiem';
export type LiczbaWierzycieli = '1' | '2-3' | 'wiecej';
export type TypZobowiazan = 'kredyt' | 'zalegloscii' | 'alimenty' | 'inne';

export interface FormularzData {
  typNieruchomosci: TypNieruchomosci;
  etapSprawy: EtapSprawy;
  kwotaZadluzenia: KwotaZadluzenia;
  liczbaWierzycieli: LiczbaWierzycieli;
  typZobowiazan: TypZobowiazan[];
  adresNieruchomosci?: string;
  opisSytuacji?: string;
}

// ─── Ryzyko ──────────────────────────────────────────────────────────────────

export type PoziomRyzyka = 'niski' | 'sredni' | 'wysoki' | 'krytyczny';
export type KolorRyzyka = 'green' | 'orange' | 'red' | 'darkred';

export interface RyzykoResult {
  poziom: PoziomRyzyka;
  kolor: KolorRyzyka;
  procent: number;
  score: number;
}

// ─── Inwestor ─────────────────────────────────────────────────────────────────

export type RolaInwestora = 'inwestor' | 'vip' | 'admin';
export type PlanAbonamentu = 'miesiecznie' | 'rocznie';

export interface InwestorSession {
  id: string;
  email: string;
  imie: string;
  nazwisko: string;
  rola: RolaInwestora;
  abonamentAktywny: boolean;
  abonamentDo?: Date | null;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export type RolaAdmina = 'superadmin' | 'moderator';

export interface AdminSession {
  id: string;
  email: string;
  imie: string;
  rola: RolaAdmina;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface ApiSuccess<T = unknown> {
  data: T;
  message?: string;
}

// ─── Oferta ───────────────────────────────────────────────────────────────────

export type TypOferty = 'mieszkanie' | 'dom' | 'dzialka' | 'lokal';
export type StatusOferty = 'aktywna' | 'zarezerwowana' | 'zamknieta' | 'robocza';
export type EtapEgzekucji = 'bez_komornika' | 'jest_komornik' | 'licytacja' | 'inne';
