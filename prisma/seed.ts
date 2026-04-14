import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(plain: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12');
  return bcrypt.hash(plain, rounds);
}

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin ────────────────────────────────────────────────────────────────
  await prisma.admin.upsert({
    where: { email: 'admin@limona.com.pl' },
    update: {},
    create: {
      email: 'admin@limona.com.pl',
      passwordHash: await hashPassword('ZmienMniePoPierwszymLogowaniu!2026'),
      imie: 'Admin',
      rola: 'superadmin',
    },
  });
  console.log('✅ Admin created');

  // ─── Materiały edukacyjne ─────────────────────────────────────────────────
  const material1 = await prisma.material.upsert({
    where: { id: 'mat-1' },
    update: {},
    create: {
      id: 'mat-1',
      tytul: 'Przewodnik: Prawa dłużnika w egzekucji komorniczej',
      opis: 'Kompletny przewodnik po przepisach prawa chroniących dłużnika podczas egzekucji komorniczej.',
      typ: 'pdf',
      url: 'https://placeholder.example.com/materialy/prawa-dluznika.pdf',
      kolejnosc: 1,
      kategoria: 'prawo',
    },
  });

  const material2 = await prisma.material.upsert({
    where: { id: 'mat-2' },
    update: {},
    create: {
      id: 'mat-2',
      tytul: 'Jak działa cesja wierzytelności — krok po kroku',
      opis: 'Wyjaśnienie procesu cesji: od wyceny nieruchomości po finalizację transakcji.',
      typ: 'pdf',
      url: 'https://placeholder.example.com/materialy/cesja-krok-po-kroku.pdf',
      kolejnosc: 2,
      kategoria: 'opcje_wyjscia',
    },
  });

  const material3 = await prisma.material.upsert({
    where: { id: 'mat-3' },
    update: {},
    create: {
      id: 'mat-3',
      tytul: 'Wideo: Negocjacje z wierzycielem — strategie i techniki',
      opis: 'Praktyczne strategie negocjacyjne z bankami i firmami windykacyjnymi.',
      typ: 'wideo',
      url: 'https://placeholder.example.com/materialy/negocjacje-wideo',
      kolejnosc: 3,
      kategoria: 'windykacja',
    },
  });
  console.log('✅ Materiały edukacyjne created');

  // ─── Przykładowe oferty ────────────────────────────────────────────────────
  await prisma.oferta.upsert({
    where: { id: 'oferta-1' },
    update: {},
    create: {
      id: 'oferta-1',
      tytul: 'Mieszkanie 3-pokojowe, Warszawa Mokotów',
      opis: 'Mieszkanie 68m² na 4. piętrze w bloku z lat 90. Stan do remontu. Zadłużenie z tytułu kredytu hipotecznego. Postępowanie komornicze w toku.',
      typ: 'mieszkanie',
      lokalizacja: 'Warszawa, Mokotów',
      wojewodztwo: 'mazowieckie',
      powiat: 'Warszawa',
      gmina: 'Mokotów',
      kodPocztowy: '02-500',
      wartoscNieruchomosci: 650000,
      kwotaZadluzenia: 420000,
      cenaMinimalna: 380000,
      potencjalnyZysk: 270000,
      etapEgzekucji: 'jest_komornik',
      typZobowiazan: ['kredyt'],
      liczbaWierzycieli: 1,
      zdjecia: [],
      dokumenty: [],
      status: 'aktywna',
      wyrozniiona: true,
    },
  });

  await prisma.oferta.upsert({
    where: { id: 'oferta-2' },
    update: {},
    create: {
      id: 'oferta-2',
      tytul: 'Dom jednorodzinny, Kraków okolice',
      opis: 'Dom wolnostojący 150m² na działce 600m². Zadłużenie alimentacyjne i kredytowe. Pilna sprzedaż.',
      typ: 'dom',
      lokalizacja: 'Wieliczka, pow. wielicki',
      wojewodztwo: 'małopolskie',
      powiat: 'wielicki',
      gmina: 'Wieliczka',
      kodPocztowy: '32-020',
      wartoscNieruchomosci: 850000,
      kwotaZadluzenia: 580000,
      cenaMinimalna: 520000,
      potencjalnyZysk: 330000,
      etapEgzekucji: 'jest_komornik',
      typZobowiazan: ['kredyt', 'alimenty'],
      liczbaWierzycieli: 2,
      zdjecia: [],
      dokumenty: [],
      status: 'aktywna',
      wyrozniiona: false,
    },
  });

  await prisma.oferta.upsert({
    where: { id: 'oferta-3' },
    update: {},
    create: {
      id: 'oferta-3',
      tytul: 'Działka budowlana 1200m², Poznań okolice',
      opis: 'Działka budowlana z WZ, uzbrojona, dobry dojazd. Zadłużenie z tytułu zaległości w opłatach.',
      typ: 'dzialka',
      lokalizacja: 'Swarzędz, pow. poznański',
      wojewodztwo: 'wielkopolskie',
      powiat: 'poznański',
      gmina: 'Swarzędz',
      kodPocztowy: '62-020',
      wartoscNieruchomosci: 320000,
      kwotaZadluzenia: 95000,
      cenaMinimalna: 180000,
      potencjalnyZysk: 140000,
      etapEgzekucji: 'bez_komornika',
      typZobowiazan: ['zalegloscii'],
      liczbaWierzycieli: 1,
      zdjecia: [],
      dokumenty: [],
      status: 'aktywna',
      wyrozniiona: false,
    },
  });

  await prisma.oferta.upsert({
    where: { id: 'oferta-4' },
    update: {},
    create: {
      id: 'oferta-4',
      tytul: 'Lokal usługowy 85m², Wrocław centrum',
      opis: 'Lokal użytkowy w ścisłym centrum Wrocławia. Zadłużenie z tytułu zaległości czynszowych i kredytu.',
      typ: 'lokal',
      lokalizacja: 'Wrocław, Śródmieście',
      wojewodztwo: 'dolnośląskie',
      powiat: 'Wrocław',
      gmina: 'Wrocław',
      kodPocztowy: '50-001',
      wartoscNieruchomosci: 780000,
      kwotaZadluzenia: 490000,
      cenaMinimalna: 440000,
      potencjalnyZysk: 340000,
      etapEgzekucji: 'jest_komornik',
      typZobowiazan: ['kredyt', 'zalegloscii'],
      liczbaWierzycieli: 3,
      zdjecia: [],
      dokumenty: [],
      status: 'aktywna',
      wyrozniiona: false,
    },
  });

  await prisma.oferta.upsert({
    where: { id: 'oferta-5' },
    update: {},
    create: {
      id: 'oferta-5',
      tytul: 'Mieszkanie 2-pokojowe, Gdańsk Wrzeszcz',
      opis: 'Mieszkanie 52m² w dobrym stanie, blisko Politechniki Gdańskiej. Zadłużenie głównie z kredytu hipotecznego.',
      typ: 'mieszkanie',
      lokalizacja: 'Gdańsk, Wrzeszcz',
      wojewodztwo: 'pomorskie',
      powiat: 'Gdańsk',
      gmina: 'Gdańsk',
      kodPocztowy: '80-219',
      wartoscNieruchomosci: 480000,
      kwotaZadluzenia: 310000,
      cenaMinimalna: 280000,
      potencjalnyZysk: 200000,
      etapEgzekucji: 'bez_komornika',
      typZobowiazan: ['kredyt'],
      liczbaWierzycieli: 1,
      zdjecia: [],
      dokumenty: [],
      status: 'aktywna',
      wyrozniiona: true,
    },
  });
  console.log('✅ Przykładowe oferty created');

  // ─── Przykładowe zgłoszenie ────────────────────────────────────────────────
  await prisma.zgloszenie.upsert({
    where: { id: 'zgl-1' },
    update: {},
    create: {
      id: 'zgl-1',
      typNieruchomosci: 'mieszkanie',
      etapSprawy: 'jest_komornik',
      kwotaZadluzenia: '200_500k',
      liczbaWierzycieli: '2-3',
      typZobowiazan: ['kredyt', 'zalegloscii'],
      adresNieruchomosci: 'ul. Przykładowa 1, 00-001 Warszawa',
      opisSytuacji: 'Przykładowe zgłoszenie seed – komornik wszczął egzekucję 6 miesięcy temu.',
      poziomRyzyka: 'wysoki',
      ryzykoScore: 58,
      ryzykoProcent: 75,
      status: 'w_toku',
      zaplacono: true,
      zaplaconoAt: new Date(),
      email: 'przyklad@example.com',
    },
  });
  console.log('✅ Przykładowe zgłoszenie created');

  // Powiąż materiały ze zgłoszeniem
  for (const mat of [material1, material2, material3]) {
    await prisma.zgloszenieUcesMaterialu.upsert({
      where: {
        zgloszenieId_materialId: { zgloszenieId: 'zgl-1', materialId: mat.id },
      },
      update: {},
      create: {
        zgloszenieId: 'zgl-1',
        materialId: mat.id,
      },
    });
  }
  console.log('✅ Materiały linked to zgłoszenie');

  console.log('✅ Seed complete!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
