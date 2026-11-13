## Schema Decisions

**Book references Genre by foreign key instead of embedding it.** Genres are shared
across many books, so storing the genre name inside each book would duplicate it and
make renames error-prone: changing "Sci-Fi" to "Science Fiction" would mean updating
every affected row. With a `Genre` table and a `genreId` foreign key, a genre is stored
once, can carry its own attributes later (description, parent genre), and can be
queried directly ("list all Mystery books"). The `@relation` also lets Postgres enforce
that a book can only point to a genre that exists. The trade-off is an extra join when
reading a book with its genre, which is cheap at this scale and handled by Prisma's
`include`.

Other decisions:
- `Role` is a Postgres enum, so only `PATRON` or `LIBRARIAN` can be stored.
- `isbn` is unique and is the natural key for deduplicating books in the seed.
- `Review` has a composite unique on `(bookId, userId)`, so each user reviews a book once.
