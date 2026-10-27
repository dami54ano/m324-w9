# Prognose vor der Umsetzung

Festgehalten am 27.10.2026, vor dem ersten Implementierungsschritt.

Bei Issue A muss der Agent Mitgliedsauswahl, Konfliktbehandlung und Freigabe selbst auslegen; ich erwarte eine kleinere Lösung, die nicht alle Kriterien von B erfüllt. Issue B sollte durch explizite Fehlerfälle und Nicht-Scope genauer und besser prüfbar umgesetzt werden.

Ich erwarte bei beiden PRs eine grüne Lint-/Build-Pipeline, weil diese Prüfungen keine fachlichen Reservierungskonflikte beweisen. Bei B erwarte ich mehr erfüllte Akzeptanzkriterien, bei A insbesondere Lücken bei Freigabe oder Eingabevalidierung.

Methodische Grenze: Derselbe Agent kennt beide Issues; dies ist kein verblindeter Versuch. Es werden keine Fehler absichtlich eingebaut.
