FROM golang:alpine3.22 AS tesla-control

RUN apk add --no-cache git

WORKDIR /src

RUN git clone https://github.com/teslamotors/vehicle-command.git .

WORKDIR /src/cmd/tesla-control

RUN go build -o /usr/local/bin/tesla-control

FROM denoland/deno:alpine-2.5.6

COPY --from=tesla-control /usr/local/bin/tesla-control /usr/local/bin/tesla-control

WORKDIR /app

COPY deno.json .
COPY deno.lock .
COPY src src
COPY main.ts .

RUN deno cache main.ts

ENTRYPOINT ["deno", "run", "--allow-run", "--allow-net", "--allow-read", "--allow-env", "main.ts"]
