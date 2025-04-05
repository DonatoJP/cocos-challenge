# Cocos Challenge

Este repositorio contiene la solucion al [challenge de backend para Cocos](https://github.com/cocos-capital/cocos-challenge/blob/main/backend-challenge.md).

## Ejecucion

Para ejecutar el proyecto, se puede hacer por medio de Docker y Docker Compose corriendo el comando. Primero, las variables de ambiente deben ser configuradas en el archivo `.env` del root del proyecto. Se puede utilizar `.env.example` como ejemplo:

```sh
cp .env.example .env
docker compose up -d --build
```

Para ver logs del servicio:

```sh
docker compose logs -f cocos-api
```

Para frenar su ejecucion:

```sh
docker compose stop
```

Para eliminar volumenes y recursos:

```sh
docker compose down --remove-orphans -v
```