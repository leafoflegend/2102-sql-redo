const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/2102-sql-redo');

const runServer = async () => {
    console.log('Starting server...');

    await client.connect();

    await client.query(`
        DROP TABLE IF EXISTS trainers_pokemon;
        DROP TABLE IF EXISTS pokemon;
        DROP TABLE IF EXISTS trainers;

        CREATE TABLE trainers
        (
            id   SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );

        CREATE TABLE pokemon(
            id SERIAL PRIMARY KEY,
            type VARCHAR(255) NOT NULL,
            name VARCHAR(255) UNIQUE NOT NULL
        );

        CREATE TABLE trainers_pokemon(
            "pokemonId" INT REFERENCES pokemon(id),
            "trainerId" INT REFERENCES trainers(id),
            level INT DEFAULT 3,
            PRIMARY KEY ("pokemonId", "trainerId")
        );

        INSERT INTO trainers(name)
        VALUES ('Ash Ketchum');

        INSERT INTO pokemon(type, name)
        VALUES ('Grass', 'Bulbasaur'), ('Water', 'Squirtle'), ('Fire', 'Charmander');

        INSERT INTO trainers_pokemon ("pokemonId", "trainerId")
        VALUES (
            (SELECT pokemon.id FROM pokemon WHERE pokemon.name = 'Squirtle'),
            (SELECT trainers.id FROM trainers WHERE trainers.name = 'Ash Ketchum')
        );
    `);

    const result = await client.query(`
        SELECT tp.level, p.name as pokemon, t.name as trainer 
        FROM trainers_pokemon as tp 
            JOIN trainers as t ON tp."trainerId" = t.id 
            JOIN pokemon as p ON tp."pokemonId" = p.id;
    `);

    console.log('Ashes Pokemon: ', result.rows);

    console.log('DB connected.');
}

runServer();
