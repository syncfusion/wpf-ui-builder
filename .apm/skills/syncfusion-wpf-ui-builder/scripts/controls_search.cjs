/**
 * ControlMapper: BM25-based control search for Stage 3 (CommonJS/Node.js version)
 *
 * Maps UI elements to Syncfusion WPF controls + skills using BM25 semantic search.
 * Reads controls.csv for control→skill metadata and updates control-mapping.json.
 *
 * Usage:
 *   node controls_search.cjs <path-to-control-mapping.json>
 *
 * What it does:
 *   1. Reads control-mapping.json (Simple or Complex structure)
 *   2. Reads controls.csv for control → skill mappings
 *   3. BM25 searches element type_hints against control keywords
 *   4. Maps each element to best-matching Syncfusion control + skill
 *   5. Updates control-mapping.json with mapping results
 *   6. Validates all controls matched successfully
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// BM25
// ---------------------------------------------------------------------------

/**
 * BM25 ranking algorithm for control keyword search.
 */
class BM25 {
  /**
   * @param {string[]} documents - List of documents (keyword strings)
   * @param {number}   k1        - Saturation parameter (default 1.5)
   * @param {number}   b         - Length normalization parameter (default 0.75)
   */
  constructor(documents, k1 = 1.5, b = 0.75) {
    this.k1 = k1;
    this.b = b;
    this.documents = documents;
    this.corpusSize = documents.length;

    this.tokenizedDocs = documents.map(doc => this._tokenize(doc));
    this.idfCache = {};
    this.avgDocLength = this.tokenizedDocs.reduce((sum, d) => sum + d.length, 0) /
                        Math.max(1, this.corpusSize);

    this._computeIdf();
  }

  /** Simple tokenization: split on whitespace and commas. */
  _tokenize(text) {
    return text.toLowerCase().replace(/,/g, ' ').split(/\s+/).filter(t => t.length > 0);
  }

  /** Precompute IDF scores for all terms. */
  _computeIdf() {
    const termDocCount = {};

    for (const doc of this.tokenizedDocs) {
      for (const term of new Set(doc)) {
        termDocCount[term] = (termDocCount[term] || 0) + 1;
      }
    }

    for (const [term, docCount] of Object.entries(termDocCount)) {
      // BM25 IDF formula: log((N - n(t) + 0.5) / (n(t) + 0.5) + 1.0)
      this.idfCache[term] = Math.log(
        (this.corpusSize - docCount + 0.5) / (docCount + 0.5) + 1.0
      );
    }
  }

  /**
   * Score a document against a query using BM25.
   * @param {string} query     - Query string
   * @param {number} docIndex  - Index of document to score
   * @returns {number} BM25 score (higher = better match)
   */
  score(query, docIndex) {
    const queryTerms = this._tokenize(query);
    const doc = this.tokenizedDocs[docIndex];
    const docLength = doc.length;

    let total = 0.0;
    for (const term of queryTerms) {
      const idf = this.idfCache[term] || 0.0;
      const termFreq = doc.filter(t => t === term).length;

      const numerator = idf * termFreq * (this.k1 + 1);
      const denominator = termFreq + this.k1 * (1 - this.b + this.b * (docLength / this.avgDocLength));

      total += numerator / denominator;
    }

    return total;
  }
}

// ---------------------------------------------------------------------------
// ControlMapper
// ---------------------------------------------------------------------------

/**
 * Map user queries to Syncfusion WinUI controls using BM25 search.
 */
class ControlMapper {
  /**
   * @param {string} csvPath - Path to controls.csv file
   */
  constructor(csvPath = 'controls.csv') {
    this.csvPath = path.resolve(csvPath);

    if (!fs.existsSync(this.csvPath)) {
      throw new Error(`Controls CSV not found: ${csvPath}`);
    }

    this.controls = [];
    this.keywordsList = [];

    const rows = parseCsv(this.csvPath);
    for (const row of rows) {
      this.controls.push({
        id: row['Control ID'],
        name: row['Control Name'],
        syncfusionName: row['Syncfusion Control Name'] || row['Control Name'],
        skill: row['Skill Name'],
        keywords: row['Keywords'],
      });
      this.keywordsList.push(row['Keywords']);
    }

    if (this.controls.length === 0) {
      throw new Error('No controls found in CSV');
    }

    this.bm25 = new BM25(this.keywordsList, 1.5, 0.75);
  }

  /**
   * Search for controls matching the query.
   * @param {string} query  - User query (e.g. "button primary action")
   * @param {number} topK   - Number of top results to return (default 5)
   * @returns {Array<[string, string, string, number]>} [[controlName, syncfusionName, skillName, score], ...]
   */
  search(query, topK = 5) {
    if (!query || !query.trim()) return [];

    const scores = [];
    for (let i = 0; i < this.controls.length; i++) {
        const score = this.bm25.score(query, i);
        if (score > 0) {
            const ctrl = this.controls[i];
            scores.push([ctrl.name, ctrl.syncfusionName, ctrl.skill, score]);
        }
    }

    scores.sort((a, b) => b[3] - a[3]);
    return scores.slice(0, topK);
  }

  /**
   * Get control skill by exact control name.
   * @param {string} controlName
   * @returns {[string, string, string] | null}
   */
  getByName(controlName) {
    for (const ctrl of this.controls) {
      if (ctrl.name === controlName) return [ctrl.name, ctrl.syncfusionName, ctrl.skill];
    }
    return null;
  }

  /**
   * Get all controls for a specific skill.
   * @param {string} skillName
   * @returns {Array<[string, string]>}
   */
  getBySkill(skillName) {
    return this.controls
      .filter(c => c.skill === skillName)
      .map(c => [c.name, c.skill]);
  }

  /** Get all unique skill names in the database. */
  listSkills() {
    return [...new Set(this.controls.map(c => c.skill))].sort();
  }

  /** Get all controls. */
  listAll() {
    return this.controls.map(c => [c.name, c.skill]);
  }
}

// ---------------------------------------------------------------------------
// stage3ControlMapping
// ---------------------------------------------------------------------------

/**
 * Stage 3: Process control-mapping.json and enrich with Syncfusion control + skill mappings.
 *
 * Supports both:
 *   - Simple: flat `elements[]` array
 *   - Complex: `pages[]` array with nested `sections` and `elements`
 *
 * @param {Object} layoutJson  - control-mapping.json with project_type, elements or pages
 * @param {string} csvPath     - Path to controls.csv
 * @returns {Object} Same structure with enriched control/skill fields
 */
function stage3ControlMapping(layoutJson, csvPath = 'controls.csv') {
  const mapper = new ControlMapper(csvPath);

  let totalElements = 0;
  let successfulMappings = 0;
  let fallbackMappings = 0;

  // HANDLE SIMPLE STRUCTURE: elements[] array
  if (layoutJson.elements && Array.isArray(layoutJson.elements)) {
    for (const element of layoutJson.elements) {
      totalElements++;
      mapElementToControl(element, mapper, () => successfulMappings++, () => fallbackMappings++);
    }
  }

  // HANDLE COMPLEX STRUCTURE: pages[] array
  if (layoutJson.pages && Array.isArray(layoutJson.pages)) {
    for (const page of layoutJson.pages) {
      // Simple page with elements
      if (page.elements && Array.isArray(page.elements)) {
        for (const element of page.elements) {
          totalElements++;
          mapElementToControl(element, mapper, () => successfulMappings++, () => fallbackMappings++);
        }
      }

      // Complex page with sections
      if (page.sections && Array.isArray(page.sections)) {
        for (const section of page.sections) {
          if (section.elements && Array.isArray(section.elements)) {
            for (const element of section.elements) {
              totalElements++;
              mapElementToControl(element, mapper, () => successfulMappings++, () => fallbackMappings++);
            }
          }
        }
      }
    }
  }

  // Add validation metadata
  layoutJson.validation_status = successfulMappings === totalElements ? "PASS" : "PARTIAL";
  layoutJson.execution_metrics = {
    total_elements: totalElements,
    successfully_mapped: successfulMappings,
    fallback_controls: fallbackMappings,
    execution_time_ms: Date.now()
  };

  return layoutJson;
}

/**
 * Map a single element to a Syncfusion control using BM25 search.
 * ⛔ CRITICAL: Only use verified Syncfusion Control Names from CSV (score > 10).
 * Do NOT assume or write unverified control names.
 * Mutates element with control, skill, score, validation fields.
 */
function mapElementToControl(element, mapper, onSuccess, onFallback) {
  const typeHint = element.type_hint || "";
  const description = element.description || "";
  const query = `${typeHint} ${description}`.trim();

  const results = mapper.search(query, 1);

  if (results.length > 0) {
    const [controlName, syncfusionName, skillName, score] = results[0];
    const verified = mapper.getByName(controlName);

    if (verified && score > 10) {
      // ✅ HIGH-CONFIDENCE: Use verified Syncfusion Control Name from CSV only
      element.control = syncfusionName;
      element.skill = skillName;
      element.score = Math.round(score * 100) / 100;
      element.validation = "✓ VERIFIED";
      onSuccess();
    } else {
      // ❌ LOW-CONFIDENCE (0 < score ≤ 10) or NO MATCH (score = 0)
      // ⛔ NEVER write an assumed control name — use NATIVE_XAML only
      element.control = "NATIVE_XAML";
      element.skill = null;
      element.score = score > 0 ? Math.round(score * 100) / 100 : 0;
      element.validation = score > 0 ? "✗ FALLBACK" : "✗ NO_MATCH";
      element.fallback_reason = score > 0
        ? `Low BM25 score (${element.score}) — did not meet verification threshold (>10) for "${controlName}"`
        : `No matching Syncfusion control found for "${typeHint}"`;
      onFallback();
    }
  } else {
    // ❌ EMPTY RESULTS: No match found
    element.control = "NATIVE_XAML";
    element.skill = null;
    element.score = 0;
    element.validation = "✗ NO_MATCH";
    element.fallback_reason = "Search query produced no results";
    onFallback();
  }
}

// ---------------------------------------------------------------------------
// CSV parsing (No dependencies)
// ---------------------------------------------------------------------------

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = splitCsvLines(raw);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(row);
  }
  return rows;
}

function splitCsvLines(text) {
  const lines = [];
  let start = 0;
  let inQuote = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"') {
      if (!inQuote) inQuote = true;
      else if (text[i + 1] === '"') { i++; continue; }
      else inQuote = false;
    } else if ((ch === '\n' || ch === '\r') && !inQuote) {
      lines.push(text.slice(start, i));
      if (ch === '\r' && text[i + 1] === '\n') i++;
      start = i + 1;
    }
    i++;
  }
  if (start < text.length) lines.push(text.slice(start));
  return lines;
}

function parseCsvLine(line) {
  const fields = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i++;
      let field = '';
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { field += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else field += line[i++];
      }
      fields.push(field);
      if (line[i] === ',') i++;
    } else {
      const end = line.indexOf(',', i);
      if (end === -1) { fields.push(line.slice(i)); break; }
      else { fields.push(line.slice(i, end)); i = end + 1; }
    }
  }
  return fields;
}

// ---------------------------------------------------------------------------
// persistMappingToFile
// ---------------------------------------------------------------------------

/**
 * Write enriched layoutJson back to control-mapping.json file with proper formatting.
 * @param {Object} layoutJson - Updated layout with enriched control/skill mappings
 * @param {string} jsonPath   - Path to control-mapping.json file
 */
function persistMappingToFile(layoutJson, jsonPath) {
  try {
    const jsonContent = JSON.stringify(layoutJson, null, 2);
    fs.writeFileSync(jsonPath, jsonContent, 'utf8');
    console.log(`✓ Successfully updated: ${jsonPath}`);
  } catch (err) {
    throw new Error(`Failed to write JSON to ${jsonPath}: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (require.main === module) {
  const args = process.argv.slice(2);
  const scriptDir = __dirname;

  if (args.length > 0) {
    const jsonFile = args[0];
    let jsonPath = path.resolve(jsonFile);
    if (!path.isAbsolute(jsonFile)) jsonPath = path.resolve(scriptDir, jsonFile);

    const controlsCsv = path.join(scriptDir, 'controls.csv');

    try {
      // ======================================================================
      // STEP 1: Validate inputs
      // ======================================================================
      if (!fs.existsSync(jsonPath)) {
        throw new Error(`control-mapping.json not found: ${jsonPath}`);
      }
      if (!fs.existsSync(controlsCsv)) {
        throw new Error(`controls.csv not found: ${controlsCsv}`);
      }

      // ======================================================================
      // STEP 2: Read control-mapping.json
      // ======================================================================
      console.log(`📖 Reading control-mapping.json: ${jsonPath}`);
      const layoutJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const projectType = layoutJson.project_type || 'Unknown';
      console.log(`   Project Type: ${projectType}`);

      // ======================================================================
      // STEP 3: Process mappings (enriches layoutJson in-place)
      // ======================================================================
      console.log(`🔍 Processing ${layoutJson.elements ? 'Simple' : 'Complex'} structure...`);
      const enrichedJson = stage3ControlMapping(layoutJson, controlsCsv);

      // ======================================================================
      // STEP 4: Report metrics
      // ======================================================================
      if (enrichedJson.execution_metrics) {
        const metrics = enrichedJson.execution_metrics;
        console.log(`✓ Mapping Results:`);
        console.log(`   Total Elements: ${metrics.total_elements}`);
        console.log(`   Successfully Mapped: ${metrics.successfully_mapped}`);
        console.log(`   Fallback (NATIVE_XAML): ${metrics.fallback_controls}`);
        console.log(`   Validation Status: ${enrichedJson.validation_status}`);
      }

      // ======================================================================
      // STEP 5: Persist changes to disk (CRITICAL FIX)
      // ======================================================================
      console.log(`💾 Persisting changes to control-mapping.json...`);
      persistMappingToFile(enrichedJson, jsonPath);

      // ======================================================================
      // STEP 6: Output enriched mapping for verification
      // ======================================================================
      console.log(`\n📋 Enriched control-mapping.json (sample):`);
      if (enrichedJson.elements && enrichedJson.elements.length > 0) {
        console.log(`   First element: ${JSON.stringify(enrichedJson.elements[0], null, 2).split('\n').slice(0, 5).join('\n')}`);
      } else if (enrichedJson.pages && enrichedJson.pages.length > 0) {
        const firstPage = enrichedJson.pages[0];
        if (firstPage.elements && firstPage.elements.length > 0) {
          console.log(`   First page/element: ${JSON.stringify(firstPage.elements[0], null, 2).split('\n').slice(0, 5).join('\n')}`);
        }
      }

      console.log(`\n✅ Stage 3 control mapping complete!`);
    } catch (err) {
      process.stderr.write(`❌ Error: ${err.message}\n`);
      process.exit(1);
    }
  } else {
    process.stderr.write('Usage: node controls_search.cjs <path-to-control-mapping.json>\n');
    process.exit(1);
  }
}

module.exports = { BM25, ControlMapper, stage3ControlMapping, persistMappingToFile };
