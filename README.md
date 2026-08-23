# SHUa vs PTT — Sesión clínica interactiva

Presentación web tipo *scrollytelling* para una sesión clínica de Nefrología: diagnóstico diferencial entre el **Síndrome Hemolítico Urémico atípico (SHUa)** y la **Púrpura Trombocitopénica Trombótica (PTT)**, construida sobre un caso clínico hilo conductor.

Sitio 100% estático (HTML/CSS/JS puro, sin build step, sin frameworks) — pensado para publicarse en **GitHub Pages**.

## Estructura

```
index.html              → contenido y estructura de todas las secciones
assets/css/style.css    → estética, paleta de color, animaciones de scroll
assets/js/main.js       → interactividad: reveals, contadores, quiz, navegación
```

## Antes de presentar: qué editar

Todo el contenido clínico vive en `index.html`. Busca y sustituye:

- El caso clínico (sección `#case` en adelante) es un **caso compuesto con fines docentes**, clínicamente representativo pero no un paciente real. Si vas a usar un caso real anonimizado, sustituye los datos de anamnesis, laboratorio (`#labs`), complemento/genética (`#ddx`) y la línea temporal de tratamiento (`#course`) por los tuyos, respetando siempre la anonimización.
- Revisa la sección de bibliografía (`#refs`) y actualízala si al preparar la sesión existen guías más recientes.

## Cómo previsualizar en local

No hace falta ningún servidor: puedes abrir `index.html` directamente con doble clic en el navegador. Si prefieres servirlo (recomendado para evitar problemas de rutas relativas en algunos navegadores):

```bash
npx serve .
```

o con Python:

```bash
python -m http.server 8000
```

y abre `http://localhost:8000`.

## Desplegar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser privado o público; GitHub Pages funciona con ambos si tienes plan que lo permita — con cuenta gratuita, debe ser público para Pages gratis).
2. Desde esta carpeta, inicializa git y sube el contenido:

   ```bash
   git init
   git add .
   git commit -m "Sesión clínica SHUa vs PTT"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
   git push -u origin main
   ```

3. En GitHub, ve a **Settings → Pages**.
4. En "Build and deployment", selecciona **Source: Deploy from a branch**.
5. Elige **Branch: main** y carpeta **/ (root)** → Save.
6. Espera 1–2 minutos; GitHub Pages publicará la web en:

   ```
   https://<tu-usuario>.github.io/<tu-repo>/
   ```

No se necesita ninguna acción de build (Actions), ningún `package.json` ni paso de compilación: al ser HTML/CSS/JS estático, Pages lo sirve tal cual.

## Uso en la sesión

- **Modo libre** (por defecto): navega con scroll normal, a tu ritmo.
- **Modo presentación**: botón superior izquierdo "Modo presentación" — activa scroll-snap de pantalla completa por sección, ideal para proyectar.
- **Teclado**: flechas ← → / ↑ ↓ / `Page Up` / `Page Down` / barra espaciadora avanzan y retroceden entre secciones en ambos modos.
- **Navegación por puntos**: los puntos de la derecha (oculto en móvil) permiten saltar directamente a cualquier sección.
- Todo lo interactivo (bloques de anamnesis, quiz de diferencial, tabla comparativa, flashcards) requiere clic — pensado para no saturar de texto la pantalla mientras se proyecta.

## Librerías externas

Ninguna dependencia de JS externa (no se usa GSAP): las animaciones de scroll usan `IntersectionObserver` nativo y transiciones CSS, lo que mantiene el sitio ligero y sin dependencias que puedan romperse. Se usa **Google Fonts** (Fraunces, Inter, IBM Plex Mono) vía CDN — si necesitas funcionamiento 100% offline, descarga las fuentes y sírvelas localmente.
