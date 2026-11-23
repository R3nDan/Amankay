FROM eclipse-temurin:25-jdk AS build

WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw
COPY src/ src/
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=build /workspace/target/amankay-backend-0.1.0-SNAPSHOT.jar /app/amankay-backend.jar
EXPOSE 10000
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=50.0", "-XX:+UseSerialGC", "-Xss512k", "-jar", "/app/amankay-backend.jar"]
