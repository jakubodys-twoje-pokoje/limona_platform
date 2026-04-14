import { z } from 'zod';

export const FormularzSchema = z.object({
  typNieruchomosci: z.enum(['mieszkanie', 'dom', 'dzialka', 'lokal']),
  etapSprawy: z.enum(['bez_komornika', 'jest_komornik', 'nie_wiem']),
  kwotaZadluzenia: z.enum(['do_50k', '50_200k', '200_500k', 'powyzej_500k', 'nie_wiem']),
  liczbaWierzycieli: z.enum(['1', '2-3', 'wiecej']),
  typZobowiazan: z
    .array(z.enum(['kredyt', 'zalegloscii', 'alimenty', 'inne']))
    .min(1, 'Wybierz co najmniej jeden rodzaj zobowiązania'),
  adresNieruchomosci: z.string().max(500).optional(),
  opisSytuacji: z.string().max(2000).optional(),
});

export type FormularzInput = z.infer<typeof FormularzSchema>;

export const KonsultacjaSchema = z.object({
  zgloszenieId: z.string().optional(),
  imieNazwisko: z.string().min(3).max(150),
  email: z.string().email(),
  telefon: z.string().regex(/^\+?[0-9\s\-()]{9,15}$/, 'Nieprawidłowy numer telefonu'),
  preferowany: z.string().min(3).max(200),
  opisProblemu: z.string().max(1000).optional(),
});

export type KonsultacjaInput = z.infer<typeof KonsultacjaSchema>;
