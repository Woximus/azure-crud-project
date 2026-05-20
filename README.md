# Azure CRUD Project

Prosta aplikacja webowa typu CRUD (Node.js + PostgreSQL) wdrażana w chmurze Azure przy pomocy potoku CI/CD (GitHub Actions), architektury mikrousług (Docker Compose) i infrastruktury jako kod (Terraform).

---

## 🚀 Jak uruchomić projekt?

### Opcja 1: Szybkie uruchomienie lokalnie
Wymaga zainstalowanego narzędzia Docker na komputerze.

1. Pobierz projekt:
   ```bash
   git clone [https://github.com/Woximus/azure-crud-project.git](https://github.com/Woximus/azure-crud-project.git)
2. Wejdź do folderu z projektem:
   ```bash
   cd azure-crud-project
3. Uruchom aplikację i bazę danych:
  ```bash
  docker-compose up --build.
