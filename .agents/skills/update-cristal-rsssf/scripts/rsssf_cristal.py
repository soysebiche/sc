#!/usr/bin/env python3
"""Extract and audit Sporting Cristal matches from annual RSSSF Peru pages."""

from __future__ import annotations

import argparse
import datetime as dt
import html as html_module
import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path
from typing import Any


MONTHS = {
    "Jan": (1, "Enero"),
    "Feb": (2, "Febrero"),
    "Mar": (3, "Marzo"),
    "Apr": (4, "Abril"),
    "May": (5, "Mayo"),
    "Jun": (6, "Junio"),
    "Jul": (7, "Julio"),
    "Aug": (8, "Agosto"),
    "Sep": (9, "Septiembre"),
    "Oct": (10, "Octubre"),
    "Nov": (11, "Noviembre"),
    "Dec": (12, "Diciembre"),
}
WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
DOMESTIC_TOURNAMENTS = {"Apertura", "Clausura", "Liga 1 Playoff", "Libertadores Playoff", "Copa de la Liga"}
SCORE_RE = re.compile(r"(?<![\d-])(\d{1,2})\s*-\s*(\d{1,2})(?![\d-])")
DATE_RE = re.compile(r"\b(" + "|".join(MONTHS) + r")\s+(\d{1,2})(?!\s*-)\b")
MINUTE_RE = re.compile(r"\d+(?:\+\d+)?(?:pen|og)?", re.IGNORECASE)


def normalized_text(value: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", value)).strip()


def default_skill_dir() -> Path:
    return Path(__file__).resolve().parent.parent


def load_aliases(path: Path | None) -> dict[str, dict[str, str]]:
    alias_path = path or default_skill_dir() / "references" / "aliases.json"
    with alias_path.open(encoding="utf-8") as handle:
        raw = json.load(handle)
    return {
        "team_aliases": {normalized_text(k): normalized_text(v) for k, v in raw.get("team_aliases", {}).items()},
        "player_aliases": {normalized_text(k): normalized_text(v) for k, v in raw.get("player_aliases", {}).items()},
    }


def canonical(value: str, mapping: dict[str, str]) -> str:
    value = normalized_text(value)
    return mapping.get(value, value)


def fetch_source(year: int, source_file: Path | None, url: str | None) -> tuple[str, str]:
    source_url = url or f"https://www.rsssf.org/tablesp/peru{year}.html"
    if source_file:
        payload = source_file.read_bytes()
        label = str(source_file.resolve())
    else:
        request = urllib.request.Request(source_url, headers={"User-Agent": "SebicheCeleste-RSSSF-Audit/1.0"})
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = response.read()
        label = source_url
    return payload.decode("cp1252"), label


def extract_pre_block(document: str, anchor: str) -> str:
    pattern = re.compile(
        rf"<h4>\s*<a\s+name=[\"']{re.escape(anchor)}[\"'][^>]*>.*?</h4>\s*<pre>(.*?)</pre>",
        re.IGNORECASE | re.DOTALL,
    )
    match = pattern.search(document)
    if not match:
        raise ValueError(f"RSSSF section not found: {anchor}")
    block = re.sub(r"<[^>]+>", "", match.group(1))
    return html_module.unescape(block).replace("\r\n", "\n").replace("\r", "\n")


def parse_date(line: str, year: int) -> tuple[dt.date | None, str | None]:
    if not (line.startswith("[") and line.endswith("]")) and " Leg [" not in line:
        return None, None
    date_match = DATE_RE.search(line)
    if not date_match:
        return None, None
    month_token, day_text = date_match.groups()
    if re.search(rf"{re.escape(month_token)}\s+{day_text}\s*-", line):
        return None, "ambiguous_date_range"
    month_number = MONTHS[month_token][0]
    try:
        return dt.date(year, month_number, int(day_text)), None
    except ValueError:
        return None, "invalid_date"


def format_scorers(raw: str, player_aliases: dict[str, str]) -> tuple[str, list[str], int]:
    warnings: list[str] = []
    raw = re.sub(r"^(?:Goles?|Gol):\s*", "", normalized_text(raw), flags=re.IGNORECASE)
    if not raw:
        return "", warnings, 0
    entries: list[dict[str, Any]] = []
    for piece in [part.strip() for part in raw.split(",") if part.strip()]:
        if MINUTE_RE.fullmatch(piece):
            if not entries:
                warnings.append(f"orphan_minute:{piece}")
            else:
                entries[-1]["minutes"].append(piece)
            continue
        match = re.match(r"^(.*?)\s+(\d+(?:\+\d+)?(?:pen|og)?)$", piece, re.IGNORECASE)
        if not match:
            warnings.append(f"unparsed_scorer:{piece}")
            continue
        name, minute = match.groups()
        entries.append({"name": canonical(name, player_aliases), "minutes": [minute]})
    formatted = ", ".join(f"{entry['name']} ({', '.join(entry['minutes'])})" for entry in entries)
    return formatted, warnings, sum(len(entry["minutes"]) for entry in entries)


def scorer_side(
    raw_line: str | None,
    is_home: bool,
    sc_goals: int,
    opponent_goals: int,
    player_aliases: dict[str, str],
) -> tuple[str, list[str]]:
    warnings: list[str] = []
    if sc_goals == 0:
        return "", warnings
    if not raw_line:
        return "", ["missing_scorers"]
    content = normalized_text(raw_line.strip()[1:-1])
    sides = [side.strip() for side in content.split(";")]
    if len(sides) == 2:
        selected = sides[0] if is_home else sides[1]
    elif len(sides) == 1 and opponent_goals == 0:
        selected = sides[0]
    else:
        return "", ["ambiguous_scorer_sides"]
    formatted, parse_warnings, count = format_scorers(selected, player_aliases)
    warnings.extend(parse_warnings)
    if count != sc_goals:
        warnings.append(f"scorer_count_mismatch:expected={sc_goals},parsed={count}")
    return formatted, warnings


def result_from_score(local: str, home_goals: int, away_goals: int) -> str:
    sc_goals, opponent_goals = (home_goals, away_goals) if local == "Sporting Cristal" else (away_goals, home_goals)
    return "V" if sc_goals > opponent_goals else "E" if sc_goals == opponent_goals else "P"


def round_label(section: str, competition: str | None, group: str | None, round_number: str | None, stage: str | None, leg: str | None) -> str:
    if section == "primera":
        if competition in {"Apertura", "Clausura"}:
            return round_number or ""
        if competition == "Libertadores Playoff":
            parts = [part for part in (stage, leg) if part]
            return " - ".join(parts)
    if section == "copaliga":
        if group:
            return f"Grupo {group} - {round_number}" if round_number else f"Grupo {group}"
        parts = [part for part in (stage, leg) if part]
        return " - ".join(parts)
    return ""


def parse_section(text: str, section: str, year: int, aliases: dict[str, dict[str, str]], source: str) -> list[dict[str, Any]]:
    lines = text.splitlines()
    competition: str | None = None
    group: str | None = None
    round_number: str | None = None
    stage: str | None = None
    leg: str | None = None
    current_date: dt.date | None = None
    date_warning: str | None = None
    playoff_counter = 0
    records: list[dict[str, Any]] = []

    for index, raw_line in enumerate(lines):
        line = normalized_text(raw_line)
        if not line:
            continue

        if section == "primera":
            if line == "Apertura Tournament":
                competition, group, stage, leg = "Apertura", None, None, None
                continue
            if line == "Clausura Tournament":
                competition, group, stage, leg = "Clausura", None, None, None
                continue
            if re.fullmatch(r"Copa Libertadores \d{4} Playoff", line):
                competition, group, round_number, stage, leg = "Libertadores Playoff", None, None, None, None
                continue
            if line == "Championship Playoff":
                competition, group, round_number, stage, leg = "Liga 1 Playoff", None, None, None, None
                continue
            if line in {"Third Place - definition", "Second Place - definition"}:
                stage = "Tercer puesto" if line.startswith("Third") else "Segundo puesto"
                continue
        else:
            group_match = re.fullmatch(r"Group\s+([A-Z])", line)
            if group_match:
                competition, group, stage, leg = "Copa de la Liga", group_match.group(1), None, None
                continue
            if line == "Playoffs":
                group, round_number = None, None
                continue
            stage_map = {"1/8 Finals": "Octavos", "1/4 Finals": "Cuartos", "Semifinals": "Semifinal", "FINAL": "Final"}
            if line in stage_map:
                stage, leg = stage_map[line], None
                continue

        round_match = re.fullmatch(r"Round\s+(\d+)", line)
        if round_match:
            round_number = round_match.group(1)
            continue
        if line in {"Leg 1", "First Leg"} or line.startswith("First Leg ["):
            leg = "Ida"
        elif line in {"Leg 2", "Second Leg"} or line.startswith("Second Leg ["):
            leg = "Vuelta"

        parsed_date, warning = parse_date(line, year)
        if parsed_date or warning:
            current_date, date_warning = parsed_date, warning
            if SCORE_RE.search(line) is None:
                continue

        if line.startswith("[") or re.match(r"^\d+\.", line) or "Sporting Cristal" not in line:
            continue
        score_match = SCORE_RE.search(line)
        if not score_match:
            continue
        if not competition or not current_date:
            continue

        home_goals, away_goals = (int(value) for value in score_match.groups())
        local = canonical(line[: score_match.start()], aliases["team_aliases"])
        visit_text = line[score_match.end() :].strip()
        visit = canonical(re.split(r"\s*\[", visit_text, maxsplit=1)[0], aliases["team_aliases"])
        if "Sporting Cristal" not in {local, visit}:
            continue

        is_home = local == "Sporting Cristal"
        sc_goals, opponent_goals = (home_goals, away_goals) if is_home else (away_goals, home_goals)
        scorer_line = None
        if index + 1 < len(lines):
            candidate = lines[index + 1].strip()
            if candidate.startswith("[") and candidate.endswith("]") and DATE_RE.search(candidate) is None:
                scorer_line = candidate
        scorers, warnings = scorer_side(scorer_line, is_home, sc_goals, opponent_goals, aliases["player_aliases"])
        if date_warning:
            warnings.append(date_warning)
        if competition == "Libertadores Playoff":
            playoff_counter += 1
            number = str(playoff_counter)
        else:
            number = round_label(section, competition, group, round_number, stage, leg)
        if not number:
            warnings.append("missing_round_label")
        record = {
            "Año": current_date.year,
            "Mes": MONTHS[current_date.strftime("%b")][1],
            "Dia": current_date.day,
            "Día de la Semana": WEEKDAYS[current_date.weekday()],
            "Fecha": current_date.isoformat(),
            "Torneo": competition,
            "Número de Fecha": number,
            "Equipo Local": local,
            "Equipo Visita": visit,
            "Marcador": f"{home_goals}-{away_goals}",
            "Resultado": result_from_score(local, home_goals, away_goals),
            "Goles (Solo SC)": scorers,
            "País": "Perú",
        }
        records.append(
            {
                "record": record,
                "status": "review_manual" if warnings else "confirmed_source",
                "warnings": sorted(set(warnings)),
                "source": source,
                "source_section": "Primera División" if section == "primera" else "Copa de la Liga",
                "source_line": line,
            }
        )
    return records


def extract(year: int, source_file: Path | None, url: str | None, aliases_path: Path | None) -> tuple[list[dict[str, Any]], str]:
    document, source = fetch_source(year, source_file, url)
    aliases = load_aliases(aliases_path)
    records = parse_section(extract_pre_block(document, "primera"), "primera", year, aliases, source)
    try:
        copa_block = extract_pre_block(document, "copaliga")
    except ValueError:
        copa_block = ""
    if copa_block:
        records.extend(parse_section(copa_block, "copaliga", year, aliases, source))
    records.sort(key=lambda item: (item["record"]["Fecha"], item["record"]["Torneo"], item["record"]["Equipo Local"]))
    return records, source


def identity(record: dict[str, Any]) -> tuple[str, str, str]:
    return record.get("Fecha", ""), normalized_text(record.get("Equipo Local", "")), normalized_text(record.get("Equipo Visita", ""))


def comparable(record: dict[str, Any]) -> dict[str, Any]:
    fields = ["Torneo", "Número de Fecha", "Marcador", "Resultado", "Goles (Solo SC)"]
    return {field: record.get(field, "") for field in fields}


def audit_records(extracted: list[dict[str, Any]], historico: list[dict[str, Any]], year: int) -> dict[str, Any]:
    existing = [
        item
        for item in historico
        if item.get("Año") == year
        and item.get("Torneo") in DOMESTIC_TOURNAMENTS
        and "Sporting Cristal" in {item.get("Equipo Local"), item.get("Equipo Visita")}
    ]
    by_identity: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
    for item in existing:
        by_identity.setdefault(identity(item), []).append(item)

    findings: list[dict[str, Any]] = []
    source_identities: set[tuple[str, str, str]] = set()
    for source_item in extracted:
        source_record = source_item["record"]
        key = identity(source_record)
        source_identities.add(key)
        matches = by_identity.get(key, [])
        base = {"identity": list(key), "source_record": source_record, "source_status": source_item["status"], "warnings": source_item["warnings"]}
        if not matches:
            findings.append({**base, "status": "missing"})
            continue
        if len(matches) > 1:
            findings.append({**base, "status": "duplicate", "historico_records": matches})
            continue
        actual = matches[0]
        differences = {
            field: {"rsssf": value, "historico": comparable(actual)[field]}
            for field, value in comparable(source_record).items()
            if value != comparable(actual)[field]
        }
        findings.append({**base, "status": "different" if differences else "matched", "differences": differences, "historico_record": actual})

    for item in existing:
        if identity(item) not in source_identities:
            findings.append({"status": "extra", "identity": list(identity(item)), "historico_record": item})

    counts: dict[str, int] = {}
    for finding in findings:
        counts[finding["status"]] = counts.get(finding["status"], 0) + 1
    return {"year": year, "summary": counts, "findings": findings}


def print_text_audit(report: dict[str, Any]) -> None:
    print(f"RSSF Sporting Cristal audit {report['year']}")
    print("Summary: " + ", ".join(f"{key}={value}" for key, value in sorted(report["summary"].items())))
    for finding in report["findings"]:
        if finding["status"] == "matched" and finding.get("source_status") == "confirmed_source":
            continue
        print(f"\n[{finding['status']}] {' | '.join(finding['identity'])}")
        for warning in finding.get("warnings", []):
            print(f"  warning: {warning}")
        for field, values in finding.get("differences", {}).items():
            print(f"  {field}: RSSSF={values['rsssf']!r} historico={values['historico']!r}")
        if finding["status"] == "missing":
            record = finding["source_record"]
            print(f"  RSSSF: {record['Torneo']} F{record['Número de Fecha']} {record['Marcador']} | {record['Goles (Solo SC)']}")
        elif finding["status"] == "extra":
            record = finding["historico_record"]
            print(f"  historico: {record['Torneo']} F{record['Número de Fecha']} {record['Marcador']} | {record['Goles (Solo SC)']}")


def load_historico(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError("Historical JSON must contain an array")
    return data


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    for command in ("extract", "audit", "stage"):
        sub = subparsers.add_parser(command)
        sub.add_argument("--year", type=int, required=True)
        sub.add_argument("--url")
        sub.add_argument("--source-file", type=Path)
        sub.add_argument("--aliases", type=Path)
        sub.add_argument("--format", choices=("text", "json"), default="text")
        if command in {"audit", "stage"}:
            sub.add_argument("--historico", type=Path, required=True)
        if command == "stage":
            sub.add_argument("--output", type=Path, required=True)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    extracted, source = extract(args.year, args.source_file, args.url, args.aliases)
    if args.command == "extract":
        payload = {"year": args.year, "source": source, "count": len(extracted), "matches": extracted}
        if args.format == "json":
            print(json.dumps(payload, ensure_ascii=False, indent=2))
        else:
            print(f"Extracted {len(extracted)} Sporting Cristal matches from {source}")
            for item in extracted:
                record = item["record"]
                print(f"{record['Fecha']} | {record['Torneo']} | {record['Número de Fecha']} | {record['Equipo Local']} {record['Marcador']} {record['Equipo Visita']} | {item['status']}")
                for warning in item["warnings"]:
                    print(f"  warning: {warning}")
        return 0

    historico = load_historico(args.historico)
    report = audit_records(extracted, historico, args.year)
    report["source"] = source
    if args.command == "audit":
        if args.format == "json":
            print(json.dumps(report, ensure_ascii=False, indent=2))
        else:
            print_text_audit(report)
        return 0

    staged = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "year": args.year,
        "source": source,
        "mode": "review_only",
        "summary": report["summary"],
        "candidates": [
            finding
            for finding in report["findings"]
            if finding["status"] in {"missing", "different", "duplicate"}
            or finding.get("source_status") == "review_manual"
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(staged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote review artifact: {args.output.resolve()}")
    print("No historical data was modified.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        raise SystemExit(2)
