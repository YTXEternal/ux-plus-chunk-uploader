## Project File Explanation

### build

Project build configuration

common.ts Public configuration

dev.ts	   Development configuration

lib.ts	     Production configuration

test.ts           Testing configuration



### server

Local actual test API interfaces (this service needs to be started during project development)

```cmd
npm install

run:

npm run dev
```



### src/packages

Project source files



### src/main.ts,src/upload.ts

Debugging files during project development



### examples

Used for production testing after packaging into dist. Connect the output of dist using pnpm link and import it into the project for use.



### tests

Unit testing based on vitest.



## boot project

From the root directory of the project:

Front End

```
pnpm install
pnpm dev
```



Backend Service

```
cd server
npm install
```



Note: This project is based on commitizen for standardized code submission; please follow the prompts strictly for submissions as well as use the gitflow workflow for development. Thank you.

