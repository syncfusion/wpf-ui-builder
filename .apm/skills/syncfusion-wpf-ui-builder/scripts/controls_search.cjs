/**
 * ControlMapper: BM25-based control search for Stage 4 (CommonJS/Node.js version)
 *
 * Maps user queries (element type + content hints) to Syncfusion WPF controls
 * using BM25 ranking on control keywords.
 *
 * Usage:
 *   // Direct import for Stage 4
 *   const { ControlMapper, stage4ControlPicking } = require('./controls_search.cjs');
 *
 *   const controlMappingJson = {...}; // From Stage 3 (control-mapping.json)
 *   const result = stage4ControlPicking(controlMappingJson);
 *   // Returns: Stage 4 output JSON with mapped controls
 *
 * CLI Usage:
 *   node controls_search.cjs <path-to-control-mapping.json>
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
// stage4ControlPicking
// ---------------------------------------------------------------------------

/**
 * Stage 4: Process Stage 3 control-mapping.json and map elements to Syncfusion WPF controls.
 *
 * Supports both flat mappings (simple elements array) and complex mappings (sections with elements).
 *
 * @param {Object} layoutJson  - Stage 3 output JSON with elements/sections
 * @param {string} csvPath     - Path to controls.csv
 * @returns {Object} Dict with mapped_controls and section organization
 */
function stage4ControlPicking(layoutJson, csvPath = 'controls.csv') {
  const mapper = new ControlMapper(csvPath);

  const mappedControls = [];
  const mappedSections = [];

  // AUTO-FLATTEN: Handle both nested sections and flat elements
  const elementsToMap = [];
  const hasSections = Array.isArray(layoutJson.sections) && layoutJson.sections.length > 0;

  if (hasSections) {
    for (const section of layoutJson.sections) {
      const sectionId = section.section_id || '';
      const sectionElements = [];

      for (const element of (section.elements || [])) {
        element._sectionId = sectionId;
        elementsToMap.push(element);
        sectionElements.push(element.id || '');
      }

      if (sectionElements.length > 0) {
        mappedSections.push({
          section_id: sectionId,
          section_name: section.section_name || '',
          elements: sectionElements,
        });
      }
    }
  } else {
    for (const el of (layoutJson.elements || [])) {
      elementsToMap.push(el);
    }
  }

  // MAP ELEMENTS TO CONTROLS AND ICONS
  for (const element of elementsToMap) {
    const typeHint = element.type_hint || "";
    const description = element.description || "";
    const query = `${typeHint} ${description}`.trim(); 
    
    const results = mapper.search(query, 1);

    const controlMap = {
      element_id: element.id,
      element_name: element.name,
    };

    if (element._sectionId !== undefined) {
      controlMap.section_id = element._sectionId;
    }

    if (results.length > 0) {
      const [controlName, syncfusionName, skillName, score] = results[0];
      
      // Verification
      const verified = mapper.getByName(controlName);
      if (verified) {
        controlMap.control = syncfusionName;  // Use actual Syncfusion control name (e.g., SfMaskedTextBox)
        controlMap.control_alias = controlName;  // Keep original control name for reference
        controlMap.skill = skillName;
        controlMap.skill_hint = skillName;  // Reference label for Stage 5 NuGet conversion
        controlMap.score = Math.round(score * 100) / 100;
        controlMap.validation = "✓ VERIFIED in controls.csv";
      } else {
        controlMap.control = 'NATIVE_WPF';
        controlMap.control_alias = null;
        controlMap.skill = null;
        controlMap.skill_hint = null;
        controlMap.score = 0;
        controlMap.validation = "✗ NOT FOUND in controls.csv";
      }
    } else {
      controlMap.control = 'NATIVE_WPF';
      controlMap.control_alias = null;
      controlMap.skill = null;
      controlMap.skill_hint = null;
      controlMap.score = 0;
      controlMap.validation = "✗ NOT FOUND in controls.csv";
    }

    mappedControls.push(controlMap);
  }

  const output = {
    control_type: layoutJson.control_type || 'Unknown',
    variant: layoutJson.variant || 'Default',
    mapped_controls: mappedControls
  };

  if (hasSections && mappedSections.length > 0) {
    output.mapped_sections = mappedSections;
  }

  return output;
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
// writeBackToJson
// ---------------------------------------------------------------------------

function writeBackToJson(layoutJson, result, jsonPath) {
  const controlLookup = {};
  for (const entry of (result.mapped_controls || [])) {
    controlLookup[entry.element_id] = entry;
  }

  // Inject into sections
  if (layoutJson.sections) {
    for (const section of layoutJson.sections) {
      for (const element of (section.elements || [])) {
        const mapped = controlLookup[element.id];
        if (mapped) {
          element.control = mapped.control;
          element.control_alias = mapped.control_alias;
          element.skill = mapped.skill;
          element.skill_hint = mapped.skill_hint;
          element.score = mapped.score;
          element.validation = mapped.validation;
        }
      }
    }
  }

  // SIMPLE MAPPING: Use flat elements array
  if (layoutJson.elements) {
    for (const element of layoutJson.elements) {
        const mapped = controlLookup[element.id];
        if (mapped) {
            element.control = mapped.control;
            element.control_alias = mapped.control_alias;
            element.skill = mapped.skill;
            element.skill_hint = mapped.skill_hint;
            element.score = mapped.score;
            element.validation = mapped.validation;
        }
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(layoutJson, null, 2), 'utf8');
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
      if (!fs.existsSync(jsonPath)) throw new Error(`JSON not found: ${jsonFile}`);
      const layoutJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const result = stage4ControlPicking(layoutJson, controlsCsv);
      
      console.log(JSON.stringify(result, null, 2));
      writeBackToJson(layoutJson, result, jsonPath);
    } catch (err) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(1);
    }
  } else {
    process.stderr.write('Usage: node controls_search.cjs <path-to-control-mapping.json>\n');
    process.exit(1);
  }
}

module.exports = { BM25, ControlMapper, stage4ControlPicking, writeBackToJson };
