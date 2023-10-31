### docker-compose.yml
```yml
services:
  nest-app:
    build: 
      context: ./
      dockerfile: ./Dockerfile
    depends_on:
      - mysql-container
      - redis-container
    ports:
      - '3000:3000'
  mysql-container:
    image: mysql:5.7
    ports:
      - '3306:3306'
    volumes:
      - C:/Users/guiyu/code/mysql-data:/var/lib/mysql
  redis-container:
    image: redis
    ports:
      - '6379:6379'
    volumes:
      - C:/Users/guiyu/code/redis-data:/data
```

启动docker-compose

```sh
docker-compose up
```

使用networks
```yml
services:
  nest-app:
    build: 
      context: ./
      dockerfile: ./Dockerfile
    depends_on:
      - mysql-container
      - redis-container
    ports:
      - '3000:3000'
    networks:
      - common-network
  mysql-container:
    image: mysql:5.7
    restart: always
    ports:
      - '3306:3306'
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      TZ: Asia/Shanghai
    volumes:
      - C:/Users/guiyu/code/mysql-data:/var/lib/mysql
    command: 
      --max_connections=1000
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --default-authentication-plugin=mysql_native_password
    networks:
      - common-network
  redis-container:
    image: redis:latest
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - C:/Users/guiyu/code/redis-data:/data
    networks:
      - common-network
networks:
  common-network:
    driver: bridge
```

这节我们通过 docker、docker-compose 两种方式来部署了 nest 项目。

docker 的方式需要手动 docker build 来构建 nest 应用的镜像。

然后按顺序使用 docker run 来跑 mysql、redis、nest 容器。

（要注意 nest 容器里需要使用宿主机 ip 来访问 mysql、redis 服务）

而 docker compose 就只需要写一个 docker-compose.yml 文件，配置多个 service 的启动方式和 depends_on 依赖顺序。

然后 docker-compose up 就可以批量按顺序启动一批容器。

基本上，我们跑 Nest 项目都会依赖别的服务，所以在单台机器跑的时候都是需要用 Docker Compose 的。