# 📅 Instrucciones para Agregar Datos del 2025

## 🎯 Objetivo

Agregar los partidos del año 2025 a los archivos JSON de estadísticas históricas.

## 📋 Pasos a Seguir

### 1. Preparar los Datos del 2025

Crea un archivo llamado `data-2025.json` en la raíz del proyecto con tus partidos del 2025.

**Formato requerido:**
```json
[
  {
    "Fecha": "2025-01-15",
    "Torneo": "Apertura",
    "Número de Fecha": "1",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "Alianza Lima",
    "Marcador": "2-1",
    "Goles (Solo SC)": "Jugador1 (10'), Jugador2 (45')"
  }
]
```

### 2. Campos Requeridos

- **Fecha**: Formato `YYYY-MM-DD` (ejemplo: "2025-01-15")
- **Torneo**: Nombre del torneo (ejemplo: "Apertura", "Copa Libertadores", "Copa del Inca")
- **Número de Fecha**: Número de la fecha del torneo (ejemplo: "1", "2", "3")
- **Equipo Local**: Nombre del equipo local
- **Equipo Visita**: Nombre del equipo visitante
- **Marcador**: Formato `X-Y` (ejemplo: "2-1", "3-0", "1-1")
- **Goles (Solo SC)**: Goles de Sporting Cristal con minutos (ejemplo: "Jugador1 (10'), Jugador2 (45')") o "-" si no hay goles

### 3. Campos Opcionales

- **Resultado**: Se calcula automáticamente si no se proporciona
  - "V" = Victoria
  - "D" = Derrota
  - "E" = Empate

### 4. Ejecutar el Script

Una vez que tengas el archivo `data-2025.json` listo, ejecuta:

```bash
node add-2025-data.js
```

### 5. Qué Hace el Script

El script automáticamente:

1. ✅ Lee tus datos del 2025 desde `data-2025.json`
2. ✅ Calcula automáticamente:
   - El día de la semana
   - El mes en español
   - El resultado (V/D/E) basado en el marcador
3. ✅ Agrega los partidos a los archivos correspondientes:
   - `historico_completo_sc.json` (todos los partidos)
   - `historico_conmebol_sc.json` (solo partidos internacionales)
   - `historico_inca_sc.json` (solo partidos de Copa del Inca)
4. ✅ Ordena todos los partidos por fecha
5. ✅ Evita duplicados (no agrega partidos que ya existen)

## 📝 Ejemplo Completo

```json
[
  {
    "Fecha": "2025-01-15",
    "Torneo": "Apertura",
    "Número de Fecha": "1",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "Alianza Lima",
    "Marcador": "2-1",
    "Goles (Solo SC)": "Martín Cauteruccio (10'), Joao Grimaldo (45')"
  },
  {
    "Fecha": "2025-01-22",
    "Torneo": "Apertura",
    "Número de Fecha": "2",
    "Equipo Local": "Universitario",
    "Equipo Visita": "Sporting Cristal",
    "Marcador": "1-2",
    "Goles (Solo SC)": "Irven Ávila (25'), Brenner Marlos (70')"
  },
  {
    "Fecha": "2025-02-05",
    "Torneo": "Copa Libertadores",
    "Número de Fecha": "1",
    "Equipo Local": "Sporting Cristal",
    "Equipo Visita": "Flamengo",
    "Marcador": "3-0",
    "Goles (Solo SC)": "Jugador1 (15'), Jugador2 (30'), Jugador3 (60')"
  }
]
```

## 🔍 Verificación

Después de ejecutar el script, verifica que:

1. ✅ Los partidos se agregaron correctamente
2. ✅ Las fechas están en orden cronológico
3. ✅ Los resultados se calcularon correctamente
4. ✅ Los días de la semana son correctos

## 🚀 Siguiente Paso

Una vez que los datos estén agregados:

1. Revisa los archivos JSON para confirmar que todo está correcto
2. Haz commit de los cambios:
   ```bash
   git add data/
   git commit -m "feat: Add 2025 matches data"
   git push origin main
   ```

## ⚠️ Notas Importantes

- **Formato de fecha**: Debe ser `YYYY-MM-DD` (año-mes-día)
- **Marcador**: Debe ser formato `X-Y` (goles local - goles visita)
- **Goles**: Si no hay goles de SC, usa `"-"`
- **Torneos internacionales**: Si el torneo contiene "Libertadores", "Sudamericana" o "Conmebol", se agregará también a `historico_conmebol_sc.json`
- **Copa del Inca**: Si el torneo contiene "Inca", se agregará también a `historico_inca_sc.json`

## 📚 Archivos de Referencia

- `data-2025-example.json`: Ejemplo de formato
- `add-2025-data.js`: Script que procesa los datos
- `src/data/historico_completo_sc.json`: Archivo principal (todos los partidos)

---

**💡 Tip**: Puedes copiar `data-2025-example.json` a `data-2025.json` y reemplazar con tus datos reales.



