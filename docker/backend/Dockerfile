FROM ghcr.io/prefix-dev/pixi:0.61.0-noble AS build

WORKDIR /app

COPY pixi.toml .
COPY pixi.lock .

RUN pixi install && pixi shell-hook > /entrypoint.sh
RUN echo 'exec "$@"' >> /entrypoint.sh

FROM ubuntu:24.04 AS production

WORKDIR /app

COPY --from=build /app/.pixi/envs/default ./.pixi/envs/default
COPY --from=build /entrypoint.sh /entrypoint.sh

COPY src/api ./src/api

EXPOSE 8001

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]

CMD ["uvicorn", "src.api.router:app", "--reload", "--host", "0.0.0.0", "--port", "8001"]