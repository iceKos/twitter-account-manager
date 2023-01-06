docker build -t naka-twiter:1.0.0 .

docker run -p 3350:80 -d --name naka-twitter naka-twiter:1.0.0