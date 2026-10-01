# 1dl-server 
Backend of the 1dl-project application. 1dl-project is an app that lets you save, 
find and share temporary text entries (such as notes). Each entry has a text tag and 
each tag has its own dedicated page where all entries with that tag are grouped 
together. Tags are also used to search for and access entries: any user can view any 
entry as long as they know its tag. Moreover, any user can save their entries using any tag, including tags already used by other users (however, users cannot delete 
entries created by others). Both the lifetime of entries and the number of entries 
sharing the same tag are limited.

## Requirements
* Node.js (version >= 20)
* PostgreSQL (version >= 16)
* Redis (version >= 6)

Alternatively, you can run the server inside a docker container 
(In this case, you only need Docker installed).

## Installation
In the root directory of the project, create a `.env` file containing
the environment variables. Use the `.env.example` file as a base, defining 
the following entries:
* `PG_PASSWORD`: Database password
* `REDIS_PASSWORD`
* `HASH_SALT`
* `SERVICE_ID`: used to connect the backend and frontend of the app.
Make sure `SERVICE_ID` on the server matches `SERVICE_ID` in the client.
To install the server on your machine, run the following command:
```bash
npm install
```

## Database setup (Unix)
```bash
# Creating user and databases
chmod u+x ./init-postgres.sh
POSTGRES_PASSWORD=QWERTY ./init-postgres.sh
```
Make sure you replaced `QWERTY` with some sensible password and it
matches the `PG_PASSWORD` entry in the `.env` file.
```base
# Creating tables
npm run dev:init
```

## Database setup (Docker)
```bash
docker compose run --rm http npm run init
```

## Building
```bash
npm run build
```
The files will be located in the `dist` directory.

## Launching
The backend consists of an HTTP server (`http.ts`), WebSocket server
(`ws.ts`), and a worker (`worker.ts`), each of which can be run independently:
```bash
npm run preview:http
npm run preview:ws
npm run preview:worker
```
Or you can run them all at once:
```bash
npm run preview
```
If the environment variables are available in the terminal session
and the application has already been built, you can run the files directly:
```bash
node ./dist/http.js
node ./dist/ws.js
node ./dist/worker.js
```
To run inside a Docker container:
```bash
docker compose up -d
# `docker compose down` to stop 
```