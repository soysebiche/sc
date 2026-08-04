#!/usr/bin/env python3

import importlib.util
import pathlib
import unittest


MODULE_PATH = pathlib.Path(__file__).with_name("rsssf_cristal.py")
SPEC = importlib.util.spec_from_file_location("rsssf_cristal", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(MODULE)


class ParserTests(unittest.TestCase):
    def test_formats_grouped_minutes_and_alias(self):
        aliases = {"Martin Tavara": "Gerald Távara"}
        formatted, warnings, count = MODULE.format_scorers(
            "Martin Tavara 7pen, 82, 91", aliases
        )
        self.assertEqual(formatted, "Gerald Távara (7pen, 82, 91)")
        self.assertEqual(warnings, [])
        self.assertEqual(count, 3)

    def test_away_scorers_without_semicolon_when_home_has_zero(self):
        formatted, warnings = MODULE.scorer_side(
            "[Felipe Vizeu 9, Luis Iberico 92]", False, 2, 0, {}
        )
        self.assertEqual(formatted, "Felipe Vizeu (9), Luis Iberico (92)")
        self.assertEqual(warnings, [])

    def test_rejects_ambiguous_scorer_sides(self):
        formatted, warnings = MODULE.scorer_side(
            "[Jugador Local 3, Jugador Visita 8]", False, 1, 1, {}
        )
        self.assertEqual(formatted, "")
        self.assertEqual(warnings, ["ambiguous_scorer_sides"])

    def test_result_uses_cristal_perspective(self):
        self.assertEqual(MODULE.result_from_score("Sporting Cristal", 2, 1), "V")
        self.assertEqual(MODULE.result_from_score("FBC Melgar", 2, 1), "P")


if __name__ == "__main__":
    unittest.main()
