# Raki

**Extract structured research data from medical free text — locally, reproducibly, and with the clinician in the loop.**

[raki-data.net](https://raki-data.net) · Apache-2.0

Clinical research runs on structured variables, but hospital documentation is prose. The usual answer is a student with a spreadsheet reading reports for weeks. Raki replaces that with an LLM-assisted workflow in which the model proposes values, the clinician verifies them, and every datapoint stays traceable to the sentence it came from.

---

## Why it exists

Manual chart abstraction is slow, inconsistent between abstractors, and impossible to audit after the fact. Fully automated extraction is fast but unverifiable, which is exactly the wrong trade in a dataset you intend to publish from. Raki is built around the assumption that the clinician stays responsible for the output: the model does the reading, the human does the signing off, and the interface makes verification fast enough that this is actually practical.

---

## Validated, not just built

Evaluated at the Heart and Diabetes Centre NRW on **188 pulmonary hypertension outpatient encounters** covering diagnosis lists, ECG reports and spiroergometry summaries:

| Domain | F1 (uncorrected model output) | Speed-up vs. manual |
|---|---|---|
| Diagnoses | 0.910 | 2.17× |
| ECG | 0.946 | 3.50× |
| Spiroergometry | 0.880 | 1.49× |

The same work also benchmarked **four models** — GPT-5-mini, GPT-5-nano, GPT-4o-mini and DeepSeek-Chat — across **84 clinical parameters and 53,144 ground-truth comparisons**: overall F1 **0.915–0.988**, above **97% accuracy** on structured endpoints, with error rates of **0.4 to 5.4 per 100 comparisons**. GPT-5-mini was the most consistent across domains (diagnoses F1 0.988, ECG F1 0.984).

Presented as two abstracts at the annual meeting of the German Cardiac Society (DGK) in 2026. See [Citation](#citation).

---

## How it works

```
clinical free text → [optional redaction] → LLM extraction → clinician review → structured dataset
```

1. **Define your variables.** Set up the datapoints you want extracted, with types and expected value ranges, as a reusable profile.
2. **Import your texts.** Plain text, Markdown, PDF and Word (`.docx`) files, or tabular data (CSV/Excel) where one column holds the report text.
3. **Extract.** The model proposes a value for each datapoint, together with the source passage it drew from.
4. **Verify.** Review proposals side by side with the original report; correct what's wrong and accept what isn't.
5. **Export.** A structured dataset ready for analysis.

Nothing is written to your dataset without passing through step 4 — there is no "accept everything" path, by design.

---

## Privacy and deployment

Clinical documents usually cannot leave the hospital, which shapes the whole design:

- **Runs on infrastructure you control.** Desktop application (Tauri) or self-hosted via Docker. Your documents stay local; only the text you extract from is sent to the **model backend you configure**.
- **Configurable model backend.** The validation studies used EU-hosted inference; the backend is configurable, so a self-hosted or on-premise model can be used where cloud inference is ruled out entirely.
- **Built-in redaction for tabular imports.** When importing a spreadsheet, you can mark the columns that hold identifiers (e.g. names, dates of birth); their values are stripped from the report text (replaced with `[REDACTED]`) before anything is stored or sent to a model. This is literal value removal based on the columns you select — not automatic de-identification of free text.
- **Anonymise before uploading.** For free-text inputs (and in general), Raki assumes the text you load is already anonymised — it does not detect identifiers for you. Do not enter personal or patient-identifying information you have not cleared for the configured model backend.
- **Human-in-the-loop by default.** Every exported value was reviewed by a person.

> Raki is a research data-curation tool. It is not a medical device and is not intended for diagnosis or treatment decisions.

---

## Quick start

**Docker (recommended)**

```bash
docker-compose up
```

Backend on port 8000, frontend on port 3000.

**Manual setup — backend** (Python 3.12+, [uv](https://github.com/astral-sh/uv))

```bash
cd projects/llm_backend
uv venv && uv sync
uvicorn app.main:app --reload --port 8000
```

**Manual setup — frontend** (requires Rust for the desktop build)

```bash
cd projects/frontend
yarn
yarn dev          # web
yarn tauri dev    # desktop
```

**Production build**

The desktop bundle embeds the backend as an executable, so build the backend first, then the app:

```bash
# 1) backend executable (PyInstaller) — see projects/llm_backend for the build
#    command and the OS-specific suffix the bundle expects
# 2) desktop app
cd projects/frontend
yarn tauri build  # output in src-tauri/target/bundle
```

---

## Project layout

```
projects/
  llm_backend/    FastAPI service — extraction, model adapters
  frontend/       Next.js UI (review, import, tabular redaction), packaged as a Tauri desktop app
docker-compose.yml
```

---

## Citation

If you use Raki in published research, please cite:

> Nageler G, Albakkar A, Potratz M, et al. From Text to Structured Data: Fast and Reliable Clinical Data Extraction Using the Raki Platform. *Annual Meeting of the German Cardiac Society (DGK)* 2026; abstract P989.

> Albakkar A, Nageler G, Potratz M, et al. AI-Driven Extraction of Clinical Parameters From Medical Free Text: Evaluation of Large Language Models on Real-World Cardiology Data. *Annual Meeting of the German Cardiac Society (DGK)* 2026; abstract V696.

A full manuscript is under review.

---

## Contributing

Issues and pull requests are welcome. If you are using Raki on a clinical dataset and hit a document type it handles badly, an issue with a de-identified example is the most useful thing you can send.

---

## License

Apache-2.0 — see [LICENSE](LICENSE).
