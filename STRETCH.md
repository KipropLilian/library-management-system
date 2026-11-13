\## Prisma vs. a Document Database



Modeling in Prisma felt more structured than what I expected from a document database like MongoDB. In MongoDB, I would embed the genre inside each book, so one read returns everything. In Prisma, the schema pushed me toward normalized tables with explicit relations: a `Genre` table, a `Book` table, and a `genreId` foreign key between them. Reading a book with its genre takes an `include`, not a nested document. The schema file is also the single source of truth, since it generates both the migrations and the typed client. The main adjustment was designing the relations up front, because changing a foreign key later means a new migration rather than just writing a different document shape.

