import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genreNames = ['Fiction', 'Science Fiction', 'Mystery', 'Nonfiction'];

type BookSeed = { title: string; author: string; isbn: string; publishedYear: number; genre: string };

const books: BookSeed[] = [
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', publishedYear: 1960, genre: 'Fiction' },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', publishedYear: 1925, genre: 'Fiction' },
  { title: 'Beloved', author: 'Toni Morrison', isbn: '9781400033416', publishedYear: 1987, genre: 'Fiction' },
  { title: 'Middlemarch', author: 'George Eliot', isbn: '9780141439549', publishedYear: 1871, genre: 'Fiction' },
  { title: 'Dune', author: 'Frank Herbert', isbn: '9780441172719', publishedYear: 1965, genre: 'Science Fiction' },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '9780441569595', publishedYear: 1984, genre: 'Science Fiction' },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '9780441478125', publishedYear: 1969, genre: 'Science Fiction' },
  { title: 'Foundation', author: 'Isaac Asimov', isbn: '9780553293357', publishedYear: 1951, genre: 'Science Fiction' },
  { title: 'The Murder of Roger Ackroyd', author: 'Agatha Christie', isbn: '9780007136834', publishedYear: 1926, genre: 'Mystery' },
  { title: 'The Maltese Falcon', author: 'Dashiell Hammett', isbn: '9780679722649', publishedYear: 1930, genre: 'Mystery' },
  { title: 'The Big Sleep', author: 'Raymond Chandler', isbn: '9780394758282', publishedYear: 1939, genre: 'Mystery' },
  { title: 'In the Woods', author: 'Tana French', isbn: '9780670918904', publishedYear: 2007, genre: 'Mystery' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', publishedYear: 2011, genre: 'Nonfiction' },
  { title: 'The Immortal Life of Henrietta Lacks', author: 'Rebecca Skloot', isbn: '9781400052189', publishedYear: 2010, genre: 'Nonfiction' },
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9780393317558', publishedYear: 1997, genre: 'Nonfiction' },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', publishedYear: 2011, genre: 'Nonfiction' },
];

async function main() {
  // Upsert genres so the seed can be re-run safely
  for (const name of genreNames) {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
  }

  const genres = await prisma.genre.findMany();
  const genreIdByName = new Map(genres.map((g) => [g.name, g.id]));

  // isbn is unique, so skipDuplicates makes re-running safe
  await prisma.book.createMany({
    data: books.map(({ genre, ...book }) => {
      const genreId = genreIdByName.get(genre);
      if (!genreId) throw new Error(`Unknown genre: ${genre}`);
      return { ...book, genreId };
    }),
    skipDuplicates: true,
  });

  const counts = await prisma.genre.findMany({
    select: { name: true, _count: { select: { books: true } } },
  });
  console.log('Seed complete:', counts.map((c) => `${c.name}: ${c._count.books}`).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
