import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const game = process.argv[2];
if (!game) throw new Error('Usage: node automation.mjs <Girl Life checkout> [node_modules directory]');
const modules = path.resolve(process.argv[3] || path.join(here, 'node_modules'));
const pkg = (name, file) => path.join(modules, '@qsp', name, 'dist', file);
const { initQspEngine } = await import(pathToFileURL(pkg('wasm-engine', 'wasm-engine.modern.js')));
const { readQsps, readQsp, writeQsp } = await import(pathToFileURL(pkg('converters', 'index.modern.js')));

// Grades, willpower, scheduling and manual Russian lessons run unchanged.
// Clock and peripheral scene services are isolated from the full game.
const fixtures = `# test_start
--- test_start ---
# time
if $ARGS[0] = 'get_time_string': $result = 'time' & exit
:carry
if minut >= 60: hour += 1 & minut -= 60 & jump 'carry'
if hour >= 24: hour -= 24 & daystart += 1 & jump 'carry'
--- time ---
# stat
gs 'time'
--- stat ---
# wrap
$result = $ARGS[1]
--- wrap ---
# exp_gain
--- exp_gain ---
# homes_properties
result = test_home
--- homes_properties ---
# money
if $ARGS[0] = 'can_afford': result = iif(test_cash >= ARGS[1], 1, 0)
if $ARGS[0] = 'pay': test_cash -= ARGS[1]
if $ARGS[0] = 'string_price': $result = '50 RUB'
--- money ---
# food
test_meals += 1
--- food ---
# uni_grounds
*clr & cla
if university['semester_week'] > 0: gs 'uni_lessons', 'schedule'
if university['exam_week'] > 0: gs 'uni_lessons', 'exam_schedule'
act 'Go to your room': gt 'uni_dorm'
--- uni_grounds ---
# gschool_lessonsev1
act 'Leave the lesson': gt 'test_hallway'
--- gschool_lessonsev1 ---
# test_hallway
--- test_hallway ---
`;
const upstream = ['grades', 'willpower', 'uni_lessons', 'uni_programs', 'gschool_lessons1'];
const parts = [fixtures, ...upstream.map(name => fs.readFileSync(path.join(game, 'locations', `${name}.qsrc`), 'utf8'))];
const modDir = path.resolve(here, '../locations');
const sourceLocations = fs.readdirSync(modDir).filter(f => f.endsWith('.qsrc')).sort()
  .map(f => fs.readFileSync(path.join(modDir, f), 'utf8')).join('\n');
const source = writeQsp(readQsps([...parts, sourceLocations].join('\n')));
const compiled = fs.readFileSync(path.resolve(here, '../glss.qsp'));
const binary = writeQsp([...readQsps(parts.join('\n')), ...readQsp(compiled.buffer.slice(compiled.byteOffset, compiled.byteOffset + compiled.length))]);
const wasm = fs.readFileSync(pkg('wasm-engine', 'qsp-engine.wasm'));
const api = await initQspEngine(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.length));
let actions = [];
let errors = [];
api.on('actions_changed', value => { actions = value; });
api.on('error', error => { errors.push(`${error.description} at ${error.location}:${error.line}`); });
const exec = code => { api.execCode(code); assert.deepEqual(errors, [], code); };
const value = name => api.readVariable(name);
const keyed = (name, key) => api.readVariableByKey(name, key);
const gain = subject => keyed('class', `school_${subject}_weekly_grade_gain`);
const uniGain = subject => keyed('class', `uni_nursing_semester_1_${subject}_weekly_grade_gain`);
const click = text => {
  const index = actions.findIndex(action => action.name.startsWith(text));
  assert.notEqual(index, -1, `Missing action: ${text}`);
  api.selectAction(index);
  api.execSelectedAction();
  assert.deepEqual(errors, []);
};
const setup = extra => exec(`killall & daystart = 100 & week = 1 & hour = 8 & pcs_stam = 100 & stammax = 100 & pcs_sleep = 100 & pcs_energy = 100 & pcs_hydra = 100 & pcs_mood = 100 & pcs_intel = 50 & pcs_chrsm = 80 & pcs_willpwr = 100 & willpowermax = 100 & pcs_compskl = 15 & pcs_vokal = 20 & pcs_instrmusic = 35 & pcs_artskls = 25 & pcs_hndiwrk = 45 & pcs_prcptn = 65 & $start_type['loc'] = 'sg' & university['student'] = 1 & university['enrolled_in_semester'] = 1 & university['semester_week'] = 3 & $university['enrolled_in'] = 'nursing' & ${extra || 'test_cash = 100'}`);
const tests = [];
const test = (name, body) => tests.push([name, body]);

test('school listening pays willpower, PE has attendance only, repeat is inert', () => {
  setup();
  exec("gs 'mod_glss_functions', 'day_grades', 0");
  assert.equal(gain('math'), 20);
  assert.equal(gain('pe'), 10);
  assert.equal(value('pcs_willpwr'), 70);
  exec("gs 'mod_glss_functions', 'day_grades', 0");
  assert.equal(gain('math'), 20);
  assert.equal(value('pcs_willpwr'), 70);
});
test('attendance-only and unaffordable listening give no bonus or cost', () => {
  for (const setting of ["glss['school_participation'] = 2", 'pcs_willpwr = 0']) {
    setup(setting);
    const before = value('pcs_willpwr');
    exec("gs 'mod_glss_functions', 'day_grades', 0");
    assert.equal(gain('math'), 10);
    assert.equal(value('pcs_willpwr'), before);
  }
});
test('academic traits halve or remove the real willpower cost', () => {
  for (const [trait, expected] of [[2, 2], [3, 0]]) {
    setup(`trait_vars['academic'] = ${trait}`);
    exec("test_attention = func('mod_glss_functions', 'pay_attention')");
    assert.equal(value('test_attention'), 1);
    assert.equal(value('pcs_willpwr'), 100 - expected);
  }
});
test('silent participation preserves the cost prepared by the current scene', () => {
  setup("glss['ghost_school'] = 1 & will_cost = 37");
  exec("gs 'mod_glss'");
  assert.equal(value('will_cost'), 37);
  exec("test_attention = func('mod_glss_functions', 'pay_attention')");
  assert.equal(value('will_cost'), 37);
});
test('active school bonuses use each subject skill or attribute', () => {
  for (const [subject, kind, stat] of [['comp','skill','pcs_compskl'], ['mus','skill','max(pcs_vokal, pcs_instrmusic)'], ['art','skill','pcs_artskls'], ['shop','skill','pcs_hndiwrk'], ['lit','attributes','pcs_prcptn'], ['rus','attributes','pcs_chrsm'], ['math','attributes','pcs_intel']]) {
    setup("glss['school_participation'] = 1");
    exec(`gs 'mod_glss_functions', 'school_activity', '${subject}'`);
    const actual = gain(subject);
    exec(`gs 'grades', 'class_activity_attributes', 'expected', '${subject}', pcs_intel & gs 'grades', 'class_activity_${kind}', 'expected', '${subject}', ${stat}`);
    assert.equal(actual, keyed('class', `expected_${subject}_weekly_grade_gain`), subject);
    assert.equal(value('pcs_willpwr'), 94);
  }
});
test('manual lesson keeps its scenes and replaces automated credit once', () => {
  setup("glss['school_participation'] = 1 & glss['ghost_school'] = 1 & $onnewloc = 'mod_glss'");
  exec("gs 'mod_glss'");
  assert.equal(gain('rus'), 33);
  const before = value('pcs_willpwr');
  exec("gt 'gschool_lessons1', 'russian'");
  assert.equal(gain('rus'), 10);
  assert.equal(value('pcs_willpwr'), before + 6);
  click('Listen attentively');
  click('Ask a question');
  click('Wait for the end');
  click('Leave the lesson');
  assert.equal(gain('rus'), 33);
  exec("gs 'mod_glss'");
  assert.equal(gain('rus'), 33);
});
test('homework and unrelated subjects do not cancel automated credit', () => {
  setup();
  exec("gs 'mod_glss_functions', 'day_grades', 0 & class['school_math_optional_weekly_grade_gain'] += 9 & gs 'grades', 'attend_class', 'school', 'comp' & gs 'mod_glss_functions', 'reconcile_grades'");
  assert.equal(gain('math'), 20);
  assert.equal(gain('comp'), 10);
});
test('partial school day excludes finished periods', () => {
  setup();
  exec("gs 'mod_glss_functions', 'day_grades', 4");
  assert.equal(gain('math'), 0);
  assert.equal(gain('eng'), 0);
  assert.equal(gain('art'), 20);
});
test('manual grade replacement preserves points earned before automation', () => {
  setup("class['school_math_weekly_grade_gain'] = 50");
  exec("gs 'mod_glss_functions', 'day_grades', 0 & gs 'grades', 'attend_class', 'school', 'math' & gs 'mod_glss'");
  assert.equal(gain('math'), 60);
});
test('reconciliation works with toggles off and ignores a new day', () => {
  setup();
  exec("gs 'mod_glss_functions', 'day_grades', 0 & gs 'grades', 'attend_class', 'school', 'math' & gs 'mod_glss'");
  assert.equal(gain('math'), 10);
  exec("daystart += 1 & gs 'grades', 'attend_class', 'school', 'rus' & gs 'mod_glss'");
  assert.equal(gain('rus'), 30);
  exec("gs 'mod_glss_functions', 'day_grades', 0");
  assert.equal(gain('math'), 30);
});
test('automated meal is charged once and resets the next day', () => {
  setup("glss['auto_lunch'] = 1 & test_cash = 100");
  exec("gs 'mod_glss_functions', 'auto_lunch' & gs 'mod_glss_functions', 'auto_lunch'");
  assert.equal(value('test_cash'), 50);
  assert.equal(value('test_meals'), 1);
  assert.equal(value('glss_temp_lunch'), 3);
  exec("daystart += 1 & gs 'mod_glss_functions', 'auto_lunch'");
  assert.equal(value('test_meals'), 2);
  assert.equal(value('test_cash'), 0);
});
test('free lunch and insufficient money', () => {
  setup("glss['auto_lunch'] = 1 & test_home = 1 & test_cash = 0");
  exec("gs 'mod_glss_functions', 'auto_lunch'");
  assert.equal(value('test_meals'), 1);
  setup("glss['auto_lunch'] = 1 & test_cash = 49");
  exec("gs 'mod_glss_functions', 'auto_lunch'");
  assert.equal(value('test_meals'), 0);
  assert.equal(keyed('glss', 'lunch_day'), 0);
});
test('the first game day can receive an automated meal', () => {
  setup("daystart = 0 & glss['auto_lunch'] = 1 & test_home = 1");
  exec("gs 'mod_glss_functions', 'auto_lunch'");
  assert.equal(value('test_meals'), 1);
});
test('ghost lunch waits for midday and cannot repeat through one-click lunch', () => {
  setup("glss['ghost_school'] = 1 & glss['auto_lunch'] = 1 & test_cash = 100");
  exec("gs 'mod_glss'");
  assert.equal(value('test_meals'), 0);
  exec("hour = 12 & gs 'mod_glss' & gs 'mod_glss_functions', 'auto_lunch'");
  assert.equal(value('test_meals'), 1);
  assert.equal(value('test_cash'), 50);
});
test('core university modes and insufficient willpower', () => {
  for (const [mode, will, expected, cost] of [[0,100,20,6], [1,100,33,6], [2,100,10,0], [1,0,10,0]]) {
    setup(`glss['uni_participation'] = ${mode} & pcs_willpwr = ${will}`);
    exec("gs 'mod_glss_uni_functions', 'credit_period', 'first' & gs 'mod_glss_uni_functions', 'credit_period', 'first'");
    assert.equal(uniGain('patient care 101'), expected);
    assert.equal(value('pcs_willpwr'), will - cost);
  }
});
test('university day follows lecture time and late arrivals skip missed periods', () => {
  for (const [hour, minute, first, end] of [[8,0,20,12], [10,15,0,12], [15,0,0,15]]) {
    setup(`hour = ${hour} & minut = ${minute} & glss['auto_uni'] = 1 & $onnewloc = 'mod_glss'`);
    exec("gt 'uni_grounds'");
    if (hour === 15) {
      assert.equal(actions.some(a => a.name.startsWith('GLSS:')), false);
    } else {
      click('GLSS:');
      assert.equal(uniGain('patient care 101'), first);
      assert.equal(value('hour'), end);
      assert.equal(value('minut'), 30);
    }
  }
});
test('unrelated Go to your actions do not trigger university automation', () => {
  setup("glss['auto_uni'] = 1 & university['semester_week'] = 0 & $onnewloc = 'mod_glss'");
  exec("gt 'uni_grounds' & act 'Go to your party': gt 'test_hallway'");
  exec("gs 'mod_glss'");
  assert.equal(actions.some(a => a.name.startsWith('GLSS:')), false);
});
test('class destination detection handles legacy code case', () => {
  setup();
  exec("cla & act 'A class': gt 'uni_lessons1', 'patient_care_101'");
  exec("test_match = func('mod_glss_uni_functions', 'has_class_action')");
  assert.equal(value('test_match'), 1);
});
test('Wednesday, nursing semester four and exam days keep their timelines', () => {
  for (const [state, hour, minute] of [
    ['week = 3',14,45],
    ["university['enrolled_in_semester'] = 4",12,30],
    ["week = 4 & university['semester_week'] = 0 & university['exam_week'] = 1",12,0],
  ]) {
    setup(`${state} & glss['auto_uni'] = 1 & $onnewloc = 'mod_glss'`);
    exec("gt 'uni_grounds'");
    click('GLSS:');
    assert.equal(value('hour'), hour);
    assert.equal(value('minut'), minute);
  }
});
test('elective actions respect the toggle and semester', () => {
  for (const enabled of [0,1]) {
    setup(`hour = 12 & minut = 10 & glss['auto_uni'] = 1 & glss['uni_electives'] = ${enabled} & $university['elective_semester_1_1'] = 'Art 101' & $onnewloc = 'mod_glss'`);
    exec("gt 'uni_grounds'");
    assert.equal(actions.some(a => a.name.startsWith('GLSS:')), Boolean(enabled));
    if (enabled) { click('GLSS:'); assert.equal(value('hour'), 14); assert.equal(value('minut'), 45); }
  }
  setup("university['semester_week'] = 0 & university['exam_week'] = 1 & $university['elective_semester_1_1'] = 'Art 101'");
  exec("gs 'mod_glss_uni_electives_functions', 'credit_elective'");
  assert.equal(keyed('uni_period', 'third'), 0);
});
test('exam automation marks completion without changing a failing grade', () => {
  setup("week = 4 & university['semester_week'] = 0 & university['exam_week'] = 1 & class['uni_nursing_semester_1_patient care 101_grade'] = 30");
  exec("gs 'mod_glss_uni_functions', 'credit_exam'");
  assert.equal(keyed('class', 'uni_nursing_semester_1_patient care 101_exam_done'), 1);
  assert.equal(keyed('class', 'uni_nursing_semester_1_patient care 101_grade'), 30);
});
test('completed exams still need a grade strictly above forty to pass', () => {
  for (const [grade, passed] of [[40,0],[41,1]]) {
    setup(`week = 1 & university['semester_week'] = 0 & university['exam_week'] = 2 & $class_list_institution[0] = 'uni_nursing_semester_1' & $class_list_name[0] = 'patient care 101' & class['uni_nursing_semester_1_patient care 101_grade'] = ${grade} & class['uni_nursing_semester_1_patient care 101_exam_done'] = 1`);
    exec("gs 'uni_lessons', 'cikl'");
    assert.equal(keyed('university', 'semester_passed'), passed);
    assert.equal(keyed('university', 'expelled'), 1 - passed);
  }
});

for (const [label, content] of [['source', source], ['compiled', binary]]) {
  for (const [name, body] of tests) {
    errors = [];
    api.openGame(content, true);
    assert.deepEqual(errors, []);
    body();
    console.log(`${label}: ${name}`);
  }
}
console.log(`${tests.length * 2} regression cases passed`);
