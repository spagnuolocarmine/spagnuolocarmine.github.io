
FROM alpine/git

WORKDIR /peer
RUN git clone https://github.com/spagnuolocarmine/p2ppublishsubscribe.git

FROM maven:3.5-jdk-8-alpine
WORKDIR /app
COPY --from=0 /p2ppublishsubscribe /peer 

RUN mvn install
FROM openjdk:8-jre-alpine
WORKDIR /peer
COPY --from=1 /peer/target/publishsubscribe-1.0.jar /peer
CMD ["java -jar publishsubscribe-1.0.jar"]


