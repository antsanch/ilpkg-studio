# Política de Gestión de Ramas y Flujo Git

**Proyecto:** ILPKG Studio (Interactive Lesson Package Studio)  
**Versión:** 1.0  
**Fecha:** Septiembre 2026  

---

## 1. Visión General del Modelo de Ramas

Para garantizar estabilidad en producción, trazabilidad del código y desarrollo continuo sin interrupciones, el proyecto adopta un modelo de ramas estructurado basado en dos ramas principales permanentes (**`main`** y **`develop`**) y ramas de trabajo efímeras específicas para cada funcionalidad.

```
       (Producción Estable)
main:    ───●────────────────────────────────────────●────────► (Tags: v1.0.0)
             \                                      /
              \ (Release Merge)                    / (Merge a Producción)
develop: ──────●─────────────●────────────────────●──────────► (Integración)
                \           / \                  /
                 \         /   \                /
feature/*:        ●───────●     ●──────────────●               (Trabajo por módulo)
             feature/fase1-db   feature/fase2-qr
```

---

## 2. Definición de Ramas Principales

| Rama | Propósito | Nivel de Estabilidad | Reglas de Fusión |
| :--- | :--- | :--- | :--- |
| **`main`** | **Producción.** Contiene exclusivamente código desplegado, probado al 100% y listo para usuarios finales. | 🟢 Crítico / Ultra-estable | **Nunca** se hace commit directo a `main`. Solo recibe fusiones desde `develop` (al cerrar una fase o release validado) o desde ramas `hotfix/*`. Cada fusión a `main` debe ir acompañada de un Tag de versión semántica (ej. `v1.0.0`). |
| **`develop`** | **Integración continua.** Rama base donde convergen todas las características completadas y aprobadas. | 🟡 Estable / En pruebas | Base de partida para cualquier rama `feature/*`. Recibe fusiones de ramas `feature/*` tras haber pasado la suite de pruebas automatizadas. |

---

## 3. Tipos de Ramas Secundarias (Efímeras)

### 3.1. Ramas de Funcionalidad (`feature/*`)
* **Prefijo:** `feature/`
* **Origen:** `develop`
* **Destino:** `develop`
* **Nomenclatura:** `feature/<fase-o-modulo>-<descripcion-corta>`  
  * *Ejemplos:* `feature/fase1-database-auth`, `feature/fase2-qr-engine`, `feature/fase3-h5p-editor`, `feature/fase4-xapi-player`.
* **Regla:** Solo abarca la funcionalidad específica descrita. Al completarse y pasar todas las pruebas unitarias y de integración, se fusiona en `develop` y se elimina la rama efímera.

### 3.2. Ramas de Corrección de Errores (`bugfix/*`)
* **Prefijo:** `bugfix/`
* **Origen:** `develop`
* **Destino:** `develop`
* **Nomenclatura:** `bugfix/<modulo>-<descripcion>` (ej. `bugfix/qr-shortcode-validation`).

### 3.3. Ramas de Emergencia en Producción (`hotfix/*`)
* **Prefijo:** `hotfix/`
* **Origen:** `main`
* **Destino:** `main` y `develop`
* **Nomenclatura:** `hotfix/<descripcion-critica>` (ej. `hotfix/security-ulid-leak`).

---

## 4. Guía Operativa de Comandos Git

### 4.1. Iniciar una Nueva Funcionalidad
```bash
# 1. Asegurarse de estar en develop actualizado
git checkout develop
git pull origin develop

# 2. Crear y cambiar a la rama de la funcionalidad
git checkout -b feature/fase2-qr-engine
```

### 4.2. Durante el Desarrollo
```bash
# Registrar cambios atómicos con commits descriptivos (Conventional Commits)
git add .
git commit -m "feat(qr): implement 302 redirection controller with scan counter"
```

### 4.3. Finalizar y Fusionar en `develop`
```bash
# 1. Ejecutar y validar que la suite completa pase al 100%
/usr/bin/php8.4 vendor/bin/phpunit

# 2. Cambiar a develop y fusionar sin fast-forward (para preservar el historial)
git checkout develop
git merge --no-ff feature/fase2-qr-engine -m "merge: integrate feature/fase2-qr-engine into develop"

# 3. Eliminar la rama de la funcionalidad una vez integrada
git branch -d feature/fase2-qr-engine
```

### 4.4. Liberar a Producción (`main`)
```bash
# 1. Cambiar a main
git checkout main

# 2. Fusionar los cambios probados de develop
git merge --no-ff develop -m "release: deploy stable Phase to production"

# 3. Etiquetar la versión
git tag -a v1.0.0 -m "Release v1.0.0 - ILPKG Studio Base"
```

---

## 5. Convención de Mensajes de Commit (Conventional Commits)

Los commits deben seguir el formato: `<tipo>(<alcance>): <descripción>`

* `feat:` Nueva característica o funcionalidad (ej. `feat(auth): add PBAC permissions seeder`).
* `fix:` Corrección de un fallo o bug (ej. `fix(qr): enforce uppercase on custom short code`).
* `docs:` Cambios exclusivamente en documentación (ej. `docs: add git branching policy`).
* `test:` Adición o refactorización de pruebas unitarias/funcionales (ej. `test(scores): verify xapi percentage calculation`).
* `refactor:` Modificación de código que no altera funcionalidad ni corrige bugs (ej. `refactor(models): extract ULID concern`).
* `chore:` Tareas rutinarias, configuración de herramientas o dependencias (ej. `chore: update .gitignore with sqlite rules`).

---

## 6. Estado Actual del Repositorio

* **Rama activa:** `develop`
* **Rama de producción:** `main` (inicializada con el código probado de la **Fase 1**)
* **Próxima rama de trabajo:** `develop` (Estación de trabajo ILPKG Studio)
